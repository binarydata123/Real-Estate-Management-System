/* eslint-disable space-before-function-paren */
import { activityLog } from "../models/Agent/activityLog.js";

export async function saveActivityLog({
  performedBy,
  agencyId,
  action,
  message,
}) {
  await activityLog.create({
    performedBy,
    agencyId,
    action,
    message,
  });
}
