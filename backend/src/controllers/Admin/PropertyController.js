import { Property } from "../../models/Agent/PropertyModel.js";
import { Agency } from "../../models/Agent/AgencyModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";


// Get all properties
export const getProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, agencyId } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const searchQuery = {};

    if (agencyId) {
      searchQuery.agencyId = agencyId;
    }

    if (search || status) {
      searchQuery.$or = [];

      if (search && typeof search === "string") {
        const agencies = await Agency.find({
          $or: [{ name: { $regex: search, $options: "i" } }],
        }).select("_id");

        const agencyIds = agencies.map((a) => a._id);

        searchQuery.$or.push(
          { title: { $regex: search, $options: "i" } },
          { type: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { owner_name: { $regex: search, $options: "i" } },
          { agencyId: { $in: agencyIds } }
        );
      }

      if (status && typeof status === "string") {
        searchQuery.$or.push({ status: { $regex: status, $options: "i" } });
      }
    }

    const totalProperties = await Property.countDocuments(searchQuery);

    const property = await Property.find(searchQuery)
      .sort({ _id: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate({
        path: "agencyId",
        select: "name email phone status logoUrl", // pick the fields you need
      });

    if (!property || property.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No property found",
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
      data: property,
      pagination: {
        total: totalProperties,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalProperties / limitNumber),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update a customer
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProperty = await Property.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProperty) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    await createNotification({
      userId: updatedProperty.owner,
      message: `Property (${updatedProperty.name}) has been updated successfully.`,
      type: "lead_updated",
    });
      await sendPushNotification({
        userId: updatedProperty.owner,
        title: "Property Updated",
        message: `Property (${updatedProperty.name}) has been updated successfully.`,
        urlPath: "Property",
      });
    return res.json({ success: true, data: updatedProperty });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a customer
export const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const deletedProperty = await Property.findByIdAndDelete(propertyId);
    if (!deletedProperty) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    await Property.deleteOne({ _id: deletedProperty._id });

    return res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
