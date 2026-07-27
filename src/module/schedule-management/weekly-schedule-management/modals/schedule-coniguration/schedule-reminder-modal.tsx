import React from "react";
import { Button } from "@/components/ui/button";
import { IScheduleReminderModalProps } from "../../types/schedule-interface";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

const ScheduleReminderModal: React.FC<IScheduleReminderModalProps> = ({ onClose }) => {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const router = useRouter();

	const handleConfigureClick = () => {
		return router.push(routes.admin.configuration);
	};

	return (
		<div>
			<p className="mb-6 text-brand-dark50">
				{/* We will create a <span className="font-semibold text-brand-dark">New Schedule</span> after{" "}
				<span className="font-semibold text-brand-dark">15 mins</span>. If you want to make the changes, now is the
				correct time to do it. */}
				{tschedule.newScheduleMessage}
			</p>
			<div className="flex justify-end space-x-4">
				<Button variant="outline" onClick={onClose} className="w-full">
					{tCommon.cancel}
				</Button>
				<Button onClick={handleConfigureClick} variant={"filled"} className="w-full">
					{tschedule.configureSchedule}
				</Button>
			</div>
		</div>
	);
};

export default ScheduleReminderModal;
