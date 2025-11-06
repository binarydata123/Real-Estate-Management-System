import mongoose from "mongoose";

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
// E.164 international format (+<countryCode><number>)

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: (v) => !v || phoneRegex.test(v),
      message: (props) =>
        `${props.value} is not a valid phone number (use +<countryCode><number>)`,
    },
  },
  whatsAppNumber: {
    type: String,
    validate: {
      validator: (v) => !v || phoneRegex.test(v),
      message: (props) =>
        `${props.value} is not a valid WhatsApp number (use +<countryCode><number>)`,
    },
  },
  maximumBudget: {
    type: Number,
    min: [0, "Maximum budget must be a positive number"],
  },
  minimumBudget: {
    type: Number,
    min: [0, "Minimum budget must be a positive number"],
    validate: {
      validator: function (v) {
        return !this.maximumBudget || v <= this.maximumBudget;
      },
      message: "Minimum budget cannot be greater than maximum budget",
    },
  },
  leadSource: {
    type: String,
    enum: {
      values: [
        "website",
        "referral",
        "social_media",
        "advertisement",
        "walk_in",
        "cold_call",
        "other",
      ],
      message:
        "Lead source must be one of: website, referral, social_media, advertisement, walk_in, cold_call, other",
    },
  },
  initialNotes: { type: String },
  showAllProperty: {type: Boolean, default: false},
  status: {
    type: String,
    enum: {
      values: [
        "new",
        "interested",
        "negotiating",
        "converted",
        "not_interested",
        "follow_up",
      ],
      message:
        "Status must be one of: new, interested, negotiating, converted, not_interested, follow_up",
    },
    default: "new",
  },
  role: {
    type: String,
    default: "customer",
    enum: {
      values: ["customer"],
      message: "Role must be customer",
    },
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
    required: [true, "Agency reference is required"],
  },
  createdAt: { type: Date, default: Date.now },
});

export const Customer = mongoose.model("Customer", customerSchema);
