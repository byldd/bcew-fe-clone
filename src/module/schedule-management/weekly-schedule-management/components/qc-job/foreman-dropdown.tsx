import React, { useMemo, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useScheduleContext } from "../../context/schedule-context";
import { cn } from "@/lib/utils/utils";
import { FaCircleCheck } from "react-icons/fa6";
import { IQcInspectionJobFormSchema } from "../../utils/qc-job-form-schema";
import { useFormContext } from "react-hook-form";
import { getFormanOptions } from "../../utils/member-form";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const ForemanDropdown = () => {
	const [inputValue, setInputValue] = useState("");
	const formContext = useFormContext<IQcInspectionJobFormSchema>();
	const { jobEmployeeAssignments } = formContext.watch();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const { inspectionForeman } = useScheduleContext();

	const inspectionForemanOptions = useMemo(() => {
		return getFormanOptions(inspectionForeman);
	}, [inspectionForeman]);

	const onSelectForeman = (option: (typeof inspectionForemanOptions)[number]) => {
		formContext.setValue("jobEmployeeAssignments", [
			{
				employeeId: option.value as string,
				employeeName: option.label,
			},
		]);
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

							{inspectionForemanOptions.length > 0 && (
								<CommandGroup heading="Employees">
									{inspectionForemanOptions.map((option, index) => {
										const isSelected = jobEmployeeAssignments?.some((employee) => employee.employeeId === option.value);
										return (
											<CommandItem
												className={cn(
													"mb-1 rounded-none !p-3 text-xs",
													isSelected ? "bg-[#15151512] text-brand-dark" : "hover:!bg-[#15151512]"
												)}
												key={`${option.value}-${index}`}
												onSelect={() => onSelectForeman(option)}
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

export default ForemanDropdown;
