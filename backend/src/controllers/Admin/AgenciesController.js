import { Agency } from "../../models/Agent/AgencyModel.js";
import { User } from "../../models/Common/UserModel.js";
import bcrypt from "bcryptjs";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";

// Get all agencies
export const getAgencies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Build the search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { status: { $regex: status, $options: "i" } },
          ],
        }
      : {};

    const totalAgencies = await Agency.countDocuments(searchQuery);

    const agency = await Agency.find(searchQuery)
      .sort({ _id: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate('properties');

    if (!agency || agency.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No agency found",
        data: [],
        pagination: {
          total: 0,
          page: pageNumber,
          limit: limitNumber,
          totalPages: 0,
        },
      });
    }

    res.json({
      success: true,
      data: agency,
      pagination: {
        total: totalAgencies,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalAgencies / limitNumber),
      },
      status: status
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// Update a customer
export const updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedAgency = await Agency.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedAgency) {
      return res
        .status(404)
        .json({ success: false, message: "Agency not found" });
    }
    // const updatedUser = await User.findOneAndUpdate(
    //   { email: updatedCustomer.email },
    //   {
    //     name: updatedCustomer.fullName,
    //     email: updatedCustomer.email,
    //     phone: updatedCustomer.phoneNumber,
    //     agencyId: updatedCustomer.agencyId,
    //   },
    //   { new: true }
    // );

    await createNotification({
      userId: updatedAgency.owner,
      message: `Agency (${updatedAgency.name}) has been updated successfully.`,
      type: "lead_updated",
    });

    await sendPushNotification({
      userId: updatedAgency.owner,
      title: "Agency Updated",
      message: `Agency (${updatedAgency.name}) has been updated successfully.`,
      urlPath: "Agency",
    });

    // if (updatedUser?._id) {
    //   await createNotification({
    //     userId: updatedUser._id,
    //     message: `Hello ${updatedUser.name}, your profile details have been updated successfully.`,
    //     type: "lead_updated",
    //   });

    //   await sendPushNotification({
    //     userId: updatedUser._id,
    //     title: "Profile Updated",
    //     message: `Hi ${updatedUser.name}, your profile details have been updated successfully.`,
    //     urlPath: "profile",
    //   });
    // }

    res.json({ success: true, data: updatedAgency });
  } catch (error) {
    console.error("Error updating agency:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a customer
export const deleteAgency = async (req, res) => {
  try {
    const agencyId = req.params.id;
    const deletedAgency = await Agency.findByIdAndDelete(agencyId);
    if (!deletedAgency) {
      return res
        .status(404)
        .json({ success: false, message: "Agency not found" });
    }
    await Agency.deleteOne({ _id: deletedAgency._id });

    res.json({
      success: true,
      message: "Agency deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
