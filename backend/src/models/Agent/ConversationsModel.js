import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // applicationId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Application",
    //   //required: true,
    // },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    // User(s) who have blocked the conversation
    blockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    // User(s) who have archived the conversation
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    // User(s) who have deleted the conversation
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    timestamps: true, // automatically creates createdAt & updatedAt
  }
);
export const Conversation = mongoose.model("Conversation", conversationSchema);