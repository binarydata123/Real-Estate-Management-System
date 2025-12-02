import { ObjectId } from "mongodb";
import { validationResult } from "express-validator";
import sendFirstMessageEmail from "../../helpers/EmailFunctions/SendFirstMessageEmail/index.js";
import SendMessageEmailNotPlanPurchase from "../../helpers/EmailFunctions/SendMessageEmailNotPlanPurchase/index.js";
import useTokensForAction from "../../utils/useTokens.js";
import { Rewind } from "lucide-react";
import { Conversation } from "../../models/Agent/ConversationsModel.js";
import { User } from "../../models/Common/UserModel.js";
import { Customer } from "../../models/Agent/CustomerModel.js";
import { Message } from "../../models/Agent/MessagesModel.js";
import { Notifications } from "../../models/Agent/NotificationModel.js";

// Helper function to create a notification
export const createNotification = async (db, data) => {
  try {
    await Notifications.insertOne({
      ...data,
      isRead: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
  } catch (error) {
    console.error("Create Notification Error:", error);
  }
};

// GET /api/messages/conversations - Get user's conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const showArchived = req.query.archived === "true";
    const showDeleted = req.query.deleted === "true";
    const showBlocked = req.query.blocked === "true";

    const filter = {
      participants: userId,
    };

    // Prioritize deleted > archived > blocked fetch modes:
    if (showDeleted) {
      filter.deletedBy = userId;
    } else if (showArchived) {
      filter.deletedBy = { $ne: userId };
      filter.archivedBy = userId;
    } else if (showBlocked) {
      filter.deletedBy = { $ne: userId };
      filter.archivedBy = { $ne: userId };
      filter.blockedBy = userId;
    } else {
      // Default conversations: not deleted, not archived, not blocked
      filter.deletedBy = { $ne: userId };
      filter.archivedBy = { $ne: userId };
      filter.blockedBy = { $ne: userId };
    }

    // Get conversations matching filter
    const conversations = await Conversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .lean()
      .exec();

    // ---- COUNT ARCHIVED, DELETED & BLOCKED CHATS ----
    const [archiveCount, deletedCount, blockedCount] = await Promise.all([
      Conversation.countDocuments({
        participants: userId,
        archivedBy: userId,
        deletedBy: { $ne: userId },
      }),
      Conversation.countDocuments({
        participants: userId,
        deletedBy: userId,
      }),
      Conversation.countDocuments({
        participants: userId,
        blockedBy: userId,
        deletedBy: { $ne: userId }, // don't include deleted conversations in block count
      }),
    ]);

    // Get other participants' info
    const participantIds = conversations.flatMap((conv) =>
      conv.participants.filter((id) => id.toString() !== userId.toString())
    );

    const participants = await Customer.find(
      { _id: { $in: participantIds } },
      { password: 0 }
    )
      .lean()
      .exec();

    const customerIds = participants
      .filter((p) => p.role === "customer")
      .map((p) => p._id);

    const agentIds = participants
      .filter((p) => p.role === "agent")
      .map((p) => p._id);

    const customerProfiles = await Customer.find({
      userId: { $in: customerIds },
    })
      .lean()
      .exec();
    const agentProfiles = await User.find({ userId: { $in: agentIds } })
      .lean()
      .exec();

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipantId = conv.participants.find(
          (id) => id && id.toString() !== userId.toString()
        );

        if (!otherParticipantId) {
          console.warn(
            `⚠️ Conversation ${conv._id} has no valid other participant`
          );
          return { ...conv, otherParticipant: null };
        }

        const otherParticipant = participants.find(
          (p) => p._id.toString() === otherParticipantId.toString()
        );

        let profile = null;
        const status = null;
        const applicationInfo = null;

        if (otherParticipant?.role === "customer") {
          profile = customerProfiles.find(
            (p) => p._id.toString() === otherParticipantId.toString()
          );
        } else if (otherParticipant?.role === "agent") {
          profile = agentProfiles.find(
            (p) => p._id.toString() === otherParticipantId.toString()
          );
        }

        // fallback avatar
        let avatar = "";
        if (otherParticipant?.role === "customer") {
          if (profile?.profilePhoto?.medium) {
            avatar = `${process.env.BACKEND_URL || ""}${profile.profilePhoto.medium
              }`;
          }
        } else if (otherParticipant?.role === "agent") {
          if (profile?.logo?.medium) {
            avatar = `${process.env.BACKEND_URL || ""}${profile.logo.medium}`;
          }
        }

        return {
          ...conv,
          otherParticipant: otherParticipant
            ? {
              _id: otherParticipant._id,
              name: `${otherParticipant.fullName}`,
              email: otherParticipant.email,
              phone: otherParticipant.phoneNumber,
              role: otherParticipant.role,
              userId: otherParticipant.userId,
              position: profile?.jobTitle || profile?.companyName,
              avatar,
              status,
              application: applicationInfo,
            }
            : null,
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithDetails,
      //allowMessages,
      archiveCount,
      deletedCount,
      blockedCount,
    });
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// GET /api/messages/conversations/:id - Get messages for a conversation
export const getConversationMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;

    const allowMessages = null;
    const showProfile = true;

    // Get messages
    const messages = await Message.find({
      conversationId: new ObjectId(conversationId),
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
      allowMessages,
      showProfile,
    });
  } catch (error) {
    console.error("Get Conversation Messages Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// POST /api/messages/conversations/:id - Send a message in a conversation
export const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const senderId = req.user._id;
    const conversationId = req.params.id;
    const { content, attachments } = req.body;

    const conversation = await Conversation.findOne({
      _id: new ObjectId(conversationId),
      participants: senderId,
    });

    let receiverId;
    if (conversation) {
      receiverId = conversation.participants.find(
        (id) => id.toString() !== senderId.toString()
      );
    } else {
      receiverId = conversationId;
    }

    // ✅ Fetch receiver details first (required for both email + plan check)
    const receiver = await Customer.findOne({ _id: new ObjectId(receiverId) });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const message = {
      conversationId: new ObjectId(conversationId),
      senderId: senderId,
      receiverId,
      content,
      attachments: attachments || [],
      isRead: false,
      createdAt: new Date(),
    };

    const result = await Message.insertOne(message);

    const lastMessage =
      content?.trim() !== ""
        ? content
        : attachments?.length
          ? "📎 Attachment"
          : "";

    // Update conversation metadata
    await Conversation.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          lastMessage,
          lastMessageAt: new Date(),
        },
        $inc: { [`unreadCount.${receiverId}`]: 1 },
      }
    );
    if (req.user.role == "admin") {
      console.log("send email");
      const user = await User.findOne({ _id: new ObjectId(receiverId) });
      const userData = {
        firstName: user.firstName,
        email: user.email,
        lastName: user.lastName,
      };

      const sender = req.user.firstName + " " + req.user.lastName;
      const messageUrl = `${user.role}/messages`;
      sendFirstMessageEmail(userData, message.content, sender, messageUrl);
    }

    // // ✅ Send “Purchase Plan” email if receiver has no active plan
    // if (!checkPlan.status) {
    //   const adminSettings = await req.db
    //     .collection("adminSettings")
    //     .findOne({});
    //   const sender = `${req.user.firstName} ${req.user.lastName}`;
    //   const unsubscribeUrl = `/unsubscribe/${receiverId}`;
    //   const upgradeUrl = `${user.role}/plans`;
    //   await SendMessageEmailNotPlanPurchase(
    //     receiver,
    //     content,
    //     sender,
    //     adminSettings,
    //     unsubscribeUrl,
    //     upgradeUrl
    //   );
    // }

    // Send response immediately
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        message: {
          ...message,
          _id: result.insertedId,
        },
      },
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// POST /api/messages/conversations - Start a new conversation

export const startConversation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const userId = req.user._id;
    const { receiverId, content, attachments } = req.body;

    // Check if receiver exists
    const receiver = await Customer.findOne({
      _id: new ObjectId(receiverId),
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const conversationFilter = {
      participants: {
        $all: [userId, new ObjectId(receiverId)],
        $size: 2,
      },
    };
    console.log(conversationFilter);

    // Check if conversation already exists (with or without applicationId)
    const existingConversation = await Conversation.findOne(conversationFilter);
    console.log(existingConversation);
    let conversationId;
    let messageResult = null;

    if (existingConversation) {
      conversationId = existingConversation._id;

      const message = {
        conversationId: new ObjectId(conversationId),
        senderId: userId,
        receiverId,
        attachments: attachments || [],
        isRead: false,
        createdAt: new Date(),
      };

      await Message.insertOne(message);

      const lastMessage =
        content?.trim() !== ""
          ? content
          : attachments?.length
            ? "📎 Attachment"
            : "";

      // Update conversation metadata
      await Conversation.updateOne(
        { _id: new ObjectId(conversationId) },
        {
          $set: {
            lastMessage,
            lastMessageAt: new Date(),
          },
          $inc: { [`unreadCount.${receiverId}`]: 1 },
        }
      );
    } else {
      // Create new conversation
      const conversation = {
        participants: [userId, new ObjectId(receiverId)],
        lastMessage: content,
        lastMessageAt: new Date(),
        unreadCount: {
          [receiverId]: 1,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await Conversation.insertOne(conversation);
      //conversationId = result.insertedId;
      conversationId = result._id;

      // Create initial message only if new conversation
      const message = {
        conversationId,
        senderId: userId,
        receiverId: new ObjectId(receiverId),
        content,
        type: "text",
        attachments: Array.isArray(attachments) ? attachments : [],
        isRead: false,
        createdAt: new Date(),
      };

      messageResult = await Message.insertOne(message);

      await createNotification(req.db, {
        userId: new ObjectId(receiverId),
        type: "message",
        title: "New Message",
        message: `You have a new message from ${req.user.name}`,
        priority: "medium",
        actionUrl: `/${receiver.role === "agent" ? "customer" : "agent"
          }/messages?conversationId=${conversationId}`,
      });
    }
    if (req.user.role === "admin") {
      const userData = {
        name: receiver.name,
        email: receiver.email,
      };
      const sender = req.user.name;
      const messageUrl = `${receiver.role}/messages`;
      sendFirstMessageEmail(userData, content, sender, messageUrl);
    }
    res.status(201).json({
      success: true,
      message: existingConversation
        ? "Conversation already exists"
        : "Conversation started successfully",
      data: {
        conversationId,
        ...(messageResult && {
          message: {
            ...messageResult.ops?.[0], // fallback if needed, or keep _id only
            _id: messageResult._id,
          },
        }),
      },
    });
  } catch (error) {
    console.error("Start Conversation Error:", error);
    if (error?.errInfo?.details) {
      console.error(
        "Schema validation details:",
        JSON.stringify(error.errInfo.details, null, 2)
      );
    }
    res.status(500).json({
      success: false,
      message: "Failed to start conversation",
      error: error.message,
    });
  }
};

// PATCH /api/messages/conversations/:id/read - Mark conversation as read
export const markConversationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: new ObjectId(conversationId),
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or you do not have permission",
      });
    }

    // Mark all messages as read
    await Message.updateMany(
      {
        conversationId: new ObjectId(conversationId),
        receiverId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    // Update conversation unread count
    await Conversation.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          [`unreadCount.${userId}`]: 0,
        },
      }
    );

    res.json({
      success: true,
      message: "Conversation marked as read",
    });
  } catch (error) {
    console.error("Mark Conversation As Read Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark conversation as read",
      error: error.message,
    });
  }
};

// PATCH /api/messages/conversations/:id/archive - Archive a conversation
export const archiveConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: new ObjectId(conversationId),
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or you do not have permission",
      });
    }

    // Archive conversation for this user
    await Conversation.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $addToSet: {
          archivedBy: userId,
        },
      }
    );

    res.json({
      success: true,
      message: "Conversation archived successfully",
    });
  } catch (error) {
    console.error("Archive Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive conversation",
      error: error.message,
    });
  }
};

// PATCH /api/messages/conversations/:id/unarchive - Unarchive a conversation
export const unArchiveConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: new ObjectId(conversationId),
      participants: userId,
    });

    // Unarchive conversation for this user
    await Conversation.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $pull: {
          archivedBy: userId,
        },
      }
    );

    res.json({
      success: true,
      message: "Conversation unArchived successfully",
    });
  } catch (error) {
    console.error("Unarchive Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unarchive conversation",
      error: error.message,
    });
  }
};

// PATCH /api/messages/conversations/:id/unarchive - Unarchive a conversation
export const restoreConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: new ObjectId(conversationId),
      participants: userId,
    });

    // restore conversation for this user
    await Conversation.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $pull: {
          deletedBy: userId,
        },
      }
    );

    res.json({
      success: true,
      message: "Conversation restore successfully",
    });
  } catch (error) {
    console.error("Restore Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore conversation",
      error: error.message,
    });
  }
};

// PATCH /api/messages/conversations/:id/delete - Delete a conversation
export const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    // Confirm conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: new ObjectId(conversationId),
      participants: userId,
    });
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    // Add user to deletedBy AND remove from archivedBy and blockedBy
    await Conversation.updateOne(
      { _id: conversation._id },
      {
        $addToSet: { deletedBy: userId },
        $pull: {
          archivedBy: userId, // remove if archived
          blockedBy: userId, // remove if blocked
        },
      }
    );

    return res
      .status(200)
      .json({ success: true, message: "Conversation deleted for user" });
  } catch (error) {
    console.error("Delete conversation error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete conversation" });
  }
};

// PATCH /api/messages/conversations/:id/block - Block a conversation
export const blockConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: new ObjectId(conversationId),
      participants: userId,
    });

    // if (!conversation) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Conversation not found or you do not have permission",
    //   });
    // }

    // Perform block and remove from archive in a single update
    await Conversation.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $addToSet: { blockedBy: userId },
        $pull: { archivedBy: userId }, // remove from archive if present
      }
    );

    res.json({
      success: true,
      message: "Conversation blocked successfully",
    });
  } catch (error) {
    console.error("Block Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to block conversation",
      error: error.message,
    });
  }
};

// PATCH /api/messages/conversations/:id/unblock - Unblock a conversation
export const unblockConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: new ObjectId(conversationId),
      participants: userId,
    });

    // if (!conversation) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Conversation not found or you do not have permission",
    //   });
    // }

    // Unblock conversation for this user
    await Conversation.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $pull: {
          blockedBy: userId,
        },
      }
    );

    res.json({
      success: true,
      message: "Conversation unblocked successfully",
    });
  } catch (error) {
    console.error("Unblock Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unblock conversation",
      error: error.message,
    });
  }
};

export const getLatestMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ receiverId: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      // join with users collection to get sender info
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: "$sender" },
      {
        $project: {
          _id: 1,
          text: 1,
          createdAt: 1,
          senderId: 1,
          receiverId: 1,
          isRead: 1,
          conversationId: 1,
          senderName: "$sender.firstName",
        },
      },
    ]).toArray();

    res.status(200).json({
      success: true,
      data: messages,
      message: "Fetched latest messages",
    });
  } catch (error) {
    console.error("Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest messages",
      error: error.message,
    });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const userId = req.user._id;
    const customers = await Customer.find({
      agencyId: new ObjectId(userId),
      role: "Customer",
    });

    res.status(200).json({
      success: true,
      data: customers,
      message: "Fetched customers",
    });
  } catch (error) {
    console.error("Conversation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};
