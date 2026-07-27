import { Button } from "@/components/ui/button";
import { useEmployeeSelfSchedule } from "@/module/self-scheduling/hooks/useSelfSchedule";
import { useSelfScheduleToast } from "@/module/self-scheduling/hooks/useSelfScheduleToast";
import {
	IweekendSelfScheduleSchema,
	weekendSelfScheduleSchema,
} from "@/module/self-scheduling/utils/weekend-self-schedule-schema";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MIDDAY_STOP_TYPE } from "@/module/midday-stops/utils/enums";
import { Form } from "@/components/ui/form";
import { openErrorToast } from "@/components/toast";
import { IForemanCreateJobPayload } from "../../types";
import SelectWeekendJob from "@/module/self-scheduling/components/select-weekend-job";
import { Trash } from "lucide-react";
import { FaRegSquarePlus } from "react-icons/fa6";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useQueryClient } from "@tanstack/react-query";
import { isWeekend } from "date-fns";
import { getTodayDate } from "@/lib/utils/date";

const SelfScheduleJobForm = ({
	date,
	setSelfScheduleOpen,
}: {
	date?: string;
	setSelfScheduleOpen: (open: boolean) => void;
}) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const queryClient = useQueryClient();

	const isWeekendToday = isWeekend(getTodayDate());

	const schema = weekendSelfScheduleSchema();
	const { handleToast } = useSelfScheduleToast();
	const { mutateAsync: createJobMutation, isPending } = useEmployeeSelfSchedule();

	const form = useForm<IweekendSelfScheduleSchema>({
		resolver: zodResolver(schema),
		defaultValues: {
			jobs: [
				{
					jobType: MIDDAY_STOP_TYPE.PROJECT,
					date: date,
				},
			],
		},
		mode: "onChange",
	});

	const { jobs } = form.watch();

	const onSubmit = (data: IweekendSelfScheduleSchema) => {
		const payload: IForemanCreateJobPayload[] = data.jobs?.map((job) => {
			return {
				projectName: job.project,
				date: job.date!,
				bcewSchlinExtendedId: job.bcewSchlinExtendedId || undefined,
				bcewSchlinIdnum: job.bcewSchlinIdnum || undefined,
				bcewSrvinvIdnum: job.bcewSrvinvIdnum || undefined,
				qcType: job.qcType || undefined,
				startTime: job.startTime || undefined,
				endTime: job.endTime || undefined,
				note: job.note || undefined,
				specialJobId: job.specialJobId || undefined,
			};
		});

		createJobMutation(payload, {
			onSuccess: (responseData) => {
				form.reset();
				handleToast(responseData);
				setSelfScheduleOpen(false);
				void queryClient.invalidateQueries({ queryKey: ["employee-schedule"] });
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	const onAddNewJob = () => {
		form.setValue("jobs", [
			...jobs,
			{
				jobType: MIDDAY_STOP_TYPE.PROJECT,
				date: date,
			},
		]);
	};

	const onRemoveJob = (index: number) => {
		const newJobs = [...jobs];
		newJobs.splice(index, 1);
		form.setValue("jobs", newJobs);
	};

	return (
		<div className="px-6">
			<div className="space-y-1 pb-4">
				<p className="text-base font-semibold text-brand-dark">
					{isWeekendToday ? tEmployee.selfScheduling : "Weekday Self Scheduling"}
				</p>
				<p className="text-xs font-normal text-brand-dark">
					{isWeekendToday ? tEmployee.scheduleYourselfWeekend : "Schedule Yourself"}
				</p>
			</div>

			<div className="rounded-xl bg-white p-3">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div>
							<div className="space-y-4">
								{jobs?.map((job, index) => {
									return (
										<div key={index} className="relative">
											{index > 0 && (
												<div className="absolute right-2 top-0 mt-1.5">
													<Trash className="text-brand-red" size={16} onClick={() => onRemoveJob(index)} />
												</div>
											)}

											{job.date && <SelectWeekendJob index={index} date={job.date} />}

											<div className="my-3"></div>
										</div>
									);
								})}
							</div>

							<Button
								type="button"
								key={"add-job-button"}
								className="my-4 rounded-[8px]"
								variant={"filled"}
								size={"sm"}
								onClick={onAddNewJob}
							>
								<FaRegSquarePlus size={20} />
								{tEmployee.addNewJob}
							</Button>
						</div>

						<div className="bg-white">
							<div className="fixed bottom-0 left-0 right-0 z-30 flex gap-2 bg-white px-2 py-2">
								<Button
									type="button"
									disabled={isPending}
									className="w-full"
									variant={"outline"}
									onClick={() => {
										form.reset();
										setSelfScheduleOpen(false);
									}}
								>
									{tEmployee.cancel}
								</Button>
								<Button type="submit" disabled={isPending} loading={isPending} className="w-full" variant={"filled"}>
									{tEmployee.saveSchedule}
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
};

export default SelfScheduleJobForm;
