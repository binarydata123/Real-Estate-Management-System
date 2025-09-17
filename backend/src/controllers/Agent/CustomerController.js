import { Customer } from "../../models/Agent/CustomerModel.js";

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const savedCustomer = await customer.save();
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
          ],
        }
      : { agencyId: userId };

    const totalCustomers = await Customer.countDocuments(searchQuery);

    const customers = await Customer.find(searchQuery)
      .sort({ _id: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

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
// Get a single customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "agencyId",
      "name"
    );
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
    }).populate("agencyId", "name");

    if (!updatedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
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
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
