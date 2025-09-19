import { Property } from "../../models/Agent/PropertyModel.js";
import { Notification } from "../../models/Common/NotificationModel.js";

export const createProperty = async (req, res) => {
  try {
    const { body, files } = req;
    console.log(body);
    const imageEntries = files.map((file, index) => ({
      url: file.filename,
      alt: file.originalname,
      isPrimary: index === 0, // Set the first image as primary by default
    }));

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
      parking_count: body.parking_count
        ? Number(body.parking_count)
        : undefined,

      // Convert string boolean to actual boolean
      gated_community: body.gated_community === "true",

      // Add processed image info
      images: imageEntries,
      property_code:
        body.property_code ||
        `PROP-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`,
    };

    // The 'agency' field is expected to be in the body from the frontend
    if (!propertyData.agencyId) {
      return res
        .status(400)
        .json({ success: false, message: "Agency information is missing." });
    }

    const property = new Property(propertyData);
    const savedProperty = await property.save();

    // Create a notification for the agency
    await Notification.create({
      user: req.user._id,
      agencyId: savedProperty.agencyId,
      message: `New property "${savedProperty.title}" was added.`,
      type: "property_added",
      link: `/agent/properties/view/${savedProperty._id}`, // A potential link to view the property
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

export const getProperties = async (req, res) => {
  try {
    const { title, status, minPrice, maxPrice } = req.query;
    const filter = {};
    if (title && title.trim() !== "") {
      filter.title = { $regex: title.trim(), $options: "i" };
    }

    if (status) filter.status = status;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Properties fetched successfully",
      data: properties,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
