import { env } from "@/env.mjs";
import axios, { type AxiosError } from "axios";
import { isClient } from "@/lib/utils/is-client";
import { clearCookies } from "@/module/auth/utils/helpers";
import Cookie from "js-cookie";
import { COOKIES } from "@/types";
import { LANGUAGES } from "@/i18n/type";
import { isDevelopmentEnv, isStagingEnv } from "@/utils";
const apiUrl = env.NEXT_PUBLIC_API_URL;
const HEADERS = {
	"Content-Type": "application/json",
};
const REQUEST_TIMEOUT_MS = 30000;
const apiClient = axios.create({
	baseURL: apiUrl,
	headers: {
		...HEADERS,
	},
	withCredentials: true,
	// Fail hung requests instead of holding a browser connection open indefinitely
	// under load — a timed-out request rejects and can be retried by React Query.
	timeout: REQUEST_TIMEOUT_MS,
});
apiClient.interceptors.request.use((request) => {
	if (isClient) {
		const token = Cookie.get(COOKIES.AUTH_TOKEN);
		const language = Cookie.get(COOKIES.NEXT_LOCALE);

		if (token) {
			request.headers = request.headers || {};
			request.headers.Authorization = `Bearer ${token}`;
		}

		request.headers = request.headers || {};

		if (!isDevelopmentEnv()) {
			const emulatedRoleId = Cookie.get(COOKIES.EMULATED_ROLE_ID);

			if (emulatedRoleId) {
				request.headers["x-emulated-role-id"] = emulatedRoleId;
			} else {
				delete request.headers["x-emulated-role-id"];
			}
		}

		request.headers["accept-language"] = language || LANGUAGES.ENGLISH;
	}

	request.headers["x-timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;

	return request;
});
// Response interceptor
export type ErrorResponseType = {
	message: string;
};
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error: AxiosError<ErrorResponseType>) => {
		const status = error?.response?.status;
		const errorMessage = error?.response?.data?.message?.toLowerCase() || "";

		// Only a genuine auth failure ends the session. A transient error — a request
		// timeout or network drop (no response at all), or a 5xx from an overloaded
		// server — must NOT clear cookies, otherwise high traffic logs everyone out.
		const isAuthFailure = status === 401 && errorMessage.includes("invalid token");

		if (isAuthFailure) {
			clearCookies();
			// Redirect to signin page
			if (isClient) {
				window.location.href = "/signin";
			}
		}
		// Reject the promise with the error so it can be handled by the calling code
		return Promise.reject(error);
	}
);
export { apiClient, apiUrl };
