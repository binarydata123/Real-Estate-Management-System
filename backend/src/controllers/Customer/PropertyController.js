import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";
import { Property } from "../../models/Agent/PropertyModel.js";
import mongoose from "mongoose";

export const getAllSharedProperties = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    const shares = await PropertyShare.find({ sharedWithUserId: customerId })
      .sort({ _id: -1 })
      .populate("sharedWithUserId", "fullName email phone")
      .populate("sharedByUserId", "name email phone createdAt")
      .populate("propertyId", "title images price");

    res.status(200).json({
      success: true,
      data: shares,
      message: "Shared properties fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
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
      customerId,
      agencyId
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
      filter.is_corner_plot = is_corner_plot === "true";
    }

    // 🔹 If customerId is provided, fetch shared properties
    if (customerId) {
      const sharedProperties = await PropertyShare.find({
        sharedWithUserId: customerId,
      }).select("propertyId");

      const sharedPropertyIds = sharedProperties.map((sp) => sp.propertyId);

      // Apply the shared property IDs to filter
      filter._id = { $in: sharedPropertyIds };
    }

    if (agencyId) {
      filter.agencyId = agencyId
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
