import {
	E_WEEKEND_WORK_ADMIN_STATUS,
	E_WEEKEND_WORK_USER_STATUS,
	IGetWeekendWorksResponse,
} from "../types/schedule-config";

export const getWeekendWorkAdminStatus = (adminStatus: E_WEEKEND_WORK_ADMIN_STATUS) => {
	switch (adminStatus) {
		case E_WEEKEND_WORK_ADMIN_STATUS.REQUEST_SENT:
			return {
				label: "Request Sent",
				className: "text-yellow-400  font-medium text-sm",
			};
		case E_WEEKEND_WORK_ADMIN_STATUS.APPROVED:
			return {
				label: "Approved",
				className: "text-green-500  font-medium text-sm",
			};
		case E_WEEKEND_WORK_ADMIN_STATUS.DECLINED:
			return {
				label: "Declined",
				className: "text-red-500  font-medium text-sm",
			};
		default:
			return {
				label: "--",
				className: "",
			};
	}
};

export const getWeekendWorkTechStatus = (userStatus: E_WEEKEND_WORK_USER_STATUS | null | undefined) => {
	switch (userStatus) {
		case E_WEEKEND_WORK_USER_STATUS.APPROVED:
			return {
				label: "Interested",
				className: "text-green-500  font-medium text-sm",
			};
		case E_WEEKEND_WORK_USER_STATUS.DECLINED:
			return {
				label: "Declined",
				className: "text-red-500  font-medium text-sm",
			};

		case E_WEEKEND_WORK_USER_STATUS.OPT_OUT:
			return {
				label: "Opted Out",
				className: "text-red-500  font-medium text-sm",
			};
		default:
			return {
				label: "--",
				className: "",
			};
	}
};

/** Builds a human-friendly summary for "Employees Working" cell.
 * Example: "3 Members (2 Accepted & 1 Declined)"
 */
export const buildEmployeeSummary = (
	userWorks: IGetWeekendWorksResponse["data"][number]["userWeekendWorks"]
): string => {
	const total = userWorks?.length ?? 0;
	if (total === 0) return "0 Members";

	const accepted = userWorks?.filter((u) => u.userStatus === E_WEEKEND_WORK_USER_STATUS.APPROVED).length ?? 0;

	const declined = userWorks?.filter((u) => u.userStatus === E_WEEKEND_WORK_USER_STATUS.DECLINED).length ?? 0;

	const parts: string[] = [];
	if (accepted > 0) parts.push(`${accepted} Accepted`);
	if (declined > 0) parts.push(`${declined} Declined`);

	const summary = parts.length > 0 ? ` (${parts.join(" & ")})` : "";
	return `${total} ${total === 1 ? "Member" : "Members"}${summary}`;
};
