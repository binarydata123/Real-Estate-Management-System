import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Agency } from "../../models/Agent/AgencyModel.js";
import { User } from "../../models/Common/UserModel.js";
import generateToken from "../../utils/generateToken.js";
import { Notification } from "../../models/Common/NotificationModel.js";

const registrationController = {
  registerAgency: async (req, res) => {
    const { fullName, email, password, agencyName, agencySlug, phone } =
      req.body;

    // Basic validation
    if (!fullName || !email || !password || !agencyName || !agencySlug) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Check for existing user or agency
      const userExists = await User.findOne({ email }).session(session);
      if (userExists) {
        throw new Error("User with this email already exists.");
      }

      const agencySlugExists = await Agency.findOne({
        slug: agencySlug,
      }).session(session);
      if (agencySlugExists) {
        throw new Error("Agency with this URL slug already exists.");
      }

      // Hash password before creating user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 2. Create the user (agency)
      const user = new User({
        name: fullName,
        email,
        password: hashedPassword,
        phone,
        role: "agency",
      });
      const createdUser = await user.save({ session });

      // 3. Create the agency
      const agency = new Agency({
        name: agencyName,
        slug: agencySlug,
        owner: createdUser._id,
        email: email, // Using the admin's email as the agency's contact email
        phone: phone,
        teamMembers: [createdUser._id],
      });
      const createdAgency = await agency.save({ session });

      // 4. Link the agency back to the user
      createdUser.agencyId = createdAgency._id;
      await createdUser.save({ session });

      // 5. Create a welcome notification
      const notification = new Notification({
        userId: createdUser._id,
        agencyId: createdAgency._id,
        message: `Welcome to ${agencyName}! Your agency is set up and ready to go.`,
        type: "welcome",
        link: "/dashboard", // Optional: link to the dashboard
      });
      await notification.save({ session });

      // 6. Commit the transaction
      await session.commitTransaction();

      // 7. Respond with success and token
      res.status(201).json({
        message: "Agency registration successful! You can now log in.",
        token: generateToken(createdUser._id),
        user: {
          _id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
        },
        agency: {
          _id: createdAgency._id,
          name: createdAgency.name,
          slug: createdAgency.slug,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({
        message: error.message || "Server error during registration.",
      });
    } finally {
      session.endSession();
    }
  },

  loginUser: async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    try {
      // Find user by email and include password field
      const user = await User.findOne({ email })
        .select("+password")
        .populate("agencyId", "name slug email phone logoUrl");
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Compare provided password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Successful login
      res.json({
        message: "Login successful!",
        token: generateToken(user._id, user.role), // Keep token at top level
        user: {
          // Nest all user-related data under a 'user' object for consistency
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          agency: user.agencyId
            ? {
              _id: user.agencyId._id,
              name: user.agencyId.name,
              slug: user.agencyId.slug,
              email: user.agencyId.email,
              phone: user.agencyId.phone,
              logoUrl: user.agencyId.logoUrl,
            }
            : null,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error during login." });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      // if email found then send email
    } catch (error) {
      res.status(500).json({ message: "Server error during password reset." });
    }
  },

  checkSession: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate(
        "agencyId",
        "name slug email phone logoUrl"
      );

      if (!user) {
        // This should not happen if the token is valid, but as a safeguard:
        return res
          .status(404)
          .json({ message: "User associated with this session not found." });
      }

      res.status(200).json({
        message: "Session active.",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          agency: user.agencyId
            ? {
              _id: user.agencyId._id,
              name: user.agencyId.name,
              slug: user.agencyId.slug,
              email: user.agencyId.email,
              phone: user.agencyId.phone,
              logoUrl: user.agencyId.logoUrl,
            }
            : null,
        },
      });
    } catch (error) {
      // This catch block is for unexpected errors within this controller.
      console.error("Session check controller error:", error);
      res.status(500).json({ message: "Server error during session check." });
    }
  },
};

export default registrationController;
