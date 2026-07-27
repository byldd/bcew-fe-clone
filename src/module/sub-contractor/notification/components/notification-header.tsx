import React from "react";
import BackButton from "@/components/common/back-button";
import PushNotification from "@/module/employee-notification/components/push-notification";
import { PushNotificationVariant } from "@/module/employee-notification/types/push-notifications";
import NotificationDateFilter from "@/module/employee-notification/components/notification-date-filter";
import ReadFilter from "@/module/employee-notification/components/read-filter";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import useAuthStore from "@/store/auth-store";
import CrewMarkAllRead from "./crew-mark-all-read";
import SubContractorAdminMarkAllRead from "./sub-contractor-admin-mark-all-read";
import SubCrewPushNotification from "./push-notification";

const NotificationHeader = () => {
	const { user, subcontractorCrew } = useAuthStore((state) => state);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	return (
		<div className="my-4 space-y-3">
			{/* Top Row */}
			<div className="flex items-center justify-between text-center">
				<div className="flex items-center gap-1">
					<BackButton />
					<h1 className="text-lg font-semibold text-gray-900">{tCommon.notifications}</h1>
				</div>

				{user ? <PushNotification variant={PushNotificationVariant.EMPLOYEE} /> : <SubCrewPushNotification />}
			</div>

			{/* Filters Row */}
			<div className="flex items-center justify-between gap-1 px-1">
				<NotificationDateFilter />
				<div className="flex items-center gap-1">
					{user ? <SubContractorAdminMarkAllRead /> : subcontractorCrew ? <CrewMarkAllRead /> : <></>}

					<ReadFilter />
				</div>
			</div>
		</div>
	);
};

export default NotificationHeader;
