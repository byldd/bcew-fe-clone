import { COOKIES, ROLES } from "@/types";
import { PopupConfigType, type CookiesDataType } from "@/module/auth/types";
import Cookies from "js-cookie";
import { routes } from "@/config/routes";

export const isPasswordValid = (password: string): boolean => {
	const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
	return passwordRegex.test(password);
};

export function redirectUser(userType: ROLES | string) {
	switch (userType) {
		case ROLES.SUPER_ADMIN:
			return routes.superAdmin.companies;
		case ROLES.ADMIN:
			return routes.admin.dashboard;
		case ROLES.USER:
			return routes.user.dashboard;
		case ROLES.SUB_CONTRACTOR:
			return routes.subContractor.adminDashboard;
		case ROLES.SUB_CONTRACTOR_CREW_LEADER:
			return routes.subContractor.crewLeaderDashboard;
		case ROLES.TECHNICIAN_EMPLOYEE:
			return routes.employee.dashboard;
		default:
			return routes.signIn;
	}
}

// --------------
// cookie helpers
// --------------
export function setCookies(data: CookiesDataType) {
	Cookies.set(COOKIES.USER_TYPE, data.user.roles, { expires: 1 });
	if (data.user.roles !== ROLES.SYSTEM && data.user.companyRef) {
		Cookies.set(COOKIES.COMPANY_REF, data.user.companyRef, { expires: 1 });
	}
}

export function setLoginCookies({ token, userType }: { token: string; userType: ROLES }) {
	Cookies.set(COOKIES.AUTH_TOKEN, token, { expires: 1 });
	Cookies.set(COOKIES.USER_TYPE, userType, { expires: 1 });
}

export function clearCookies() {
	Cookies.remove(COOKIES.USER_TYPE);
	Cookies.remove(COOKIES.COMPANY_REF);
	Cookies.remove(COOKIES.IS_ADMIN_PATH);
	Cookies.remove(COOKIES.AUTH_TOKEN);
	Cookies.remove(COOKIES.EMULATED_ROLE_ID);
}

export function getCookies() {
	const userType = Cookies.get(COOKIES.USER_TYPE);
	const companyRef = Cookies.get(COOKIES.COMPANY_REF);
	const isAdminPath = Cookies.get(COOKIES.IS_ADMIN_PATH);
	return { userType, companyRef, isAdminPath };
}

// -------------------
// auth pop-up helpers
// -------------------
export function createPopupWindow(url: string, config: PopupConfigType) {
	const { width, height, left, top } = config;
	return window.open(
		url,
		"oauth-popup",
		`width=${width},height=${height},top=${top},left=${left},popup=true,location=yes`
	);
}

export function getPopupConfig(): PopupConfigType {
	const width = 500;
	const height = 600;
	const left = window.screenX + (window.outerWidth - width) / 2;
	const top = window.screenY + (window.outerHeight - height) / 2;
	return { width, height, left, top };
}

export const setEmulatedRoleCookie = (roleId: string) => {
	Cookies.set(COOKIES.EMULATED_ROLE_ID, roleId);
};

export const getEmulatedRoleCookie = () => {
	return Cookies.get(COOKIES.EMULATED_ROLE_ID);
};

export const clearEmulatedRoleCookie = () => {
	Cookies.remove(COOKIES.EMULATED_ROLE_ID);
};

export const replaceAuthToken = (token: string) => {
	Cookies.set(COOKIES.AUTH_TOKEN, token, { expires: 1 });
};
