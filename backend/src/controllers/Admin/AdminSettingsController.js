import {AdminSettings} from "../../models/Admin/AdminSettingsModel.js";
import { User } from "../../models/Common/UserModel.js";
import bcrypt from "bcryptjs";

// Save or update admin settings
export const saveAdminSettings = async (req, res) => {
    try {
        const { footerContent, currentPassword, newPassword, confirmPassword, userId, notificationEmailAlert, notificationLoginAlert, notificationUpdatesAlert, notificationSecurityAlert} = req.body;
        const updatedFields = { footerContent, currentPassword, newPassword, confirmPassword, notificationEmailAlert, notificationLoginAlert, notificationUpdatesAlert, notificationSecurityAlert};
        // Handle logo and favicon upload
        if (req.files) {
            if (req.files.logoUrl && req.files.logoUrl[0]) {
                updatedFields.logoUrl = `/uploads/adminSettingsImages/${req.files.logoUrl[0].filename}`;
            }
            if (req.files.faviconUrl && req.files.faviconUrl[0]) {
                updatedFields.faviconUrl = `/uploads/adminSettingsImages/${req.files.faviconUrl[0].filename}`;
            }
        }

        // Handle password change (update in users table)
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                return res.json({ status: false, message: "New password and confirm password do not match!" });
            }
            // Assuming you have req.user.id for the currently logged-in admin
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.findByIdAndUpdate(userId, { password: hashedPassword });
        }

        // Check if settings exist
        const existing = await AdminSettings.findOne();
        if (existing) {
            const updated = await AdminSettings.findByIdAndUpdate(existing._id, updatedFields, { new: true });
            return res.json({ success: true, message: "Settings updated successfully", data: updated });
        }

        // If not exist, create new
        const newSettings = await AdminSettings.create(updatedFields);
        return res.json({ success: true, message: "Settings saved successfully", data: newSettings });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error });
    }
};

// Get admin settings
export const getAdminSettings = async (req, res) => {
    try {
        const settings = await AdminSettings.findOne();
        let userData;
        if (req.user) {
            userData = await User.findOne({_id: req.user._id});
        }
        return res.json({success: true, data: settings, userData: userData});
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
};
