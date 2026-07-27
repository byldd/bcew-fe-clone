import React from "react";
import { useNotificationParam } from "../hook/useNotificationParam";
import DatePickModal from "@/components/common/date-pick-modal";
import { dateToUTCString, toDate } from "@/lib/utils/date";

const NotificationDateFilter = () => {
	const { getParams, setParams } = useNotificationParam();
	const { date, teamId } = getParams();

	return (
		<DatePickModal
			value={date ? dateToUTCString(toDate(date)) : undefined}
			onChange={(date) => {
				setParams({ date: date ? toDate(date) : null, teamId }, true, true);
			}}
			allowClear
		/>
	);
};

export default NotificationDateFilter;
