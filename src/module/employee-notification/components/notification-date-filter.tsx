import React from "react";
import DatePickModal from "@/components/common/date-pick-modal";
import { dateToUTCString, toDate } from "@/lib/utils/date";
import { useNotificationParam } from "@/module/admin/notifications/hook/useNotificationParam";

const NotificationDateFilter = () => {
	const { getParams, setParams } = useNotificationParam();
	const { date } = getParams();

	return (
		<DatePickModal
			value={date ? dateToUTCString(toDate(date)) : undefined}
			onChange={(date) => {
				setParams({ date: date ? toDate(date) : null });
			}}
			allowClear
		/>
	);
};

export default NotificationDateFilter;
