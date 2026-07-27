import React from "react";
import { useNotificationParam } from "../hook/useNotificationParam";
import { SelectField } from "@/components/ui/selectField";
import { NOTIFICATION_READ_FILTER } from "../types/type";
import { useNotificationOptions } from "../utils/filter-option";
import { useUpdateNotificationPreferenceDebounced } from "../hook/useUpdateNotificationPreferenceDebounced";

const ReadFilter = () => {
	const { getParams, setParams } = useNotificationParam();
	const { readFilter, teamId } = getParams();
	const { readFilterOptions } = useNotificationOptions();

	const updatePreference = useUpdateNotificationPreferenceDebounced();

	return (
		<SelectField
			options={readFilterOptions}
			value={readFilter ?? undefined}
			placeholder="Select read status"
			onValueChange={(value) => {
				setParams(
					{
						readFilter: value as NOTIFICATION_READ_FILTER,
						teamId,
					},
					true,
					true
				);

				updatePreference({
					readFilter: value as NOTIFICATION_READ_FILTER,
				});
			}}
			className="h-10 gap-2 rounded-[8px] border border-brand-dark10 bg-white px-4 font-inter text-sm font-medium text-brand-dark shadow-md"
		/>
	);
};

export default ReadFilter;
