import { ROLES } from "@/types";

export const getTechnicalIssueEndpoint = (userType: ROLES | undefined) => {
	switch (userType) {
		case ROLES.ADMIN:
		case ROLES.TECHNICIAN_EMPLOYEE:
			return "/employee/technical-issues";

		case ROLES.SUB_CONTRACTOR:
		case ROLES.SUB_CONTRACTOR_CREW_LEADER:
			return "/sub-contractor/technical-issues";

		default:
			throw new Error("Unsupported user role");
	}
};
