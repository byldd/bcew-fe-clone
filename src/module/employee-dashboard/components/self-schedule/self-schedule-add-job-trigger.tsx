import { Button } from "@/components/ui/button";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import React from "react";

const SelfScheduleAddJobTrigger = ({ setSelfScheduleOpen }: { setSelfScheduleOpen: (open: boolean) => void }) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	return (
		<div className="mt-2 px-2">
			<Button
				className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-brand-dark bg-white px-6 text-base font-semibold text-brand-dark dark:bg-gray-800"
				onClick={() => setSelfScheduleOpen(true)}
			>
				{tEmployee.scheduleAnotherJob}
			</Button>
		</div>
	);
};

export default SelfScheduleAddJobTrigger;
