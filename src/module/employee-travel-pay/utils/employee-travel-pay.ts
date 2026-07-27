import { IAuthStore } from "@/module/profile/types";
import { getUserExemptFromSpecialCardTimeLogging } from "@/module/employee/utils/role";

export const isEligibleForTravelPay = ({ user: authUser }: { user: IAuthStore["user"] }) => {
	if (!authUser?.role) return false;
	const isSpecialCardTimeLoggingExempt = getUserExemptFromSpecialCardTimeLogging({
		user: authUser,
		userRole: authUser?.role,
	});

	return (
		!!authUser?.role?.canSendTravelPayRequest && !!authUser?.role?.trackTimeByGPS && !isSpecialCardTimeLoggingExempt
	);
};
