import React from "react";
import BackButton from "@/components/common/back-button";
import ReadFilter from "./read-filter";
import NotificationDateFilter from "./notification-date-filter";
import PushNotification from "./push-notification";
import { PushNotificationVariant } from "../types/push-notifications";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import EmployeeMarkAllRead from "./employee-mark-all-read";

const NotificationHeader = () => {
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	return (
		<div className="mb-4 space-y-3">
			{/* Top Row */}
			<div className="flex items-center justify-between text-center">
				<div className="flex items-center gap-1">
					<BackButton />
					<h1 className="text-lg font-semibold text-gray-900">{tCommon.notifications}</h1>
				</div>

				<PushNotification variant={PushNotificationVariant.EMPLOYEE} />
				{/* <EmployeeMarkAllRead /> */}
			</div>

			{/* Filters Row */}
			<div className="flex items-center justify-between gap-1 px-1">
				<NotificationDateFilter />
				<div className="flex items-center gap-1">
					<EmployeeMarkAllRead />
					<ReadFilter />
				</div>
			</div>
		</div>
	);
};

export default NotificationHeader;
