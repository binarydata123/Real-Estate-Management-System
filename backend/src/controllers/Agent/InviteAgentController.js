import { User } from "../../models/Common/UserModel.js";
import { Agency } from "../../models/Agent/AgencyModel.js";
import bcrypt from "bcryptjs";

export const inviteAgent = async (req, res) => {
  try {
    const { name, phone, email, code, message, agencyId } = req.body;
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
      message,
      code,
      role: "agent",
      password: hashedPassword,
      agencyId: agencyId,
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

    return res.status(201).json({
      message: "Agent invited successfully",
      user: newUser,
      agency,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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

export const getTeamMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyMembers = await Agency.find(
      { owner: userId },
      { teamMembers: 1, _id: 0 }
    )
      .sort({ createdAt: -1 })
      .populate({ path: "teamMembers", select: "-password" });
    const [teamMembers] = agencyMembers;
    res.status(200).json({
      data: teamMembers,
      message: "Team Members fetched",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const memberId = req.params.id;

    const agency = await Agency.findOne({ owner: userId });

    if (!agency) {
      return res.status(404).json({
        success: false,
        message: "Agency not found",
      });
    }

    // Check if member exists in the team
    if (!agency.teamMembers.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Member not part of this agency",
      });
    }
    // Remove member
    const updatedAgency = await Agency.findOneAndUpdate(
      { owner: userId },
      { $pull: { teamMembers: memberId } },
      { new: true }
    ).populate({
      path: "teamMembers",
      select: "-password",
    });
    await User.findByIdAndDelete(memberId);

    return res.status(200).json({
      success: true,
      message: "Team member removed successfully",
      data: { teamMembers: updatedAgency.teamMembers },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const { name, phone, email, role, status, message, memberId } = req.body;
    const agencyId = req.user.agencyId._id;

    // 1. Find the agent
    const agent = await User.findById(memberId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // 2. Check if agent belongs to this agency
    const agency = await Agency.findById(agencyId);
    if (!agency || !agency.teamMembers.includes(memberId)) {
      return res.status(403).json({
        success: false,
        message: "Agent does not belong to this agency",
      });
    }

    // 3. Check if email exists on another user
    if (email) {
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser._id.toString() !== memberId) {
        return res.status(400).json({
          success: false,
          message: "Email is already used by another user",
        });
      }
    }

    // 4. Update agent
    agent.name = name ?? agent.name;
    agent.phone = phone ?? agent.phone;
    agent.email = email ?? agent.email;
    agent.email = email ?? agent.email;
    agent.message = message ?? agent.message;
    agent.status = status ?? agent.status;

    const updatedAgent = await agent.save();

    return res.status(200).json({
      success: true,
      message: "Agent updated successfully",
      data: updatedAgent,
    });
  } catch (error) {
    console.error("Update Agent Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
