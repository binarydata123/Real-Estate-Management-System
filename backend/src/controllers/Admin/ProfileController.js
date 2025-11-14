import { User } from "../../models/Common/UserModel.js";

// Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/uploads/profiles"); // save to this folder
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `profile_${Date.now()}${ext}`);
//   },
// });

// export const upload = multer({ storage });

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    return res.json({ success: true, data: admin });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, phone } = req.body;

        const updatedFields = { name, phone };

        // Handle profile picture
        if (req.file) {
            updatedFields.profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
        }

        const updatedAdmin = await User.findByIdAndUpdate(
            userId,
            { $set: updatedFields },
            { new: true }
        ).select("-password");

        if (!updatedAdmin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

       return res.json({
            success: true,
            message: "Profile updated successfully",
            data: updatedAdmin,
        });
    } catch (error) {
        console.error("Update Admin Error:", error);
       return res.status(500).json({ success: false, message: error.message });
    }
};
