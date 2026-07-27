import React, { useState } from "react";
import { useGetLabels } from "../hooks/useSchedule";
import { OptionItem } from "@/components/ui/multi-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils/utils";
import { ChevronDown } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { JobStatus } from "@/module/employee-dashboard/types";
import { FaCircleCheck } from "react-icons/fa6";
import { FORM_MODE } from "@/types";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import useAuthStore from "@/store/auth-store";

const JobLabelField = ({
	onChange,
	value,
	disabled,
	mode,
	trigger,
}: {
	onChange: (value: string[]) => void;
	value: string[];
	disabled?: boolean;
	mode?: FORM_MODE;
	trigger?: React.ReactNode;
}) => {
	const { user } = useAuthStore((state) => state);
	const { data, isLoading } = useGetLabels(user);
	const [inputValue, setInputValue] = useState("");
	const legendsToDisable = mode
		? [legends.validationWarning, legends.qcJob, legends.jobNotReady, legends.training, legends.autoRescheduledJob]
		: [];
	const legendsToHide = [legends.lockedJob, legends.manualOverride, legends.shadowing];
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	const labelOptions =
		data
			?.map((label) => ({ id: label.id, name: label.name }))
			.filter((label) => {
				if (legendsToHide.includes(label.id as unknown as (typeof legendsToHide)[0])) {
					return false;
				}
				if (mode == FORM_MODE.CREATE) {
					return label.id != legends.jobNotReady;
				}
				return true;
			}) || [];

	const selectedLabels = labelOptions.filter((label) => value?.includes(label.id));

	function toggleItem(item: OptionItem) {
		const exists = selectedLabels.find((i) => i.id === item.id);

		if (exists) {
			onChange(selectedLabels.filter((i) => i.id !== item.id).map((i) => i.id));
		} else {
			onChange([...(value ?? []), item.id]);
		}
	}
	const MAX_VISIBLE = 8;
	const visible = selectedLabels.slice(0, MAX_VISIBLE);
	const overflow = selectedLabels.length - MAX_VISIBLE;

	return (
		<div className="space-y-2">
			<Popover>
				<PopoverTrigger asChild className="w-full flex-1">
					{trigger ? (
						trigger
					) : (
						<Button
							variant="ghost"
							className={cn(
								"text-left",
								"w-full",
								"bg-brand-bgLightgrey",
								"text-xs",
								"h-10",
								"px-3",
								"py-2",
								"mt-0",
								"rounded-[10px]",

								"border-none",
								"font-normal",
								"outline-none",
								"focus:outline-none",
								"focus:ring-0",
								"focus:border-none",
								"justify-between",
								"font-normal",
								selectedLabels.length === 0 ? "text-gray-500" : "text-black",
								"w-full flex-1"
							)}
							disabled={disabled}
						>
							<div className="flex items-center space-x-4">
								{selectedLabels.length === 0 ? (
									tschedule.jobStatus
								) : (
									<>
										{visible.map((lbl) => {
											const icon = statusIcons[lbl.id as JobStatus];
											return <span key={lbl.id}>{icon}</span>;
										})}
										{overflow > 0 && <span className="text-sm">+{overflow}</span>}
									</>
								)}
							</div>
							<ChevronDown className="h-4 w-4 text-gray-400" />
						</Button>
					)}
				</PopoverTrigger>
				<PopoverContent className="w-full !min-w-[350px] p-0">
					<Command className="!w-full">
						<CommandInput placeholder={tschedule.typeToFilter} value={inputValue} onValueChange={setInputValue} />
						<div className="max-h-[250px] overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
							<CommandEmpty>{tschedule.noResultsFound}</CommandEmpty>
							<CommandGroup>
								{labelOptions.map((option, idx) => {
									const icon = statusIcons[option.id as JobStatus];
									const isSelected = selectedLabels.some((i) => i.id === option.id);
									const isLast = idx === labelOptions.length - 1;
									return (
										<CommandItem
											className={cn(
												"mb-1 rounded-none !p-3 font-semibold",
												!isLast && "border-b border-gray-200",

												isSelected ? "bg-[#15151512] text-brand-dark" : "hover:!bg-[#15151512]"
											)}
											key={option.id}
											onSelect={() => toggleItem(option)}
											disabled={legendsToDisable.includes(option.id as unknown as (typeof legendsToDisable)[0])}
										>
											<span>{icon}</span>
											<span className="ml-2">{option.name}</span>
											{selectedLabels.find((i) => i.id === option.id) && (
												<span className="ml-auto">
													<FaCircleCheck />
												</span>
											)}
										</CommandItem>
									);
								})}
							</CommandGroup>
						</div>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default JobLabelField;
