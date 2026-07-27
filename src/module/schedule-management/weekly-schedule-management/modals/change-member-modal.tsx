import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import React, { useMemo } from "react";
import { IChangeMemberModalProps } from "../types/schedule-interface";
import { SelectField } from "@/components/ui/selectField";
import { useReplaceDailyJobEmployee } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useScheduleContext } from "../context/schedule-context";
import { changeMemberFormSchema, IChangeMemberFormSchema } from "../utils/member-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import StopNumberInput from "@/components/ui/stop-number-input";
import { useHandleJobOperation } from "../hooks/useHandleJobOperation";
import { getJobEmployeeOptions } from "../utils/filter-data";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const ChangeMemberModal = ({ employee, onClose, specialJob, dailyJob }: IChangeMemberModalProps) => {
	const { mutate: replaceEmployee, isPending } = useReplaceDailyJobEmployee();
	const form = useForm<IChangeMemberFormSchema>({
		resolver: zodResolver(changeMemberFormSchema),
	});

	const queryClient = useQueryClient();
	const { employees, weekendWorks } = useScheduleContext();
	const { onUpdateDailyJob } = useHandleJobOperation();
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const employeeOptions = useMemo(() => {
		const options = getJobEmployeeOptions({
			employees,
			specialJob,
			weekendWorks,
			date: dailyJob.date,
			jobPhase: dailyJob.schlin?.tsknum || dailyJob.qcJob?.schlin?.tsknum,
			workOrder: dailyJob.srvinv.ordnum,
		});

		return (
			options?.map((option) => ({
				value: option.employeeId,
				label: option.employeeName,
				disabled:
					option.disabled ||
					dailyJob?.jobEmployeeAssignments?.some((assignment) => assignment.employeeId === option.employeeId),
			})) || []
		);
	}, [employees, dailyJob, specialJob, weekendWorks]);

	const handleSave = (data: IChangeMemberFormSchema) => {
		replaceEmployee(
			{
				assignmentId: employee.id!,
				newEmployee: {
					id: data.employeeId,
					stopNumber: data.stopNumber,
				},
			},
			{
				onSuccess: (data) => {
					openSuccessToast(tjobCards.employeeReplacedSuccessfully);
					queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
					onClose();
					onUpdateDailyJob({
						updatedJob: data,
						dailyJobId: dailyJob.id,
					});
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="p-1">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSave)}>
					<div className="flex flex-col justify-between gap-2">
						<div className="flex-1">
							<InputField label={tschedule.currentCrewMemberName} value={employee?.employee?.user?.name} disabled />
						</div>

						<FormField
							control={form.control}
							name="employeeId"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormControl>
										<SelectField
											label={tschedule.newCrewMember}
											value={field.value || ""}
											options={employeeOptions}
											placeholder={tschedule.selectNewCrewMember}
											onValueChange={(value) => field.onChange(value)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="stopNumber"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormControl>
										<StopNumberInput
											value={field.value ?? undefined}
											onChange={(stopNumber) => field.onChange(stopNumber)}
											placeholder={tschedule.enterStopNumber}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button
						type="submit"
						key="change-member-button"
						className="mt-4 w-full"
						variant={"filled"}
						disabled={isPending}
					>
						{tCommon.save}
					</Button>
				</form>
			</Form>
		</div>
	);
};

export default ChangeMemberModal;
