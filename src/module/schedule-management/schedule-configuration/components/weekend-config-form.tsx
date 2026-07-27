import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { E_WEEKEND_WORKING_MODE } from "../../weekly-schedule-management/types/schedule-configuration";
import { getActiveWeekendDates, IWeekendConfigFormSchema, weekendConfigFormSchema } from "../utils/weekend-config-form";
import { E_SCHEDULE_CONFIG_WEEKEND_DAY } from "../types/schedule-config";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import RadioGroupField from "@/components/ui/radio-group-field";
import { useGetUsers } from "@/module/employee/hooks/useEmployee";
import { SelectEmployee } from "./select-employee";
import { Button } from "@/components/ui/button";
import { useUpdateWeekendWorks } from "../hooks/useScheduleConfig";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useScheduleCrews, useScheduleTeams } from "../../weekly-schedule-management/hooks/useSchedule";
import { InputField } from "@/components/ui/inputField";
import { getTodayDate, isSameDate, toFormattedDate, toMidnightDateString } from "@/lib/utils/date";
import { TextareaField } from "@/components/ui/textareaField";
import { DatePicker } from "@/components/ui/date-picker";

const WeekendConfigForm = () => {
	const queryClient = useQueryClient();
	const { saturday, sunday } = getActiveWeekendDates(getTodayDate());

	const [includePastDates, setIncludePastDates] = useState(false);

	const { data: users } = useGetUsers({
		page: 1,
		pageSize: 1000,
	});
	const { data: crews } = useScheduleCrews({});
	const { data: teams } = useScheduleTeams();

	const { mutate: updateWeekendWorks, isPending } = useUpdateWeekendWorks();

	const form = useForm<IWeekendConfigFormSchema>({
		resolver: zodResolver(weekendConfigFormSchema),
		defaultValues: {},
	});

	const { mode, teamIds, crewIds, phaseIds } = form.watch();

	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const workingDayOption = Object.keys(E_SCHEDULE_CONFIG_WEEKEND_DAY)?.map((key) => {
		const value = E_SCHEDULE_CONFIG_WEEKEND_DAY[key as keyof typeof E_SCHEDULE_CONFIG_WEEKEND_DAY];
		return {
			value,
			label: formatSnakeCase(key),
			date: value === E_SCHEDULE_CONFIG_WEEKEND_DAY.SATURDAY ? saturday : sunday,
		};
	});

	const workingModeOption = Object.keys(E_WEEKEND_WORKING_MODE)?.map((key) => {
		return {
			value: E_WEEKEND_WORKING_MODE[key as keyof typeof E_WEEKEND_WORKING_MODE],
			label: formatSnakeCase(key),
		};
	});

	const onSubmit = (data: IWeekendConfigFormSchema) => {
		updateWeekendWorks(
			{
				mode: data.mode!,
				userIds: data.userIds || [],
				crewIds: data.crewIds || [],
				teamIds: data.teamIds || [],
				note: data.note,
				requiredMemberCount: data.requiredMemberCount || undefined,
				date: toMidnightDateString(data.date!),
			},
			{
				onSuccess: () => {
					form.reset();
					openSuccessToast("Weekend working day updated successfully");
					queryClient.invalidateQueries({ queryKey: ["weekend-works"] });
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="space-y-4">
			<p className="text-lg font-semibold text-brand-dark">{tschedule.weekendWorkingDay}</p>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="date"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-base font-medium text-brand-dark50">{tschedule.selectWorkingDay}</FormLabel>
								<FormControl>
									<div className="flex flex-wrap items-center gap-4 sm:gap-6">
										{workingDayOption?.map((option) => {
											return (
												<div key={option.value} className="flex items-center gap-2">
													<Checkbox
														checked={field.value ? isSameDate(field.value, option.date) : false}
														onCheckedChange={(checked) => {
															if (checked) {
																field.onChange(toMidnightDateString(option.date));
																setIncludePastDates(false);
															}
														}}
													>
														{option.label}
													</Checkbox>
													<p>
														{option.label} <span className="text-brand-dark60">({toFormattedDate(option.date)})</span>
													</p>
												</div>
											);
										})}

										<div className="flex items-center gap-2">
											<Checkbox
												checked={includePastDates}
												onCheckedChange={(checked) => {
													if (checked) {
														field.onChange(undefined);
														setIncludePastDates(true);
													}
												}}
											>
												Past Date
											</Checkbox>
											<p>Past Date</p>
										</div>
									</div>
								</FormControl>
								{!includePastDates && <FormMessage />}
							</FormItem>
						)}
					/>

					{includePastDates && (
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="my-2 text-base font-medium text-brand-dark50">Select Past Date</FormLabel>
									<FormControl>
										<div className="gap-4 sm:gap-6">
											<DatePicker
												value={field.value}
												onChange={(value) => {
													if (value) {
														field.onChange(toMidnightDateString(value));
													}
												}}
												disabledDate={{
													after: getTodayDate(),
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					<FormField
						control={form.control}
						name="mode"
						render={({ field }) => (
							<FormItem className="mt-4">
								<FormLabel className="text-base font-medium text-brand-dark50">{tschedule.selectWorkingMode}</FormLabel>
								<FormControl>
									<RadioGroupField
										onChange={(value) => {
											field.onChange(value);
										}}
										value={field.value}
										options={workingModeOption}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{mode === E_WEEKEND_WORKING_MODE.VOLUNTARY && (
						<>
							<FormField
								control={form.control}
								name="requiredMemberCount"
								render={({ field }) => (
									<FormItem className="mt-4">
										<FormLabel className="text-base font-medium text-brand-dark50">
											Total Number of Members Required
										</FormLabel>
										<FormControl>
											<InputField
												placeholder="Type number here"
												type="number"
												value={String(field.value)}
												onChange={(e) => {
													const value = e.target.value;
													field.onChange(Number(value));
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</>
					)}
					{mode !== E_WEEKEND_WORKING_MODE.NOT_WORKING && (
						<FormField
							control={form.control}
							name="userIds"
							render={({ field }) => (
								<FormItem className="mt-4">
									<FormLabel className="text-base font-medium text-brand-dark50">
										{tschedule.selectMembersCrewsTeams}
									</FormLabel>
									<FormControl>
										<SelectEmployee
											crews={crews?.items ?? []}
											teams={teams ?? []}
											users={users?.items ?? []}
											onChange={(value) => form.setValue("userIds", value)}
											onChangeTeam={(value) => form.setValue("teamIds", value)}
											onChangeCrew={(value) => form.setValue("crewIds", value)}
											userValue={field.value || []}
											teamValue={teamIds || []}
											crewValue={crewIds || []}
											selectedPhase={phaseIds || []}
											onChangePhase={(value) => form.setValue("phaseIds", value)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					<FormField
						control={form.control}
						name="note"
						render={({ field }) => (
							<FormItem className="my-4">
								<FormLabel className="text-base font-medium text-brand-dark50">Add Note</FormLabel>
								<FormControl>
									<TextareaField {...field} placeholder="Type here" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="sticky bottom-0 bg-white pt-8">
						<div className="flex w-full justify-between gap-2">
							<Button
								disabled={isPending}
								onClick={() => form.reset()}
								className="w-full"
								variant="outline"
								type="button"
							>
								{tCommon.clearAll}
							</Button>
							<Button className="w-full" type="submit" variant={"filled"} disabled={isPending}>
								Save & Notify
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default WeekendConfigForm;
