import { Button } from "@/components/ui/button";
import { CiSquarePlus } from "react-icons/ci";
import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { getTodayDate, isSameDate } from "@/lib/utils/date";
import { IEmployeeScheduleItem } from "../../types";
import AddNewStopModal from "../add-new-stop/add-new-stop-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const EmployeeStopButton = ({
	isOpen,
	setIsOpen,
	employeeSchedules,
}: {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	employeeSchedules: IEmployeeScheduleItem[];
}) => {
	const { getParams } = useEmployeeScheduleParams();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const { startDate } = getParams();
	const isCurrentDate = isSameDate(startDate, getTodayDate());

	if (!isCurrentDate) {
		return null;
	}

	const maxStopNumber = Math.max(...employeeSchedules.map((schedule) => schedule.stopNumber || 0));
	const newStop = Math.max(maxStopNumber + 1, employeeSchedules.length + 1);

	return (
		<>
			{!isOpen ? (
				<Button variant="outline" className="h-10 w-full font-medium" onClick={() => setIsOpen(true)}>
					{tEmployee.addNewStop}
					<CiSquarePlus className="font-bold text-brand-dark" style={{ width: "22px", height: "22px" }} />
				</Button>
			) : (
				<AddNewStopModal setIsOpen={() => setIsOpen(false)} newStop={newStop} />
			)}
		</>
	);
};

export default EmployeeStopButton;
