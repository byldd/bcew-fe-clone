import React from "react";
import { useFormContext } from "react-hook-form";
import { ICreateDailyJobFromCardFormSchema } from "../../utils/create-daily-job-form";
import { useScheduleContext } from "../../context/schedule-context";

import { Trash2 } from "lucide-react";
import SelectJobMember from "../no-schedule-card/select-job-member";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import { ICardEmployeeFieldProps } from "../../types/card-props";
import StopNumberInput from "@/components/ui/stop-number-input";

const CardEmployeeField = ({ specialJob, rowType, date, bcewJob }: ICardEmployeeFieldProps) => {
	const formContext = useFormContext<ICreateDailyJobFromCardFormSchema>();

	const { jobEmployeeAssignments = [], subcontractorId, crewLeaderId, taskLeaderId, labelIds } = formContext.watch();

	const { subcontractors } = useScheduleContext();

	const subcontractor = subcontractors?.find((subcontractor) => subcontractor.id === subcontractorId);

	const onSelectStopNumber = (stopNumber: number | null, index: number) => {
		const assignment = jobEmployeeAssignments?.[index];
		if (!assignment) return;
		formContext.setValue(`jobEmployeeAssignments.${index}.stopNumber`, stopNumber);
	};

	const onRemoveEmployee = (index: number) => {
		formContext.setValue("jobEmployeeAssignments", jobEmployeeAssignments?.filter((_, i) => i !== index) || []);

		const isHeCrewLeader = jobEmployeeAssignments?.[index]?.employeeId === crewLeaderId;
		const isHeTaskLeader = jobEmployeeAssignments?.[index]?.employeeId === taskLeaderId;

		if (isHeCrewLeader) {
			formContext.setValue("crewLeaderId", "");
		}
		if (isHeTaskLeader) {
			formContext.setValue("taskLeaderId", "");
		}

		if (index == jobEmployeeAssignments?.length - 1) {
			formContext.setValue("crewLeaderId", "");
			formContext.setValue("taskLeaderId", "");
		}
	};

	const onRemoveSubcontractor = () => {
		formContext.setValue("subcontractorId", "");
		formContext.setValue("labelIds", labelIds?.filter((label) => label !== legends.subContractorJob) || []);
	};

	return (
		<div className="mt-2 w-full">
			<div>
				{jobEmployeeAssignments?.map((assignment, index) => (
					<div key={`${assignment.employeeId}-${index}`} className="flex justify-between">
						<p className="text-xs">{assignment.employeeName}</p>
						<div className="flex items-center gap-2">
							<StopNumberInput
								value={assignment.stopNumber ?? undefined}
								onChange={(stopNumber) => onSelectStopNumber(stopNumber, index)}
							/>
							<Trash2 size={16} className="cursor-pointer text-brand-dark50" onClick={() => onRemoveEmployee(index)} />
						</div>
					</div>
				))}
				{subcontractorId && subcontractor && (
					<div className="mt-1 flex justify-between">
						<p className="text-xs">{subcontractor.user.name}</p>
						<Trash2 size={16} className="cursor-pointer text-brand-dark50" onClick={onRemoveSubcontractor} />
					</div>
				)}
			</div>
			<div className="flex w-full flex-col">
				<SelectJobMember specialJob={specialJob} rowType={rowType} date={date} bcewJob={bcewJob} />
			</div>
		</div>
	);
};

export default CardEmployeeField;
