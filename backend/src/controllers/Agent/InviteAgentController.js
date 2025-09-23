import { User } from "../../models/Common/UserModel.js";
import { Agency } from "../../models/Agent/AgencyModel.js";
import bcrypt from "bcryptjs";

export const inviteAgent = async (req, res) => {
  try {
    const { name, phone, email, code, agencyId } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // Check if email already exists
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(409) // Conflict
          .json({ message: "A user with this email already exists." });
      }
    }

    // Hash static password
    const hashedPassword = await bcrypt.hash("Pa$$w0rd!", 10);

    const newUser = await User.create({
      name,
      phone,
      email,
      code,
      role: "agent",
      password: hashedPassword,
    });

    // Add agent to the agency team
    const agency = await Agency.findByIdAndUpdate(
      { _id: agencyId },
      { $push: { teamMembers: newUser._id } },
      { new: true }
    );

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    res.status(201).json({
      message: "Agent invited successfully",
      user: newUser,
      agency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" }).populate(
      "agencyId",
      "name"
    );
    res.status(200).json({ agents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
