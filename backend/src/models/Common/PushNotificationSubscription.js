import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, required: true },
  expirationTime: { type: Date, default: null },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
});

const DeviceSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  browser: { type: String, required: true },
  standalone: { type: Boolean, default: false },
  canInstall: { type: Boolean, default: false },
  installMethod: { type: String, default: "native" },
  id: { type: String, required: true },
});

const PushNotificationSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    device: { type: DeviceSchema, required: true },

    role: {
      type: String,
      enum: ["admin", "agent", "customer"],
      default: "agent",
    },

    subscription: { type: SubscriptionSchema, required: true },
  },
  { timestamps: true }
);

PushNotificationSubscriptionSchema.index(
  { userId: 1, "device.id": 1 },
  { unique: true }
);

const PushNotificationSubscription = mongoose.model(
  "PushNotificationSubscription",
  PushNotificationSubscriptionSchema
);

export default PushNotificationSubscription;
