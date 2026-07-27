import { IUser } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { IRole } from "../types";

const getUserExemptFromSpecialCardTimeLogging = ({
	user,
	userRole,
}: {
	user: Pick<IUser, "isPermissionOverridden" | "isSpecialCardTimeLoggingExempt">;
	userRole: Pick<IRole, "isSpecialCardTimeLoggingExempt">;
}) => {
	return user?.isPermissionOverridden ? user?.isSpecialCardTimeLoggingExempt : userRole?.isSpecialCardTimeLoggingExempt;
};

export { getUserExemptFromSpecialCardTimeLogging };
