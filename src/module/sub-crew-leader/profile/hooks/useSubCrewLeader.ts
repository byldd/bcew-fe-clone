import { useMutation } from "@tanstack/react-query";
import { IUpdateSmsConsentPayload } from "@/module/profile/types";
import { apiClient } from "@/lib/api";

export const useUpdateCrewSmsConsent = () => {
	return useMutation({
		mutationFn: async ({ payload }: { payload: IUpdateSmsConsentPayload }) => {
			const response = await apiClient.post(`/sub-contractor/crew-leader/sms-consent`, payload);
			return response.data;
		},
	});
};
