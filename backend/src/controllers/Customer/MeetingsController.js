import { Meetings } from "../../models/Agent/MeetingModel.js";

// GET /agents/meetings/get-all/:id?page=1&limit=10
export const getMeetingsByCustomer = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();

    const query = { customerId };

    if (status === "upcoming") {
      query.$expr = {
        $and: [
          { $ne: ["$status", "cancelled"] },
          {
            $gte: [
              {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      "T",
                      "$time",
                      ":00",
                    ],
                  },
                },
              },
              now,
            ],
          },
        ],
      };
    } else if (status === "past") {
      query.$expr = {
        $and: [
          { $ne: ["$status", "cancelled"] },
          {
            $lt: [
              {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      "T",
                      "$time",
                      ":00",
                    ],
                  },
                },
              },
              now,
            ],
          },
        ],
      };
    } else if (status === "cancelled") {
      query.status = "cancelled";
    }

    const total = await Meetings.countDocuments(query);

    const meetings = await Meetings.find(query)
    .populate("propertyId", "title")
    .populate("agencyId", "name")
    .skip(skip)
    .limit(limit)
    .sort({ date: status === "past" ? -1 : 1 })
    .lean();


    const formattedMeetings = meetings.map((m) => ({
      ...m,
      property: m.propertyId,
      isPast: status === "past",
    }));

   return res.json({
      success: true,
      data: formattedMeetings,
      total,
    });
  } catch (error) {
 return res.status(500).json({ success: false, message: error.message });
  }
};

// Get a meeting by ID
export const getMeetingById = async (req, res) => {
  try {
    const agencyId = req.user.agencyId._id._id;
    const meeting = await Meetings.findOne({ _id: req.params.id, agencyId });

    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

  return res.json({ success: true, data: meeting });
  } catch (error) {
   return res.status(400).json({ success: false, message: error.message });
  }
};


