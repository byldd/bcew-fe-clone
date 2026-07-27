import { IWeekScheduleResponse } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import React, { useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { IForemanAddJobFormSchema } from "../../utils/foreman-add-job-form";

import { ScrollArea } from "@/components/ui/scroll-area";
import { FaCircleCheck } from "react-icons/fa6";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const SearchJob = ({ scheduleJobs }: { scheduleJobs: IWeekScheduleResponse | undefined }) => {
	const formContext = useFormContext<IForemanAddJobFormSchema>();
	const { actrec, stopNumber } = formContext.watch();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const jobNameOptions = useMemo(() => {
		const jobNameOptions =
			scheduleJobs?.bcewJobs?.map((job) => {
				const actrec = job.schlin?.actrec || job.srvinv?.actrec || job.schlinExtended?.actrec;
				return {
					label: actrec?.jobnme || "",
					value: actrec?.recnum || "",
				};
			}) || [];

		const uniqueJobNameOptions = jobNameOptions.filter(
			(option, index, self) => index === self.findIndex((t) => t.value === option.value)
		);
		return uniqueJobNameOptions;
	}, [scheduleJobs]);

	const selectedJobName = jobNameOptions.find((option) => Number(option.value) === Number(actrec));

	return (
		<div>
			<Popover>
				<PopoverTrigger asChild>
					<div>
						<Button className="my-1 h-10 w-full px-1" variant="outline">
							<div className={`flex items-center text-sm ${selectedJobName ? "text-brand-dark" : "text-gray-400"}`}>
								{selectedJobName ? selectedJobName.label : "Search Job"}
							</div>
							<ChevronDown className="h-5 w-5 p-0 text-gray-400" />
						</Button>
						{formContext.formState.errors.actrec && (
							<p className="text-xs text-destructive text-red-500">{formContext.formState.errors.actrec.message}</p>
						)}
					</div>
				</PopoverTrigger>
				<PopoverContent>
					<Command>
						<CommandInput placeholder="Search job...." />
						<div className="max-h-[250px] overflow-y-auto">
							<CommandEmpty>{tschedule.noResultsFound}</CommandEmpty>
							<CommandGroup>
								<ScrollArea>
									{jobNameOptions.map((option) => (
										<CommandItem
											key={option.value}
											disabled={Number(option.value) === Number(actrec)}
											onSelect={() => {
												formContext.reset({
													bcewSchlinExtendedId: null,
													bcewSchlinIdnum: null,
													bcewSrvinvIdnum: null,
													qcType: null,
													specialJobId: null,
													actrec: Number(option.value),
													stopNumber: stopNumber,
												});
											}}
										>
											{option.label}
											{Number(option.value) === Number(actrec) && <FaCircleCheck />}
										</CommandItem>
									))}
								</ScrollArea>
							</CommandGroup>
						</div>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default SearchJob;
