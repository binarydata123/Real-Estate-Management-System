import { Customer } from "../../models/Agent/CustomerModel.js";
import { User } from "../../models/Common/UserModel.js";
import bcrypt from "bcryptjs";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    // Validate required fields
    const { fullName, phoneNumber, agencyId } = req.body;

    if (!fullName || !phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Full name and phone number are required." });
    }

    // Add agencyId from the authenticated user if not provided
    const customerData = {
      ...req.body,
      agencyId: agencyId || req.user.agencyId._id
    };

    if (!customerData.agencyId) {
      return res.status(400).json({
        success: false, message: "Agency ID is required"
      });
    }

    // Check if customer with this phone number already exists for this agency
    const existingCustomer = await Customer.findOne({
      phoneNumber: customerData.phoneNumber,
      agencyId: customerData.agencyId,
    });

    if (existingCustomer) {
      return res.status(409).json({ // 409 Conflict is a suitable status code
        success: false,
        message: "This customer already exists in your agency.",
      });
    }

    const customer = new Customer(customerData);
    const savedCustomer = await customer.save();

    res.status(201).json({
      success: true,
      data: savedCustomer,
      message: "Customer has been successfully added.",
    });
    await createNotification({
      agencyId: savedCustomer.agencyId,
      userId: req.user._id,
      message: `A new customer lead (${savedCustomer.fullName}) has been created successfully.`,
      type: "new_lead",
    });

    // Send notifications to the newly created user if they exist
    if (savedCustomer) {
      await createNotification({
        userId: savedCustomer._id,
        message: `Welcome ${savedCustomer.name}! Your account has been created. You can now log in and get started.`,
        type: "welcome",
      });

      await sendPushNotification({
        userId: savedCustomer._id,
        title: "Welcome to Our Platform 🎉",
        message: `Hi ${savedCustomer.name}, your account has been created!`,
        urlPath: "/login",
      });
    }

    // Send notification to the agent/agency who created the customer
    await sendPushNotification({
      userId: req.user._id,
      title: "New Customer Lead",
      message: `A new customer "${savedCustomer.fullName}" has been added to your agency.`,
      urlPath: "/agent/customers",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const agencyId = req.user.agencyId._id;

    if (!agencyId) {
      return res
        .status(400)
        .json({ success: false, message: "User is not associated with an agency." });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const searchQuery = search
      ? {
        agencyId: agencyId,
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { whatsAppNumber: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
        ],
      }
      : { agencyId: agencyId };

    const totalCustomers = await Customer.countDocuments(searchQuery);

    const customers = await Customer.find(searchQuery)
      .sort({ _id: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    if (!customers || customers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No customers found",
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
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomersForDropDown = async (req, res) => {
  try {
    const agencyId = req.user.agencyId._id;

    if (!agencyId) {
      return res
        .status(400)
        .json({ success: false, message: "User is not associated with an agency." });
    }

    const customers = await Customer.find({ agencyId: agencyId });

    if (!customers || customers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No customers found",
        data: [],
      });
    }

    res.json({
      success: true,
      data: customers,
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
    const updatedUser = await User.findOneAndUpdate(
      { email: updatedCustomer.email },
      {
        name: updatedCustomer.fullName,
        email: updatedCustomer.email,
        phone: updatedCustomer.phoneNumber,
        agencyId: updatedCustomer.agencyId,
      },
      { new: true }
    );

    await createNotification({
      agencyId: updatedCustomer.agencyId,
      userId: updatedCustomer.agencyId,
      message: `Customer (${updatedCustomer.fullName}) has been updated successfully.`,
      type: "lead_updated",
    });

    await sendPushNotification({
      userId: updatedCustomer.agencyId,
      title: "Customer Updated",
      message: `Customer (${updatedCustomer.fullName}) has been updated successfully.`,
      urlPath: "customers",
    });

    if (updatedUser?._id) {
      await createNotification({
        userId: updatedUser._id,
        message: `Hello ${updatedUser.name}, your profile details have been updated successfully.`,
        type: "lead_updated",
      });

      await sendPushNotification({
        userId: updatedUser._id,
        title: "Profile Updated",
        message: `Hi ${updatedUser.name}, your profile details have been updated successfully.`,
        urlPath: "profile",
      });
    }

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
    await User.deleteOne({ email: deletedCustomer.email });

    res.json({
      success: true,
      message: "Customer and user deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
