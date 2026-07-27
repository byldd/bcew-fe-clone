import {
	type UserLoginDataType,
	type LoginResponseType,
	type ForgetPassowrdDataType,
	type PasswordResponseType,
	type UserRegisterDataType,
	type ResetPasswordResponseType,
	type ResetPasswordDataType,
} from "@/module/auth/types";
import { apiClient } from "@/lib/api";
import type { NSignUpApiResponseType } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
	AcceptInviteData,
	EmailResponseType,
	LogoutResponseType,
	OTPLoginResponseType,
	UserOTPLoginDataType,
} from "@/module/auth/types";
import { IImpersonationUsersResponse, IModulesResponse } from "@/module/employee/types";

const API_AUTH_URL = "/auth";

export const useAuthAPI = () => {
	const useLoginMutation = useMutation({
		mutationFn: async (userData: UserLoginDataType) => {
			const response = await apiClient.post<LoginResponseType>(`${API_AUTH_URL}/login`, userData);
			return response.data.data;
		},
	});

	const useRegisterMutation = useMutation({
		mutationFn: async (userData: UserRegisterDataType) => {
			const response = await apiClient.post<NSignUpApiResponseType>(`${API_AUTH_URL}/register`, userData);
			return response.data.data;
		},
	});

	const useLogoutMutation = useMutation({
		mutationFn: async () => {
			const response = await apiClient.post<LogoutResponseType>(`${API_AUTH_URL}/logout`);
			return response.data.data;
		},
	});

	const useForgetPasswordMutation = useMutation({
		mutationFn: async (userData: ForgetPassowrdDataType) => {
			const response = await apiClient.post<PasswordResponseType>(`${API_AUTH_URL}/reset-password`, userData);
			return response.data;
		},
	});

	const useUpdatePasswordMutation = useMutation({
		mutationFn: async ({ userData, token }: { userData: ResetPasswordDataType; token: string }) => {
			const response = await apiClient.post<ResetPasswordResponseType>(`${API_AUTH_URL}/update-password`, {
				...userData,
				token,
			});
			return response.data;
		},
	});

	const useAcceptInvite = useMutation({
		mutationFn: async (data: AcceptInviteData) => {
			const response = await apiClient.post<NSignUpApiResponseType>(`/accept-invite/${data.inviteToken}`, data);
			return response.data.data;
		},
	});

	const useGetEmailsFromTokenMutation = useMutation({
		mutationFn: async (data: AcceptInviteData) => {
			const response = await apiClient.post<EmailResponseType>(`/accept-invite/email/${data.inviteToken}`, data);
			return response.data;
		},
	});

	const useFetchTokenQuery = (token: string) => {
		return useQuery({
			queryKey: ["fetchToken"],
			queryFn: async () => {
				const response = await apiClient.get<ResetPasswordResponseType>(`${API_AUTH_URL}/reset-password/${token}`);
				return response.data;
			},
		});
	};

	const useSendOTPMutation = useMutation({
		mutationFn: async (userData: UserOTPLoginDataType) => {
			const response = await apiClient.post(`${API_AUTH_URL}/request-otp`, userData);
			return response.data;
		},
	});

	const useVerifyOTPMutation = useMutation({
		mutationFn: async (userData: UserOTPLoginDataType) => {
			const response = await apiClient.post<OTPLoginResponseType>(`${API_AUTH_URL}/verify-otp`, userData);
			return response.data?.data;
		},
	});

	const useRolesList = () => {
		return useQuery({
			queryKey: ["roles"],
			queryFn: async () => {
				const { data } = await apiClient.get<{ data: IModulesResponse }>("/employee/roles-and-permissions");
				return data.data?.items;
			},
		});
	};

	const useImpersonationUsers = () => {
		return useQuery({
			queryKey: ["impersonation-users"],
			queryFn: async () => {
				const { data } = await apiClient.get<{
					data: IImpersonationUsersResponse;
				}>("/employee/impersonation/users");

				return data.data.items;
			},
		});
	};

	const useImpersonateUserMutation = useMutation({
		mutationFn: async (userId: string) => {
			const response = await apiClient.post<{
				data: {
					token: string;
				};
			}>(`${API_AUTH_URL}/impersonate`, {
				userId,
			});

			return response.data.data;
		},
	});

	const useStopImpersonationMutation = useMutation({
		mutationFn: async () => {
			const response = await apiClient.post<{
				data: {
					token: string;
				};
			}>(`${API_AUTH_URL}/stop-impersonation`);

			return response.data.data;
		},
	});

	return {
		useLoginMutation,
		useRegisterMutation,
		useLogoutMutation,
		useForgetPasswordMutation,
		useUpdatePasswordMutation,
		useAcceptInvite,
		useGetEmailsFromTokenMutation,
		useFetchTokenQuery,
		useSendOTPMutation,
		useVerifyOTPMutation,
		useRolesList,
		useImpersonationUsers,
		useImpersonateUserMutation,
		useStopImpersonationMutation,
	};
};
