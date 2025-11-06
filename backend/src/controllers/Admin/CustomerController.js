import { Customer } from "../../models/Agent/CustomerModel.js";
import { Agency } from "../../models/Agent/AgencyModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";

// Get all properties
export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, agencyId } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    let searchQuery = {};

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
            { fullName: { $regex: search, $options: "i" }}, 
            //{ email: {$regex: search, $options: "i"}}, 
            { phoneNumber: {$regex: search, $options: "i"}},
            { owner_name: {$regex: search, $options: "i"}},
            { agencyId: { $in: agencyIds } }
        );
      }

      if (status && typeof status === "string") {
        searchQuery.$or.push({ status: { $regex: status, $options: "i" } });
      }
    }

    const totalCustomers = await Customer.countDocuments(searchQuery);

    const customers = await Customer.find(searchQuery)
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate('agencyId');

    if (!customers || customers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No customer found",
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
      data: customers,
      pagination: {
        total: totalCustomers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCustomers / limitNumber),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    
    await createNotification({
      userId: updatedCustomer.owner,
      message: `Customer (${updatedCustomer.name}) has been updated successfully.`,
      type: "lead_updated",
    });

    await sendPushNotification({
      userId: updatedCustomer.owner,
      title: "Customer Updated",
      message: `Customer (${updatedCustomer.name}) has been updated successfully.`,
      urlPath: "Customer",
    });
    res.json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);
    if (!deletedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    await Customer.deleteOne({ _id: deletedCustomer._id });

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
