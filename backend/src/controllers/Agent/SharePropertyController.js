import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";
import mongoose from "mongoose";

export const shareProperty = async (req, res) => {
  try {
    const { agencyId, propertyId, sharedWithUserId, sharedByUserId, message } =
      req.body;

    if (!agencyId || !propertyId || !sharedWithUserId || !sharedByUserId) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    const newShare = new PropertyShare({
      agencyId: new mongoose.Types.ObjectId(agencyId),
      propertyId: new mongoose.Types.ObjectId(propertyId),
      sharedWithUserId: new mongoose.Types.ObjectId(sharedWithUserId),
      sharedByUserId: new mongoose.Types.ObjectId(sharedByUserId),
      message,
    });

    const savedShare = await newShare.save();
    res.status(201).json({
      share: savedShare,
      message: "Share property successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateShareProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { agencyId, propertyId, sharedWithUserId, sharedByUserId, message } =
      req.body;

    if (!id) {
      return res.status(400).json({ error: "Share ID is required" });
    }

    if (!agencyId || !propertyId || !sharedWithUserId || !sharedByUserId) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    const updatedShare = await PropertyShare.findByIdAndUpdate(
      id,
      { agencyId, propertyId, sharedWithUserId, sharedByUserId, message },
      { new: true, runValidators: true }
    );

    if (!updatedShare) {
      return res.status(404).json({ error: "Share record not found" });
    }

    res.status(200).json(updatedShare);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllSharedProperties = async (req, res) => {
  try {
    const { agencyId } = req.query;

    if (!agencyId) {
      return res.status(400).json({ error: "Agency ID is required" });
    }

    const shares = await PropertyShare.find({ agencyId })
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
