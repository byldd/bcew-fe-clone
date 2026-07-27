import React, { useMemo, useState } from "react";
import { useScheduleContext } from "../../context/schedule-context";
import { cn } from "@/lib/utils/utils";
import { ChevronDown } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

import { FaCircleCheck } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { ICreateDailyJobFromCardFormSchema } from "../../utils/create-daily-job-form";
import { useFormContext } from "react-hook-form";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import { ISelectJobMemberProps } from "../../types/card-props";
import { SCHEDULE_ROW_TYPE } from "../../constants/week-schedule";
import { getJobEmployeeOptions } from "../../utils/filter-data";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const SelectJobMember = ({ specialJob, rowType, date, bcewJob }: ISelectJobMemberProps) => {
	const { employees, crews, subcontractors, weekendWorks } = useScheduleContext();
	const [inputValue, setInputValue] = useState("");
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const formContext = useFormContext<ICreateDailyJobFromCardFormSchema>();

	const { jobEmployeeAssignments, crewLeaderId, subcontractorId, labelIds, specialJobId } = formContext.watch();

	const { employeesOptions, crewsOptions, subcontractorsOptions } = useMemo(() => {
		const employeeOptions = getJobEmployeeOptions({
			employees,
			date,
			weekendWorks,
			specialJob,
			jobPhase: bcewJob?.schlin?.tsknum || bcewJob?.schlinExtended?.tsknum,
			workOrder: bcewJob?.srvinv?.ordnum,
		});

		const crewsOptions =
			subcontractorId || specialJobId || rowType === SCHEDULE_ROW_TYPE.QC_REPAIR
				? []
				: crews?.map((crew) => ({
						crewId: crew.id,
						label: crew.name,
						crewLeaderId: crew.crewLeaderId,
					})) || [];

		const subcontractorsOptions =
			crewLeaderId || !!jobEmployeeAssignments?.length || specialJobId
				? []
				: subcontractors?.map((subcontractor) => ({
						subcontractorId: subcontractor.id,
						label: subcontractor.user.name,
						disabled: subcontractorId ? subcontractorId !== subcontractor.id : false,
					})) || [];

		const employeesOptions = subcontractorId ? [] : employeeOptions || [];

		return {
			employeesOptions,
			crewsOptions,
			subcontractorsOptions,
		};
	}, [
		crews,
		subcontractors,
		employees,
		crewLeaderId,
		jobEmployeeAssignments,
		subcontractorId,
		specialJobId,
		specialJob,
		rowType,
		date,
		weekendWorks,
		bcewJob,
	]);

	const onSelectEmployeeOption = (value: { employeeId: string; employeeName: string }) => {
		const ifAlreadySelected = jobEmployeeAssignments?.some((employee) => employee.employeeId === value.employeeId);
		const updatedValues = ifAlreadySelected
			? jobEmployeeAssignments?.filter((employee) => employee.employeeId !== value.employeeId)
			: [...(jobEmployeeAssignments || []), { ...value, stopNumber: undefined }];

		formContext.setValue(
			"jobEmployeeAssignments",
			updatedValues?.map((employee) => ({
				...employee,
				employeeId: employee.employeeId,
				employeeName: employee.employeeName,
				stopNumber: employee.stopNumber,
			})) || []
		);

		if (!updatedValues?.length) {
			formContext.setValue("taskLeaderId", "");
			formContext.setValue("crewLeaderId", "");
		}
		if (!crewLeaderId) {
			formContext.setValue("crewLeaderId", value.employeeId);
		}
		setInputValue("");
	};

	const onSelectCrewLeaderOption = (value: { crewLeaderId: string; label: string; crewId: string }) => {
		const crew = crews?.find((crew) => crew.id === value.crewId);
		if (crew) {
			const memberEmployees = [
				{ employeeId: crew.crewLeaderId, employeeName: crew?.crewLeader?.employeeName },
				...(crew?.crewEmployees?.map((employee) => {
					return {
						employeeId: employee.employee.id,
						employeeName: employee.employee.user.name,
					};
				}) || []),
			];

			const activeEmployees = employees?.filter((employee) =>
				memberEmployees?.some((memberEmployee) => memberEmployee.employeeId === employee.id)
			);

			const selected = getJobEmployeeOptions({
				employees: activeEmployees,
				date,
				weekendWorks,
				specialJob,
				jobPhase: bcewJob?.schlin?.tsknum || bcewJob?.schlinExtended?.tsknum,
				workOrder: bcewJob?.srvinv?.ordnum,
			})
				?.filter((item) => !item.disabled)
				?.filter((item) => !jobEmployeeAssignments?.some((employee) => employee.employeeId === item.employeeId));

			const ifAlreadySelected = crewLeaderId === value.crewLeaderId;
			if (ifAlreadySelected) {
				formContext.setValue("crewLeaderId", "");
				formContext.setValue("taskLeaderId", "");
				formContext.setValue("jobEmployeeAssignments", []);
			} else {
				formContext.setValue("crewLeaderId", value.crewLeaderId);
				formContext.setValue("taskLeaderId", value.crewLeaderId);

				const uniqueEmployees = [
					...new Set([
						...(jobEmployeeAssignments || []),
						...selected?.map((item) => ({
							employeeId: item.employeeId,
							employeeName: item.employeeName,
						})),
					]),
				];

				formContext.setValue(
					"jobEmployeeAssignments",
					uniqueEmployees?.filter(
						(item, index, self) => index === self.findIndex((t) => t.employeeId === item.employeeId)
					)
				);
			}
		}
	};

	const onSelectSubcontractorOption = (value: { subcontractorId: string }) => {
		const ifAlreadySelected = subcontractorId === value.subcontractorId;

		if (ifAlreadySelected) {
			formContext.setValue("subcontractorId", "");
			formContext.setValue("labelIds", labelIds?.filter((label) => label !== legends.subContractorJob) || []);
		} else {
			const updatedValues = ifAlreadySelected ? subcontractorId : value.subcontractorId;
			formContext.setValue("subcontractorId", updatedValues || "");
			if (!labelIds?.includes(legends.subContractorJob)) {
				formContext.setValue("labelIds", [...(labelIds || []), legends.subContractorJob]);
			}
		}
	};

	return (
		<div className="space-y-2">
			<Popover>
				<PopoverTrigger asChild className="w-full flex-1">
					<Button className="my-1 h-8 px-1">
						<div className="flex items-center text-xs text-brand-dark30">{tschedule.searchMemberCrew}</div>
						<ChevronDown className="h-4 w-4 p-0 text-gray-400" />
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="z-[999999] w-full min-w-[350px] p-0">
					<Command className="!w-full">
						<CommandInput placeholder={tschedule.typeToFilter} value={inputValue} onValueChange={setInputValue} />
						<div className="max-h-[250px] overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
							<CommandEmpty>{tschedule.noResultsFound}</CommandEmpty>
							{subcontractorsOptions.length > 0 && (
								<CommandGroup heading="Subcontractors">
									{subcontractorsOptions.map((option) => {
										const isSelected = subcontractorId === option.subcontractorId;
										return (
											<CommandItem
												className={cn(
													"mb-1 flex w-full items-center rounded-none !p-3 text-xs",
													isSelected ? "bg-[#15151512] text-brand-dark" : "hover:!bg-[#15151512]"
												)}
												key={option.subcontractorId}
												onSelect={() => onSelectSubcontractorOption(option)}
												disabled={option.disabled}
											>
												<span className="ml-2">{option.label}</span>
												{isSelected && (
													<span className="ml-auto">
														<FaCircleCheck />
													</span>
												)}
											</CommandItem>
										);
									})}
								</CommandGroup>
							)}

							{crewsOptions.length > 0 && (
								<CommandGroup heading="Crews">
									{crewsOptions.map((option) => {
										const isSelected = crewLeaderId === option.crewLeaderId;
										return (
											<CommandItem
												className={cn(
													"mb-1 w-full rounded-none !p-3 text-xs",
													isSelected ? "bg-[#15151512] text-brand-dark" : "hover:!bg-[#15151512]"
												)}
												key={option.crewLeaderId}
												onSelect={() => onSelectCrewLeaderOption(option)}
											>
												<span className="ml-2">{option.label}</span>
												{isSelected && (
													<span className="ml-auto">
														<FaCircleCheck />
													</span>
												)}
											</CommandItem>
										);
									})}
								</CommandGroup>
							)}

							{employeesOptions.length > 0 && (
								<CommandGroup heading="Employees">
									{employeesOptions.map((option, index) => {
										const isSelected = jobEmployeeAssignments?.some(
											(employee) => employee.employeeId === option.employeeId
										);
										return (
											<CommandItem
												disabled={option.disabled}
												className={cn(
													"mb-1 rounded-none !p-3 text-xs",
													isSelected ? "bg-[#15151512] text-brand-dark" : "hover:!bg-[#15151512]"
												)}
												key={`${option.employeeId}-${index}`}
												onSelect={() => onSelectEmployeeOption(option)}
											>
												<span className="ml-2">{option.label}</span>
												{isSelected && (
													<span className="ml-auto">
														<FaCircleCheck />
													</span>
												)}
											</CommandItem>
										);
									})}
								</CommandGroup>
							)}
						</div>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default SelectJobMember;
