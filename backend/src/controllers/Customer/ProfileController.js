import { Customer } from "../../models/Agent/CustomerModel.js";

export const getProfile= async(req,res)=>{
    try {
        const customerId =req.user._id;
        const customer=await Customer.findById({_id:customerId})
    
     if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });}   
        res.status(200).json({
      success: true,
      data:customer,
      message: "Customer Profile fetched successfully",})

    } catch (error) {
       console.error("Error fetching Customer Profile ", error);
      res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
        
    }
}
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; 

    const { fullName, email, phoneNumber, whatsapp } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Fullname and email are required.",
      });
    }

    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }
    if (fullName) customer.fullName = fullName;
    if (email) customer.email = email;
    if (phoneNumber) customer.phoneNumber = phoneNumber;
    if (whatsapp) customer.whatsAppNumber = whatsapp;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("Error updating Customer Profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while updating profile.",
    });
  }
};
