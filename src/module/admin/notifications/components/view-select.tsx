import React from "react";
import { useNotificationParam } from "../hook/useNotificationParam";
import { SelectField } from "@/components/ui/selectField";
import { NOTIFICATION_VIEW } from "../types/type";
import { useNotificationOptions } from "../utils/filter-option";
import { useUpdateNotificationPreferenceDebounced } from "../hook/useUpdateNotificationPreferenceDebounced";

const ViewSelect = () => {
	const { getParams, setParams } = useNotificationParam();
	const { view, teamId } = getParams();
	const { viewOptions } = useNotificationOptions();

	const updatePreference = useUpdateNotificationPreferenceDebounced();

	return (
		<SelectField
			options={viewOptions}
			value={view ?? undefined}
			placeholder="Select read status"
			onValueChange={(value) => {
				setParams({
					view: value as NOTIFICATION_VIEW,
					notificationTypes: null,
					moduleGroups: null,
					activeGroup: null,
					type: null,
					teamId,
				});

				updatePreference({
					view: value as NOTIFICATION_VIEW,
				});
			}}
			className="h-10 gap-2 rounded-[8px] border border-brand-dark10 bg-white px-4 font-inter text-sm font-medium text-brand-dark shadow-md"
		/>
	);
};

export default ViewSelect;
