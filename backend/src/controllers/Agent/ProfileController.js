import { Agency } from "../../models/Agent/AgencyModel.js";
import { User } from "../../models/Common/UserModel.js";

export const getAgentProfile = async (req, res) => {
  try {
    const agentId = req.query.id;
    const owner = await Agency.findOne({ owner: agentId }).populate("owner");
    if (!owner) {
      const member = await User.findOne({ _id: agentId }).populate(
        "agencyId",
        "name"
      );
      if (member) {
        return res.status(200).json({
          success: true,
          data: {
            owner: {
              name: member.name,
              email: member.email,
              role: member.role,
            },
            name: member.agencyId.name,
            whatsAppNumber: member.whatsAppNumber || "",
          },
          message: "Agent Profile fetched successfully",
        });
      }
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }
    return res.status(200).json({
      success: true,
      data: owner,
      message: "Agent Profile fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const updateAgentProfile = async (req, res) => {
  try {
    const userId = req.query?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    const { fullName, email, whatsapp, agencyName } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required.",
      });
    }

    // Find agency by owner
    const agency = await Agency.findOne({ owner: userId }).populate("owner");
    if (!agency) {
      const member = await User.findOne({ _id: userId });
      if (member) {
        await User.findByIdAndUpdate(member?._id, {
          name: fullName,
        });
        if (whatsapp) member.whatsAppNumber = whatsapp;
        await member.save();
        return res.status(200).json({
          success: true,
          message: "Profile updated successfully.",
        });
      }
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    await User.findByIdAndUpdate(agency.owner._id, {
      name: fullName,
      email,
    });

    // Update agency-specific fields
    if (whatsapp) agency.whatsAppNumber = whatsapp;
    if (agencyName) agency.name = agencyName;
    await agency.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating profile.",
    });
  }
};
