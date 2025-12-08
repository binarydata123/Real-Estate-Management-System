import { Customer } from "../../models/Agent/CustomerModel.js";
import CustomerSettings from "../../models/Customer/SettingsModel.js";

export const getCustomerSettings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find by userId instead of _id
    let customer = await CustomerSettings.findOne({ userId });

    // If not found, create default settings
    if (!customer) {
      customer = await CustomerSettings.create({ userId });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer settings:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateCustomerSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body || {};

    const currentCustomer = await Customer.findById(userId);

    if (!currentCustomer) {
      return res.json({
        success: false,
        message: "Customer Not Found",
      });
    }

    const allCustomerIds = await Customer.find({
      phoneNumber: currentCustomer.phoneNumber,
    });

    if (updateData?.security?.twoFactorAuth !== undefined) {
      const twoFactorValue = updateData?.security?.twoFactorAuth;
      for (const customer of allCustomerIds) {
        await CustomerSettings.findOneAndUpdate(
          {userId : customer._id},
          { $set: {"security.twoFactorAuth" : twoFactorValue}},
          { upsert : true},
        );
      }
    }

    // Find existing settings by userId
    let customer = await CustomerSettings.findOne({ userId });

    // If no settings → create new with incoming data merged into defaults
    if (!customer) {
      customer = new CustomerSettings({
        userId,
        ...updateData, // apply user-sent values to default schema
      });

      await customer.save();

      return res.status(200).json({
        success: true,
        message: "Customer settings created successfully",
        data: customer,
      });
    }

    // Deep merge logic for updating existing settings
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

    // Convert Mongoose doc → plain object
    const currentData = customer.toObject();

    // Merge new updates
    const mergedData = deepMerge(currentData, updateData);

    // Assign merged data back into the model
    Object.assign(customer, mergedData);

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer settings updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer settings:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
