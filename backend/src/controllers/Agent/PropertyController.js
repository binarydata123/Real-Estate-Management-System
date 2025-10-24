import { Property } from "../../models/Agent/PropertyModel.js";
import { Notification } from "../../models/Common/NotificationModel.js";
import { sendPushNotification } from "../../utils/pushService.js";

export const createProperty = async (req, res) => {
  try {
    const { body } = req;
    const files = req.files || [];
    let imageEntries;
    if(files){
      imageEntries = files.map((file, index) => ({
        url: file.filename,
        alt: file.originalname,
        isPrimary: index === 0, // Set the first image as primary by default
      }));
    }

    // Prepare property data, converting types where necessary from multipart/form-data
    const propertyData = {
      ...body,
      price: Number(body.price),
      built_up_area: body.built_up_area
        ? Number(body.built_up_area)
        : undefined,
      carpet_area: body.carpet_area ? Number(body.carpet_area) : undefined,
      bedrooms: body.bedrooms ? Number(body.bedrooms) : undefined,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : undefined,
      washrooms: body.washrooms ? Number(body.washrooms) : undefined,
      balconies: body.balconies ? Number(body.balconies) : undefined,
      cabins: body.cabins ? Number(body.cabins) : undefined,
      conference_rooms: body.conference_rooms
        ? Number(body.conference_rooms)
        : undefined,
      floor_number: body.floor_number ? Number(body.floor_number) : undefined,
      total_floors: body.total_floors ? Number(body.total_floors) : undefined,

      // Convert string boolean to actual boolean
      //gated_community: body.gated_community === "true",
      gated_community: body.gated_community,

      // Add processed image info
      images: imageEntries,
      property_code:
        body.property_code ||
        `PROP-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`,
    };

    // Handle case where multipart/form-data sends a field as an array.
    // This can happen if the client-side form accidentally appends the same field multiple times.
    if (Array.isArray(propertyData.agencyId)) {
      propertyData.agencyId = propertyData.agencyId[0];
    }

    // Get agencyId from the authenticated user if not provided in the request
    if (!propertyData.agencyId && req.user && req.user.agencyId._id) {
      propertyData.agencyId = req.user.agencyId._id;
    }

    // The 'agency' field is expected to be in the body from the frontend or from authenticated user
    if (!propertyData.agencyId) {
      return res
        .status(400)
        .json({ success: false, message: "Agency information is missing." });
    }

    const property = new Property(propertyData);
    const savedProperty = await property.save();

    // Create a notification for the agency
    await Notification.create({
      userId: req.user._id,
      agencyId: savedProperty.agencyId,
      message: `New property "${savedProperty.title}" was added.`,
      type: "property_added",
      link: `/agent/properties/view/${savedProperty._id}`, // A potential link to view the property
    });

    // Send push notification to the agency admin/agent who created it
    await sendPushNotification({
      userId: req.user._id,
      title: "New Property Added",
      message: `A new property "${savedProperty.title}" has been successfully added.`,
      urlPath: `/agent/properties/view/${savedProperty._id}`,
      // No actions needed for this informational notification
    });

    res.status(201).json({
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
    res.status(500).json({
      success: false,
      message: error.message || "An internal server error occurred.",
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { body } = req;
    const files = req.files || [];
    const { id: propertyId } = req.params;

    // 1. Find the existing property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found." });
    }

    const updateData = { ...body };

    if (Array.isArray(updateData.agencyId)) {
      updateData.agencyId = updateData.agencyId[0];
    }

    // Convert string values from multipart/form-data to their correct types
    const numericFields = [
      "price",
      "built_up_area",
      "carpet_area",
      "bedrooms",
      "bathrooms",
      "washrooms",
      "balconies",
      "cabins",
      "conference_rooms",
      "floor_number",
      "total_floors",
    ];
    numericFields.forEach((field) => {
      if (body[field] != null && body[field] !== "") {
        updateData[field] = Number(body[field]);
      } else if (body[field] === "") {
        // Allow unsetting numeric fields by sending an empty string
        updateData[field] = undefined;
      }
    });

    // const booleanFields = ["gated_community"]; // Add other boolean fields if any
    // booleanFields.forEach((field) => {
    //   if (body[field] != null) {
    //     updateData[field] = body[field] === "true";
    //   }
    // });

    // New images from the upload
    const newImageEntries = files.map((file) => ({
      url: file.filename,
      alt: file.originalname,
      isPrimary: false,
    }));

    // Filenames of existing images to keep, sent from the frontend
    let existingImageFilenames = [];
    if (body.existingImages) {
      // Ensure it's an array, as single values might not be sent as an array
      existingImageFilenames = Array.isArray(body.existingImages)
        ? body.existingImages
        : [body.existingImages];
    }

    // Filter the old images array to keep only the ones sent from the client
    const keptImages = property.images.filter((img) =>
      existingImageFilenames.includes(img.url)
    );

    let allImages = [...keptImages, ...newImageEntries];

    const primaryImageIdentifier = body.primaryImageIdentifier;
    let primarySet = false;
    if (allImages.length > 0) {
      if (primaryImageIdentifier) {
        allImages.forEach((img) => {
          if (
            !primarySet &&
            (img.url === primaryImageIdentifier ||
              img.alt === primaryImageIdentifier)
          ) {
            img.isPrimary = true;
            primarySet = true;
          } else {
            img.isPrimary = false;
          }
        });
      }

      if (!primarySet) {
        allImages[0].isPrimary = true;
      }
    }

    updateData.images = allImages;

    // Clean up body fields that are not part of the schema
    delete updateData.existingImages;
    delete updateData.primaryImageIdentifier;

    // 5. Perform the update
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    // 6. Post-update actions (notifications)
    await Notification.create({
      userId: req.user._id,
      agencyId: updatedProperty.agencyId,
      message: `Property "${updatedProperty.title}" was updated.`,
      type: "property_updated",
      link: `/agent/properties/view/${updatedProperty._id}`,
    });

    await sendPushNotification({
      userId: req.user._id,
      title: "Property Updated",
      message: `The property "${updatedProperty.title}" has been successfully updated.`,
      urlPath: `/agent/properties/view/${updatedProperty._id}`,
    });

    // 7. Send response
    res.status(200).json({
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
    res.status(500).json({
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
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({
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
    const filter = {};

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
        message: "Property not found"
      })
    }
    await Notification.create({
      userId: req.user._id,
      agencyId: property.agencyId,
      message: `Property "${property.title}" was deleted.`,
      type: "property_deleted",
      link: `/agent/properties/view/${property._id}`,
    });

    await sendPushNotification({
      userId: req.user._id,
      title: "Property Deleted",
      message: `The property "${property.title}" has been successfully deleted.`,
      urlPath: `/agent/properties/view/${property._id}`,
    });

    res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    })

  } catch (err) {
    console.error("Error deleting property:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error",

    })
  }
}