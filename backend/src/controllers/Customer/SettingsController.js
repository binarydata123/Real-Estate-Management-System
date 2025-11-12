import CustomerSettings from "../../models/Customer/SettingsModel.js";

export const getCustomerSettings = async (req, res) => {
  try {
    const { _id: customerId } = req.user;

    // Try to find existing settings
    let customer = await CustomerSettings.findById(customerId);

    // If not found, create default settings
    if (!customer) {
      const defaultDoc = new CustomerSettings({ _id: customerId });
      customer = await defaultDoc.save();
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer settings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCustomerSettings = async (req, res) => {
  try {
    const { _id: customerId } = req.user;
    let updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      updateData = {};
    }

    // Find or create settings
    let customer = await CustomerSettings.findById(customerId);

    if (!customer) {
      // Create with default values
      const defaultDoc = new CustomerSettings({ _id: customerId });
      customer = await defaultDoc.save();
    }

    // Deep merge logic (same as before)
    const deepMerge = (target, source) => {
      if (!source || typeof source !== "object") return target;
      for (const key of Object.keys(source)) {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
          target[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    };

    const mergedData = deepMerge(customer.toObject(), updateData);
    Object.assign(customer, mergedData);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer settings updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer settings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};