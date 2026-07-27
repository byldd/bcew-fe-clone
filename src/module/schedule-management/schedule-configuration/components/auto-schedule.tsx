import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import React from "react";

const AutoSchedule = () => {
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	return (
		<div className="space-y-3 rounded-[20px] border border-brand-dark10 bg-white px-6 py-4">
			<p className="text-lg font-semibold text-brand-dark">{tCommon.scheduleManagement}</p>
			<div className="grid grid-cols-2 gap-4 text-gray-400">
				<div className="space-y-2">
					<p className="text-sm font-medium text-brand-dark50">{tschedule.autoSchedulingFrequency}</p>
					<p className="text-sm font-semibold">{tschedule.daily}</p>
				</div>

				<div className="space-y-2">
					<p className="text-sm font-medium text-brand-dark50">{tschedule.autoSchedulingTime}</p>
					<p className="text-sm font-semibold">3:15 PM</p>
				</div>
			</div>
		</div>
	);
};

export default AutoSchedule;
