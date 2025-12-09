import { Property } from "../../models/Agent/PropertyModel.js";
import { Agency } from "../../models/Agent/AgencyModel.js";
//import { Customer } from "../../models/Agent/CustomerModel.js";
import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";
import { Meetings } from "../../models/Agent/MeetingModel.js";
import { PreferenceFeedbacks } from "../../models/Agent/PreferenceFeedbackModel.js";
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
        totalProperties: totalProperties,
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

export const getPropertyById = async (req, res) => {
  try {
    const searchQuery = {};
    const propertyId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    //const customersSearch = req.query.customersSearch;
    const meetingsSearch = req.query.meetingsSearch;
    const propertyShareSearch = req.query.propertyShareSearch;
    const propertyFeedbackSearch = req.query.propertyFeedbackSearch;

    if (propertyId) {
      searchQuery._id = propertyId;
    }

    if (meetingsSearch) {
      searchQuery.$or = [];
      if (meetingsSearch && typeof meetingsSearch === "string") {
        searchQuery.$or.push({ fullName: { $regex: meetingsSearch, $options: "i" } });
      }
    }

    if (propertyShareSearch) {
      searchQuery.$or = [];
      if (propertyShareSearch && typeof propertyShareSearch === "string") {
        searchQuery.$or.push({ fullName: { $regex: propertyShareSearch, $options: "i" } });
      }
    }
    if (propertyFeedbackSearch) {
      searchQuery.$or = [];
      if (propertyFeedbackSearch && typeof propertyFeedbackSearch === "string") {
        searchQuery.$or.push({ fullName: { $regex: propertyFeedbackSearch, $options: "i" } });
      }
    }
    const property = await Property.findById({ _id: propertyId });

    // PAGINATED MEETINGS (AGGREGATE)
    const totalMeetings = await Meetings.countDocuments({ propertyId: propertyId }, searchQuery);
    let propertyMeetings = await Meetings.find({ propertyId: propertyId }, searchQuery)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId')
      .populate('propertyId')
      .lean();

    propertyMeetings = propertyMeetings.map((item) => ({
      ...item,
      customerData: item.customerId,
      propertyData: item.propertyId,
      customerId: undefined,
      propertyId: undefined,
    }));

    const totalPropertyShares = await PropertyShare.countDocuments({ propertyId: propertyId }, searchQuery);
    const propertyShares = await PropertyShare.find({ propertyId: propertyId }, searchQuery)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('propertyId')
      .populate('sharedWithUserId')
      .populate('sharedByUserId')
      .lean();

    const totalPropertyFeedbacks = await PreferenceFeedbacks.countDocuments({ propertyId: propertyId }, searchQuery);
    const propertyFeedbacks = await PreferenceFeedbacks.find({ propertyId: propertyId }, searchQuery)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('propertyId')
      .populate('userId')
      .lean();

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    return res.json({
      success: true,
      message: "Property fetch successfully",
      data: {
        property: property,
        meetings: propertyMeetings,
        meetingsPagination: {
          total: totalMeetings,
          page,
          limit,
          totalPages: Math.ceil(totalMeetings / limit),
        },
        propertyShare: propertyShares,
        propertySharePagination: {
          total: totalPropertyShares,
          page,
          limit,
          totalPages: Math.ceil(totalPropertyShares / limit),
        },
        propertyFeedback: propertyFeedbacks,
        propertyFeedbackPagination: {
          total: totalPropertyFeedbacks,
          page,
          limit,
          totalPages: Math.ceil(totalPropertyFeedbacks / limit),
        }
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};