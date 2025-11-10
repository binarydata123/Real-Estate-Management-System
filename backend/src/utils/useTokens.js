//const { ObjectId } = require("mongodb");
import { ObjectId } from "mongodb";

const useTokensForAction = async ({ req, userId, action, metadata = {} }) => {
  const db = req.db;

  const TokenConfig = db.collection("tokenConfigs");
  const Wallet = db.collection("wallets");
  const TokenUsage = db.collection("tokenUsage");
  const TokenTransactions = db.collection("tokenTransactions");

  const userObjectId = new ObjectId(userId);

  // ✅ Prevent duplicate deductions for one-time-per-target actions
  const duplicateCheckMap = {
    view_candidate: { key: "candidateId", reason: /view_candidate/i },
    contact_candidate: { key: "receiverId", reason: /contact_candidate/i },
    view_profile: { key: "menteeId", reason: /view_profile/i },
    contact_mentee: { key: "menteeId", reason: /contact_mentee/i },
    course_access: { key: "courseId", reason: /course_access/i },
    podcast_start: { key: "podcastId", reason: /podcast_start/i },
    webinar_attended: { key: "webinarId", reason: /webinar_attended/i },
    interview_attended: { key: "interviewId", reason: /interview_attended/i },
    profile_view: { key: "companyId", reason: /profile_view/i },
  };

  const reasonTemplates = {
    view_candidate: {
      key: "candidateId",
      collection: "users",
      displayField: (entity) => `${entity.firstName} ${entity.lastName}`,
      template: (name) => `Used tokens for viewing candidate "${name}"`,
    },
    contact_candidate: {
      key: "receiverId",
      collection: "users",
      displayField: (entity) => `${entity.firstName} ${entity.lastName}`,
      template: (name) => `Used tokens for contacting candidate "${name}"`,
    },
    view_profile: {
      key: "menteeId",
      collection: "users",
      displayField: (entity) => `${entity.firstName} ${entity.lastName}`,
      template: (name) => `Used tokens for viewing mentee "${name}"`,
    },
    contact_mentee: {
      key: "menteeId",
      collection: "users",
      displayField: (entity) => `${entity.firstName} ${entity.lastName}`,
      template: (name) => `Used tokens for contacting mentee "${name}"`,
    },
    course_access: {
      key: "courseId",
      collection: "courses",
      displayField: "title",
      template: (title) => `Used tokens for accessing course "${title}"`,
    },
    podcast_start: {
      key: "podcastId",
      collection: "podcasts",
      displayField: "title",
      template: (title) => `Used tokens for starting podcast "${title}"`,
    },
    webinar_attended: {
      key: "webinarId",
      collection: "webinars",
      displayField: "title",
      template: (title) => `Used tokens for attending webinar "${title}"`,
    },
    interview_attended: {
      key: "interviewId",
      collection: "interviews",
      displayField: "title",
      template: (title) => `Used tokens for attending interview "${title}"`,
    },
    profile_view: {
      key: "companyId",
      collection: "companyProfiles",
      displayField: "companyName",
      template: (name) => `Used tokens for viewing company "${name}"`,
    },
  };

  // Normalize metadata
  const normalizedMeta = { ...metadata };
  if (duplicateCheckMap[action]?.key && metadata[duplicateCheckMap[action].key]) {
    normalizedMeta.targetId = metadata[duplicateCheckMap[action].key];
    normalizedMeta[duplicateCheckMap[action].key] = metadata[duplicateCheckMap[action].key];
  }

  // Prevent duplicate use
  if (duplicateCheckMap[action]) {
    const { key } = duplicateCheckMap[action];
    if (metadata[key]) {
      const alreadyUsed = await TokenTransactions.findOne({
        userId: userObjectId,
        action,
        [`metadata.${key}`]: metadata[key],
      });
      if (alreadyUsed) {
        return { skipped: true, message: `Already used tokens for ${action}` };
      }
    }
  }



  // 1. Get config
  const config = await TokenConfig.findOne({ action, enabled: true });
  if (!config) throw new Error("This action is not enabled or doesn't exist");

  // 2. Check wallet
  const wallet = await Wallet.findOne({ ownerId: userObjectId });
  if (!wallet || wallet.balance < config.tokensRequired) {
    throw new Error("Insufficient tokens");
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore - config.tokensRequired;
  const createdAt = new Date();

  // 3. Run inside MongoDB transaction
  const session = db.client.startSession();
  try {
    let reason = `Used tokens for ${config.description || action}`; // fallback

    const reasonConfig = reasonTemplates[action];
    if (reasonConfig && metadata[reasonConfig.key]) {
      try {
        const entityId = new ObjectId(metadata[reasonConfig.key]);
        const entity = await db.collection(reasonConfig.collection).findOne({ _id: entityId });

        if (entity) {
          const displayValue =
            typeof reasonConfig.displayField === "function"
              ? reasonConfig.displayField(entity)
              : entity[reasonConfig.displayField];

          if (displayValue) {
            reason = reasonConfig.template(displayValue);
          }
        }
      } catch (e) {
        console.error(`Could not generate dynamic reason for action ${action}:`, e);
      }
    }

    await session.withTransaction(async () => {
      // Wallet update
      await Wallet.updateOne(
        { ownerId: userObjectId },
        {
          $inc: { balance: -config.tokensRequired },
          $push: {
            history: {
              action: "spend",
              amount: config.tokensRequired,
              description: reason,
              referenceId: null,
              createdAt,
            },
          },
        },
        { session }
      );

      // Token usage log
      await TokenUsage.insertOne(
        {
          userId: userObjectId,
          action,
          tokensUsed: config.tokensRequired,
          metadata: normalizedMeta,
          balanceBefore,
          balanceAfter,
          createdAt,
        },
        { session }
      );

      // Token transaction log
      await TokenTransactions.insertOne(
        {
          userId: userObjectId,
          action,
          type: "debit",
          amount: config.tokensRequired,
          reason,
          performedBy: userObjectId,
          subscriptionId: null,
          metadata: normalizedMeta,
          balanceBefore,
          balanceAfter,
          createdAt,
        },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  return {
    success: true,
    action,
    tokensUsed: config.tokensRequired,
    balanceBefore,
    balanceAfter,
  };
};

export default useTokensForAction;
