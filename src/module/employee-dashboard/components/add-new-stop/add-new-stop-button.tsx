import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import AddNewStopModal from "./add-new-stop-modal";
import useAuthStore from "@/store/auth-store";
import { E_ROLES } from "@/utils/enums";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { getTodayDate, isSameDate } from "@/lib/utils/date";
import { IEmployeeScheduleItem } from "../../types";
import { FaRegSquarePlus } from "react-icons/fa6";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { getUserExemptFromSpecialCardTimeLogging } from "@/module/employee/utils/role";

const AddNewStopButton = ({
	employeeSchedules,
	isTimeLogPending,
}: {
	employeeSchedules: IEmployeeScheduleItem[];
	isTimeLogPending: boolean | undefined;
}) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const { user } = useAuthStore((state) => state);
	const [isOpen, setIsOpen] = useState(false);
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();
	const isCurrentDate = isSameDate(startDate, getTodayDate());

	const isForeman = user?.role?.name?.toLowerCase() === E_ROLES.FOREMAN.toLowerCase();

	const isSpecialCardTimeLoggingExempt =
		user &&
		user?.role &&
		getUserExemptFromSpecialCardTimeLogging({
			user,
			userRole: user?.role,
		});

	if (!isForeman || !isCurrentDate || isTimeLogPending || isSpecialCardTimeLoggingExempt) {
		return null;
	}

	const maxStopNumber = Math.max(...employeeSchedules.map((schedule) => schedule.stopNumber || 0));
	const newStop = Math.max(maxStopNumber + 1, employeeSchedules.length + 1);

	return (
		<div className="px-2">
			{!isOpen ? (
				<Button
					onClick={() => setIsOpen(true)}
					className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-brand-dark bg-white px-6 text-base font-semibold text-brand-dark dark:bg-gray-800"
				>
					<FaRegSquarePlus size={20} />
					{tEmployee.addNewStop}
				</Button>
			) : (
				<AddNewStopModal setIsOpen={() => setIsOpen(false)} newStop={newStop} />
			)}
		</div>
	);
};

export default AddNewStopButton;
