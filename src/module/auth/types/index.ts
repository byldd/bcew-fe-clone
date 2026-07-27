// -----------------
// react-query types
// -----------------

import { EMPLOYEE_CATEGORY } from "@/utils/enums";
import { ROLES } from "@/types";
import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export type UserLoginDataType = {
	username: string;
	password: string;
	userType?: ROLES;
};

export type UserOTPLoginDataType = {
	phoneNumber: string;
	otp?: string | undefined;
};

export type LoginResponseType = {
	status: number;
	message: string;
	data: {
		token: string;
		user: {
			id: string;
			bcewUserId: string;
			name: string;
			roleId: string;
			isPermissionOverridden: boolean;
			employeeStatus: EMPLOYEE_CATEGORY;
			roles: string;
			companyRef: string;
			userType: ROLES;

			role?: {
				id: string;
				name: string;
			};

			isEmulationAllowed?: boolean;
		};
	};
};

export type OTPLoginResponseType = {
	status: number;
	message: string;
	data: {
		token: string;
	};
};

export type LogoutResponseType = {
	status: number;
	message: string;
	data: object;
	error: object;
};

export type ForgetPassowrdDataType = {
	email: string;
};

export type PasswordResponseType = {
	status: number;
	message: string;
};

export type UserRegisterDataType = {
	name: {
		first: string;
		last: string;
	};
	email: string;
	password: string;
	confirmPassword: string;
	roles?: string;
};

export type ResetPasswordResponseType = {
	token: string;
	email?: string;
	password?: string;
};

export type ResetPasswordDataType = {
	email: string;
	password: string;
	confirmedPassword: string;
};

export type AcceptInviteData = {
	inviteToken: string;
};

export type EmailResponseType = {
	data: string;
};

export type TokenProviderProps = {
	setToken: (token: string | null) => void;
};

// ---------------
// component types
// ---------------
export type AuthWrapperOneType = {
	children: React.ReactNode;
	title: React.ReactNode;
	description?: string;
	bannerTitle?: string;
	bannerDescription?: string;
	pageImage?: React.ReactNode;
	termsAndConditions?: React.ReactNode;
};

export type UserMetadataType = {
	full_name: string;
};

export type PopupConfigType = {
	width: number;
	height: number;
	left: number;
	top: number;
};

// ----------
// util types
// ----------
export type CookiesDataType = {
	user: {
		roles: string;
		companyRef?: string;
	};
};

export const OtpFormSchema = (isOtpSent: boolean) =>
	z.object({
		phoneNumber: z
			.string()
			.min(1, "Phone number is required")
			.refine((value) => isValidPhoneNumber(value), {
				message: "Invalid phone number",
			}),
		otp: isOtpSent ? z.string().min(4, { message: "OTP must be 4 digits" }) : z.string().optional(),
	});

export const loginFormEmailSchema = () => {
	return z.object({
		email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
		password: z.string().min(1, { message: "Password is required" }),
	});
};

export const loginFormSchema = () => {
	return z.object({
		username: z.string().min(1, { message: "Username is required" }),
		password: z.string().min(1, { message: "Password is required" }),
	});
};

export type UserLoginType = z.infer<ReturnType<typeof loginFormSchema>>;
export type OtpFormType = z.infer<ReturnType<typeof OtpFormSchema>>;
