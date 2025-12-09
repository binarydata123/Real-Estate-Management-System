import { Agency } from "../../models/Agent/AgencyModel.js";
import { Customer } from "../../models/Agent/CustomerModel.js";
import { Property } from "../../models/Agent/PropertyModel.js";
import { Meetings } from "../../models/Agent/MeetingModel.js";
import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";
import AgencySettings from "../../models/Agent/settingsModel.js";
import CustomerSettings from "../../models/Customer/SettingsModel.js";
import { User } from "../../models/Common/UserModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";

// Get all agencies
export const getAgencies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const searchQuery = {};

    if (search || status) {
      searchQuery.$or = [];

      if (search && typeof search === "string") {
        searchQuery.$or.push({ name: { $regex: search, $options: "i" } });
      }

      if (status && typeof status === "string") {
        searchQuery.$or.push({ status: { $regex: status, $options: "i" } });
      }
    }

    const totalAgencies = await Agency.countDocuments(searchQuery);

    const agency = await Agency.find(searchQuery)
      .sort({ _id: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("properties")
      .populate("customers")
      .populate({ path: "users", select: "name" })
      .populate("meetings")
      .populate("propertyshares");

    if (!agency || agency.length === 0) {
      // Return only stats if no agencies found
      const totalAgenciesCount = await Agency.countDocuments({ status: { $ne: "delete" } });
      return res.status(200).json({
        success: true,
        message: "No agency found",
        data: [],
        pagination: {
          total: 0,
          page: pageNumber,
          limit: limitNumber,
          totalPages: 0,
        },
        stats: {
          totalAgencies: totalAgenciesCount
        }
      });
    }

    // Agency stats for dashboard cards
    const totalAgenciesCount = await Agency.countDocuments({ status: { $ne: "delete" } });

    return res.json({
      success: true,
      data: agency,
      pagination: {
        total: totalAgencies,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalAgencies / limitNumber),
      },
      stats: {
        totalAgencies: totalAgenciesCount
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update a customer
export const updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedAgency = await Agency.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedAgency) {
      return res
        .status(404)
        .json({ success: false, message: "Agency not found" });
    }
    let userSettings;
    if (req.user.role === "agency") {
      userSettings = AgencySettings.findById(req.user._id);
    } else if (req.user.role === "customer") {
      userSettings = CustomerSettings.findById(req.user._id);
    }
    if (userSettings.notifications.pushNotifications) {
      await sendPushNotification({
        userId: updatedAgency.owner,
        title: "Agency Updated",
        message: `Agency (${updatedAgency.name}) has been updated successfully.`,
        urlPath: "Agency",
      });
    }
    await createNotification({
      userId: updatedAgency.owner,
      message: `Agency (${updatedAgency.name}) has been updated successfully.`,
      type: "lead_updated",
    });

    return res.json({ success: true, data: updatedAgency });
  } catch (error) {
    console.error("Error updating agency:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a customer
export const deleteAgency = async (req, res) => {
  try {
    const agencyId = req.params.id;
    const deletedAgency = await Agency.findByIdAndDelete(agencyId);
    if (!deletedAgency) {
      return res
        .status(404)
        .json({ success: false, message: "Agency not found" });
    }
    await Agency.deleteOne({ _id: deletedAgency._id });

    return res.json({
      success: true,
      message: "Agency deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getAgencyById = async (req, res) => {
  try {
    const searchQuery = {};
    const agencyId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const teamMembersSearch = req.query.teamMembersSearch;
    const customersSearch = req.query.customersSearch;
    const propertiesSearch = req.query.propertiesSearch;
    const meetingsSearch = req.query.meetingsSearch;
    const propertyShareSearch = req.query.propertyShareSearch;

    if (agencyId) {
      searchQuery.agencyId = agencyId;
    }

    if (teamMembersSearch) {
      searchQuery.$or = [];
      if (teamMembersSearch && typeof teamMembersSearch === "string") {
        searchQuery.$or.push({ name: { $regex: teamMembersSearch, $options: "i" } });
      }
    }

    if (customersSearch) {
      searchQuery.$or = [];
      if (customersSearch && typeof customersSearch === "string") {
        searchQuery.$or.push({ fullName: { $regex: customersSearch, $options: "i" } });
      }
    }

    if (propertiesSearch) {
      searchQuery.$or = [];
      if (propertiesSearch && typeof propertiesSearch === "string") {
        searchQuery.$or.push({ title: { $regex: propertiesSearch, $options: "i" } });
      }
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
    const agency = await Agency.findById({ _id: agencyId }).populate("users");
    const totalTeamMembers = await User.countDocuments(searchQuery);
    const agencyTeamMembers = await User.find(searchQuery)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('agencyId');
    // PAGINATED CUSTOMERS
    const totalCustomers = await Customer.countDocuments(searchQuery);
    const agencyCustomers = await Customer.find(searchQuery)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    // PAGINATED PROPERTIES
    const totalProperties = await Property.countDocuments(searchQuery);
    const agencyProperties = await Property.find(searchQuery)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    // PAGINATED MEETINGS (AGGREGATE)
    const totalMeetings = await Meetings.countDocuments(searchQuery);
    let agencyMeetings = await Meetings.find(searchQuery)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId')
      .populate('propertyId')
      .lean();

    agencyMeetings = agencyMeetings.map((item) => ({
      ...item,
      customerData: item.customerId,
      propertyData: item.propertyId,
      customerId: undefined,
      propertyId: undefined,
    }));

    const totalPropertyShares = await PropertyShare.countDocuments(searchQuery);
    const agencyPropertyShares = await PropertyShare.find(searchQuery)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('propertyId')
      .populate('sharedWithUserId')
      .populate('sharedByUserId')
      .lean();

    if (!agency) {
      return res
        .status(404)
        .json({ success: false, message: "Agency not found" });
    }
    return res.json({
      success: true,
      message: "Agency fetch successfully",
      data: {
        agency: agency,
        teamMembers: agencyTeamMembers,
        teamMembersPagination: {
          total: totalTeamMembers,
          page,
          limit,
          totalPages: Math.ceil(totalTeamMembers / limit),
        },
        customers: agencyCustomers,
        customersPagination: {
          total: totalCustomers,
          page,
          limit,
          totalPages: Math.ceil(totalCustomers / limit),
        },
        property: agencyProperties,
        propertyPagination: {
          total: totalProperties,
          page,
          limit,
          totalPages: Math.ceil(totalProperties / limit),
        },
        meetings: agencyMeetings,
        meetingsPagination: {
          total: totalMeetings,
          page,
          limit,
          totalPages: Math.ceil(totalMeetings / limit),
        },
        propertyShare: agencyPropertyShares,
        propertySharePagination: {
          total: totalPropertyShares,
          page,
          limit,
          totalPages: Math.ceil(totalPropertyShares / limit),
        }
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
