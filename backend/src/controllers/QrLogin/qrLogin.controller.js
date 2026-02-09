import crypto from "crypto";
import jwt from "jsonwebtoken";
import QrLoginSession from "../../models/QrLogin/QrLoginSession.js";
import { User } from "../../models/Common/UserModel.js";
import { Customer } from "../../models/Agent/CustomerModel.js";

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * 1. CREATE QR
 * New device requests QR token
 */
export const createQr = async (req, res) => {
  try {
    const token = crypto.randomUUID();

    await QrLoginSession.create({
      token,
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
    });

    return res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("createQr error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 2. APPROVE QR
 * Logged-in device approves login
 */
export const approveQr = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;
    const role = req.user.role;
    const token = code;
    const session = await QrLoginSession.findOne({
      token,
      status: "pending",
    });
    if (!session || session.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "QR expired or already used",
      });
    }

    session.status = "approved";
    session.approvedBy = userId;
    session.role = role;
    session.approvedAt = new Date();

    await session.save();

    return res.json({ success: true });
  } catch (error) {
    console.error("approveQr error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 3. CHECK QR STATUS
 * New device polls for approval
 */
export const checkQrStatus = async (req, res) => {
  try {
    const { token } = req.params;

    const session = await QrLoginSession.findOne({ token });
    if (!session) {
      return res.json({ success: false });
    }

    if (session.expiresAt < new Date()) {
      return res.json({ success: false, expired: true });
    }

    if (session.status === "consumed") {
      return res.json({
        success: false,
        message: "QR already used",
      });
    }

    if (session.status !== "approved") {
      return res.json({
        success: true,
        approved: false,
      });
    }

    if (!session.approvedBy) {
      return res.json({ success: false });
    }

    let account = null;

    // 🔹 Handle role-based lookup
    if (session.role === "customer") {
      account = await Customer.findById(session.approvedBy).populate(
        "agencyId",
        "name slug email phone logoUrl owner"
      );
    } else {
      account = await User.findById(session.approvedBy).populate(
        "agencyId",
        "name slug email phone logoUrl owner"
      );
    }

    if (!account) {
      return res.json({
        success: false,
        message: "Approved account not found",
      });
    }

    // Generate JWT
    const tokenJwt = generateToken(account._id, session.role);

    // Mark session consumed
    session.status = "consumed";
    session.consumedAt = new Date();
    await session.save();

    // Response
    return res.json({
      success: true,
      message: "Login successful!",
      token: tokenJwt,
      user: {
        _id: account._id,
        name: account.name || account.fullName,
        email: account.email,
        role: session.role,
        profilePictureUrl: account.profilePictureUrl || null,
        agency: account.agencyId
          ? {
              _id: account.agencyId._id,
              name: account.agencyId.name,
              slug: account.agencyId.slug,
              email: account.agencyId.email,
              phone: account.agencyId.phone,
              logoUrl: account.agencyId.logoUrl,
              owner: account.agencyId.owner,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("checkQrStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};