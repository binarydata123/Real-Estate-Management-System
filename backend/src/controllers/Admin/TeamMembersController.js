import { User } from "../../models/Common/UserModel.js";
import { Agency } from "../../models/Agent/AgencyModel.js";
import { Customer } from "../../models/Agent/CustomerModel.js";
import { Property } from "../../models/Agent/PropertyModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";

// Get all properties
export const getTeamMembers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, agencyId } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const searchQuery = { role: "agent" };

        if (agencyId) {
            searchQuery.agencyId = agencyId;
        }

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

    const totalTeamMembers = await User.countDocuments(searchQuery);

    const teamMembers = await User.find(searchQuery)
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate('agencyId');

    // Attach properties and customers count for each agent
    const teamMembersWithCounts = await Promise.all(
      teamMembers.map(async (teamMember) => {
        let propertiesCount = 0;
        let customersCount = 0;

        if (teamMember.agencyId) {
          [propertiesCount, customersCount] = await Promise.all([
            Property.countDocuments({ agencyId: teamMember.agencyId._id }),
            Customer.countDocuments({ agencyId: teamMember.agencyId._id }),
          ]);
        }

        return {
          ...teamMember.toObject(),
          propertiesCount,
          customersCount,
        };
      })
    );

    if (!teamMembersWithCounts || teamMembersWithCounts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No team members found",
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
      data: teamMembersWithCounts,
      pagination: {
        total: totalTeamMembers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalTeamMembers / limitNumber),
      }
    });
  } catch (error) {
   return res.status(500).json({ success: false, message: error.message });
  }
};

// Update a customer
export const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTeamMember = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTeamMember) {
      return res
        .status(404)
        .json({ success: false, message: "Team Member not found" });
    }
    await createNotification({
      userId: updatedTeamMember.owner,
      message: `Team Member (${updatedTeamMember.name}) has been updated successfully.`,
      type: "lead_updated",
    });

    await sendPushNotification({
      userId: updatedTeamMember.owner,
      title: "Team Member Updated",
      message: `Team Member (${updatedTeamMember.name}) has been updated successfully.`,
      urlPath: "Team Member",
    });
   return res.json({ success: true, data: updatedTeamMember });
  } catch (error) {
    console.error("Error updating team member:", error);
  return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a customer
export const deleteTeamMember = async (req, res) => {
  try {
    const agentId = req.params.id;
    const deletedTeamMember = await User.findByIdAndDelete(agentId);
    if (!deletedTeamMember) {
      return res
        .status(404)
        .json({ success: false, message: "Team Member not found" });
    }
    await User.deleteOne({ _id: deletedTeamMember._id });

   return res.json({
      success: true,
      message: "Team Member deleted successfully",
    });
  } catch (error) {
   return res.status(400).json({ success: false, message: error.message });
  }
};
