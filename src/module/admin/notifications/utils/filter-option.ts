import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NOTIFICATION_READ_FILTER, NOTIFICATION_VIEW } from "../types/type";
import { NAMESPACE } from "@/i18n/type";
import useAuthStore from "@/store/auth-store";
import { ROLES } from "@/types";

export const useNotificationOptions = () => {
	const { user } = useAuthStore((state) => state);
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const readFilterOptions = [
		{ label: tSchedule.all, value: NOTIFICATION_READ_FILTER.ALL },
		{ label: tSchedule.unreads, value: NOTIFICATION_READ_FILTER.UNREADS },
		{ label: tSchedule.reads, value: NOTIFICATION_READ_FILTER.READS },
	];

	const viewOptions =
		user?.userType === ROLES.ADMIN
			? [
					{ label: tSchedule.defaultView, value: NOTIFICATION_VIEW.DEFAULT_VIEW },
					{ label: tSchedule.all, value: NOTIFICATION_VIEW.ALL },
					{ label: "Module Based", value: NOTIFICATION_VIEW.MODULE },
				]
			: [
					{ label: tSchedule.defaultView, value: NOTIFICATION_VIEW.DEFAULT_VIEW },
					{ label: tSchedule.all, value: NOTIFICATION_VIEW.ALL },
				];

	return { readFilterOptions, viewOptions };
};
