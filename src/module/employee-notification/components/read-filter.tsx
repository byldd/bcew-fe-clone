import React from "react";
import { useNotificationParam } from "@/module/admin/notifications/hook/useNotificationParam";
import { SelectField } from "@/components/ui/selectField";
import { NOTIFICATION_READ_FILTER } from "@/module/admin/notifications/types/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const ReadFilter = () => {
	const { getParams, setParams } = useNotificationParam();
	const { readFilter } = getParams();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	return (
		<SelectField
			className="mr-1 h-10 w-full rounded-[8px] border-brand-bgLightgrey04 bg-white text-sm shadow-sm"
			value={readFilter || undefined}
			placeholder="Select read status"
			onValueChange={(value) => {
				setParams({ readFilter: value as NOTIFICATION_READ_FILTER });
			}}
			options={[
				{ label: tschedule.all, value: NOTIFICATION_READ_FILTER.ALL },
				{ label: tschedule.unreads, value: NOTIFICATION_READ_FILTER.UNREADS },
				{ label: tschedule.reads, value: NOTIFICATION_READ_FILTER.READS },
			]}
		/>
	);
};

export default ReadFilter;
