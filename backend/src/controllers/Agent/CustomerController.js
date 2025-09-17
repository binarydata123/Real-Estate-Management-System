import { Customer } from "../../models/Agent/CustomerModel.js";
import { User } from "../../models/Common/UserModel.js";
import bcrypt from "bcryptjs";

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const savedCustomer = await customer.save();
    const defaultPassword = "Pa$$w0rd!";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 3. Create corresponding User entry
    const user = new User({
      name: savedCustomer.fullName,
      email: savedCustomer.email,
      phone: savedCustomer.phoneNumber,
      password: hashedPassword,
      role: "customer",
      agencyId: savedCustomer.agencyId,
      status: "active",
    });

    await user.save();
    res.status(201).json({
      success: true,
      data: savedCustomer,
      message: "Customer has been successfully added.",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const { userId, page = 1, limit = 10, search } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const searchQuery = search
      ? {
          agencyId: userId,
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { whatsAppNumber: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
          ],
        }
      : { agencyId: userId };

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
    await User.findOneAndUpdate(
      { email: updatedCustomer.email },
      {
        name: updatedCustomer.fullName,
        email: updatedCustomer.email,
        phone: updatedCustomer.phoneNumber,
        agencyId: updatedCustomer.agencyId,
      },
      { new: true }
    );
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
