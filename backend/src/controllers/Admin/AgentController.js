import { User } from "../../models/Common/UserModel.js";
import { Agency } from "../../models/Agent/AgencyModel.js";
import { Customer } from "../../models/Agent/CustomerModel.js";
import { Property } from "../../models/Agent/PropertyModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";

// Get all properties
export const getAgents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const searchQuery = { role: "agent" };

    if (search || status) {
      searchQuery.$or = [];

      if (search && typeof search === "string") {
        const agencies = await Agency.find({
            $or: [
                { name: { $regex: search, $options: "i" } }
            ]
        }).select("_id");

        const agencyIds = agencies.map(a => a._id);
        searchQuery.$or.push(
            { name: { $regex: search, $options: "i" }},
            //{ email: {$regex: search, $options: "i"}},
            { phone: {$regex: search, $options: "i"}},
            { agencyId: { $in: agencyIds } }
        );
      }

      if (status && typeof status === "string") {
        searchQuery.$or.push({ status: { $regex: status, $options: "i" } });
      }
    }

    const totalAgents = await User.countDocuments(searchQuery);

    const agents = await User.find(searchQuery)
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate('agencyId');

    // Attach properties and customers count for each agent
    const agentsWithCounts = await Promise.all(
      agents.map(async (agent) => {
        let propertiesCount = 0;
        let customersCount = 0;

        if (agent.agencyId) {
          [propertiesCount, customersCount] = await Promise.all([
            Property.countDocuments({ agencyId: agent.agencyId._id }),
            Customer.countDocuments({ agencyId: agent.agencyId._id }),
          ]);
        }

        return {
          ...agent.toObject(),
          propertiesCount,
          customersCount,
        };
      })
    );

    if (!agentsWithCounts || agentsWithCounts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No agents found",
        data: [],
        pagination: {
          total: 0,
          page: pageNumber,
          limit: limitNumber,
          totalPages: 0,
        },
      });
    }

    return res.json({
      success: true,
      data: agentsWithCounts,
      pagination: {
        total: totalAgents,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalAgents / limitNumber),
      }
    });
  } catch (error) {
   return res.status(500).json({ success: false, message: error.message });
  }
};

// Update a customer
export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedAgent = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedAgent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }
    await createNotification({
      userId: updatedAgent.owner,
      message: `Agent (${updatedAgent.name}) has been updated successfully.`,
      type: "lead_updated",
    });

    await sendPushNotification({
      userId: updatedAgent.owner,
      title: "Agent Updated",
      message: `Agent (${updatedAgent.name}) has been updated successfully.`,
      urlPath: "Agent",
    });
   return res.json({ success: true, data: updatedAgent });
  } catch (error) {
    console.error("Error updating agent:", error);
  return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a customer
export const deleteAgent = async (req, res) => {
  try {
    const agentId = req.params.id;
    const deletedAgent = await User.findByIdAndDelete(agentId);
    if (!deletedAgent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }
    await User.deleteOne({ _id: deletedAgent._id });

   return res.json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
   return res.status(400).json({ success: false, message: error.message });
  }
};
