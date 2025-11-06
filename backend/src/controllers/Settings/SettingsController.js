import AgencySettings from "../../models/Agent/settingsModel.js";
export const getAgencySettings = async (req, res) => {
  try {
    const { agencyId } = req.user;

    const agency = await AgencySettings.findById(agencyId);

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    res.status(200).json({
      success: true,
      data: agency,
    });
  } catch (error) {
    console.error("Error fetching agency settings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateAgencySettings = async (req, res) => {
  try {
    const { agencyId } = req.user;
    let updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      updateData = {};
    }

    let agency = await AgencySettings.findById(agencyId);

    if (!agency) {
      agency = await AgencySettings.create({ _id: agencyId, ...updateData });
      return res.status(201).json({
        success: true,
        message: "Agency settings created with defaults",
        data: agency,
      });
    }

    if (Object.keys(updateData).length === 0) {
      const defaultDoc = new AgencySettings();
      updateData = defaultDoc.toObject();
    }

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

    const mergedData = deepMerge(agency.toObject(), updateData);

    Object.assign(agency, mergedData);
    await agency.save();

    res.status(200).json({
      success: true,
      message: "Agency settings updated successfully",
      data: agency,
    });
  } catch (error) {
    console.error("Error updating agency settings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
