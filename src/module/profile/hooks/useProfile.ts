import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AccessLevelType, IUpdateSmsConsentPayload, UserType } from "../types";
import { MODULE } from "@/utils/enums";

export const useGetUserData = () => {
	return useQuery<UserType>({
		queryKey: ["userData"],
		queryFn: async () => {
			const response = await apiClient.get<UserType>(`/user/me`);
			return response.data;
		},
		enabled: true,
	});
};

export const useUpdateUserSMSConsent = () => {
	return useMutation({
		mutationFn: async ({ payload }: { payload: IUpdateSmsConsentPayload }) => {
			const response = await apiClient.post(`/user/sms-consent`, payload);
			return response.data;
		},
	});
};

export const useGetUserModuleAccess = (moduleName?: MODULE) => {
	return useQuery<AccessLevelType>({
		queryKey: ["userModuleAccess", moduleName],
		enabled: !!moduleName,
		queryFn: async () => {
			const response = await apiClient.get<AccessLevelType>(`/user/module/access?module=${moduleName}`);
			return response.data;
		},
		refetchOnWindowFocus: false,
	});
};
