import { Property } from "../../models/Agent/PropertyModel.js";
import { Notification } from "../../models/Common/NotificationModel.js";
import { sendPushNotification } from "../../utils/pushService.js";
import AgencySettings from "../../models/Agent/settingsModel.js";

// Utility: Convert invalid numbers to null
const cleanNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  if (value === "NaN") return null;
  if (typeof value === "number" && Number.isNaN(value)) return null;
  if (typeof value === "string" && isNaN(Number(value))) return null;
  return Number(value);
};

// Clean payload numbers dynamically
const cleanPayloadNumbers = (payload) => {
  const numberFields = [
    "price",
    "built_up_area",
    "carpet_area",
    "plot_front_area",
    "plot_depth_area",
    "washrooms",
    "cabins",
    "conference_rooms",
    "floor_number",
    "total_floors",
    "bedrooms",
    "bathrooms",
    "balconies",
  ];

  numberFields.forEach((field) => {
    if (payload[field] !== undefined) {
      payload[field] = cleanNumber(payload[field]);
    }
  });

  return payload;
};

// Convert form-data arrays
const ensureArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export const createProperty = async (req, res) => {
  try {
    const payload = cleanPayloadNumbers({ ...req.body });

    const files = req.files || [];

    const imageEntries = files.map((file, index) => ({
      url: file.filename,
      alt: file.originalname,
      isPrimary: index === 0,
    }));

    // Clean arrays
    payload.water_source = ensureArray(payload.water_source);
    payload.amenities = ensureArray(payload.amenities);
    payload.features = ensureArray(payload.features);

    // Use agencyId from authenticated user if not supplied
    if (Array.isArray(payload.agencyId)) {
      payload.agencyId = payload.agencyId[0];
    }

    if (!payload.agencyId && req.user?.agencyId?._id) {
      payload.agencyId = req.user.agencyId._id;
    }

    if (!payload.agencyId) {
      return res.status(400).json({
        success: false,
        message: "Agency information is missing.",
      });
    }

    const propertyData = {
      ...payload,
      images: imageEntries,
      property_code:
        payload.property_code ||
        `PROP-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`,
    };

    const property = new Property(propertyData);
    const savedProperty = await property.save();

    const agencySettings = await AgencySettings.findOne({
      userId: req.user._id,
    });

    if (agencySettings?.notifications?.propertyUpdates) {
      await Notification.create({
        userId: req.user._id,
        agencyId: savedProperty.agencyId,
        message: `New property "${savedProperty.title}" was added.`,
        type: "property_added",
        link: `/agent/properties/view/${savedProperty._id}`,
      });
    }

    if (agencySettings?.notifications?.pushNotifications)
      await sendPushNotification({
        userId: req.user._id,
        title: "New Property Added",
        message: `A new property "${savedProperty.title}" has been successfully added.`,
        urlPath: `/agent/properties/view/${savedProperty._id}`,
      });

    return res.status(201).json({
      success: true,
      message: "Property created successfully.",
      data: savedProperty,
    });
  } catch (error) {
    console.error("Error creating property:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "An internal server error occurred.",
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const payload = cleanPayloadNumbers({ ...req.body });

    const files = req.files || [];
    const { id: propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found." });
    }

    // Convert repeating fields
    payload.water_source = ensureArray(payload.water_source);
    payload.amenities = ensureArray(payload.amenities);
    payload.features = ensureArray(payload.features);

    if (Array.isArray(payload.agencyId)) {
      payload.agencyId = payload.agencyId[0];
    }

    // Handle new images
    const newImageEntries = files.map((file) => ({
      url: file.filename,
      alt: file.originalname,
      isPrimary: false,
    }));

    // Existing images to keep
    const existingImageFilenames = ensureArray(payload.existingImages);

    const keptImages = property.images.filter((img) =>
      existingImageFilenames.includes(img.url)
    );

    const allImages = [...keptImages, ...newImageEntries];

    // Primary image logic
    let primarySet = false;

    if (allImages.length > 0) {
      const primaryId = payload.primaryImageIdentifier;

      allImages.forEach((img) => {
        if (
          !primarySet &&
          primaryId &&
          (img.url === primaryId || img.alt === primaryId)
        ) {
          img.isPrimary = true;
          primarySet = true;
        } else {
          img.isPrimary = false;
        }
      });

      if (!primarySet) allImages[0].isPrimary = true;
    }

    payload.images = allImages;

    delete payload.existingImages;
    delete payload.primaryImageIdentifier;

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      payload,
      { new: true, runValidators: true }
    );

    const agencySettings = await AgencySettings.findOne({
      userId: req.user._id,
    });

    if (agencySettings?.notifications?.propertyUpdates)
      await Notification.create({
        userId: req.user._id,
        agencyId: updatedProperty.agencyId,
        message: `Property "${updatedProperty.title}" was updated.`,
        type: "property_updated",
        link: `/agent/properties/view/${updatedProperty._id}`,
      });

    if (agencySettings?.notifications?.pushNotifications)
      await sendPushNotification({
        userId: req.user._id,
        title: "Property Updated",
        message: `The property "${updatedProperty.title}" has been successfully updated.`,
        urlPath: `/agent/properties/view/${updatedProperty._id}`,
      });

    return res.status(200).json({
      success: true,
      message: "Property updated successfully.",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "An internal server error occurred.",
    });
  }
};

export const getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    return res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("Error fetching property:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getProperties = async (req, res) => {
  try {
    const {
      title,
      status,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      // New filters from frontend
      type,
      category,
      unit_area_type,
      facing,
      is_corner_plot,
      plot_dimension_unit,
      rera_status,
      transaction_type,
    } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // 🔹 Build filter
    const filter = { agencyId: req.user.agencyId._id };

    // 🔹 Flexible search (title, description, location, etc.)
    if (title && title.trim() !== "") {
      filter.$or = [
        { title: { $regex: title.trim(), $options: "i" } },
        { description: { $regex: title.trim(), $options: "i" } },
        { location: { $regex: title.trim(), $options: "i" } },
      ];
    }

    // 🔹 Status filter
    if (status && status.trim() !== "") {
      filter.status = status;
    }

    // 🔹 Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 🔹 Add new filters
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (unit_area_type) filter.unit_area_type = unit_area_type;
    if (facing) filter.facing = facing;
    if (plot_dimension_unit) filter.plot_dimension_unit = plot_dimension_unit;
    if (rera_status) filter.rera_status = rera_status;
    if (transaction_type) filter.transaction_type = transaction_type;

    // Handle boolean filter
    if (is_corner_plot !== undefined) {
      //filter.is_corner_plot = is_corner_plot === "true";
      filter.is_corner_plot = is_corner_plot;
    }

    // 🔹 Fetch data
    const [properties, total] = await Promise.all([
      Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Property.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Properties fetched successfully",
      data: properties,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }
    const agencySettings = await AgencySettings.findOne({
      userId: req.user._id,
    });
    if (agencySettings?.notifications?.propertyUpdates)
      await Notification.create({
        userId: req.user._id,
        agencyId: property.agencyId,
        message: `Property "${property.title}" was deleted.`,
        type: "property_deleted",
        link: `/agent/properties/view/${property._id}`,
      });

    if (agencySettings?.notifications?.pushNotifications)
      await sendPushNotification({
        userId: req.user._id,
        title: "Property Deleted",
        message: `The property "${property.title}" has been successfully deleted.`,
        urlPath: `/agent/properties/view/${property._id}`,
      });

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting property:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};
