import { AxiosResponse } from "axios";
import api from "../api";

export const savePushSubscription = async (data: {
  userId: string;
  role: string;
  subscription: PushSubscription;
  device: unknown;
}): Promise<AxiosResponse> => {
  return api.post("/common/push-notification/subscribe-user", data);
};
