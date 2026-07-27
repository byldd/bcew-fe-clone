"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { IScheduleConfigurationProps, IUser } from "../../types/schedule-interface";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SelectField } from "@/components/ui/selectField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IUpdateScheduleConfigFormSchema, updateScheduleConfigFormSchema } from "../../utils/schedule-config-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { E_WEEKEND_WORKING_MODE } from "../../types/schedule-configuration";
import {
	useGetSpecialJobs,
	useScheduleConfiguration,
	useUpdateScheduleConfiguration,
} from "../../hooks/useScheduleConfig";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { scheduleFrequency, scheduleTime } from "../../constants/week-schedule";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUsers } from "@/module/employee/hooks/useEmployee";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import SpecialJobsField from "./special-jobs-field";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export default function ScheduleConfigurationModal({ onClose }: IScheduleConfigurationProps) {
	const [frequency, setFrequency] = useState("Daily");
	const [time, setTime] = useState("3:15 PM");
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const { data: scheduleConfiguration, isLoading: isLoadingScheduleConfiguration } = useScheduleConfiguration();
	const { mutate: updateScheduleConfiguration, isPending } = useUpdateScheduleConfiguration();
	const { data: specialJobs, isLoading: isLoadingSpecialJobs } = useGetSpecialJobs();

	const { data: users } = useGetUsers({
		page: 1,
		pageSize: 1000,
	});

	const queryClient = useQueryClient();

	const form = useForm<IUpdateScheduleConfigFormSchema>({
		resolver: zodResolver(updateScheduleConfigFormSchema),
	});

	useEffect(() => {
		if (scheduleConfiguration) {
			form.reset({
				isSaturdayWorking: scheduleConfiguration.isSaturdayWorking,
				isSundayWorking: scheduleConfiguration.isSundayWorking,
				saturdayWorkingMode: scheduleConfiguration.saturdayWorkingMode,
				sundayWorkingMode: scheduleConfiguration.sundayWorkingMode,
				saturdayWorkingUsersIds: users?.items?.filter((user) => user.isSaturdayWorking).map((user) => user.id) ?? [],
				sundayWorkingUsersIds: users?.items?.filter((user) => user.isSundayWorking).map((user) => user.id) ?? [],
				specialJobs:
					specialJobs?.map((specialJob) => ({
						id: specialJob.id,
						name: specialJob.name,
						isVisible: specialJob.isVisible,
						isDeleted: specialJob.isDeleted,
						teamIds: specialJob?.teams?.map((team) => team.teamId) || [],
						sequence: specialJob.sequence,
						zones:
							specialJob?.specialJobZones?.map((zone) => {
								return {
									geoTabId: zone?.zoneGeoTabId,
									name: zone?.zone?.name,
									address: zone?.zone?.address || "",
									isCurrent: zone?.isCurrent,
								};
							}) || [],
					})) ?? [],
			});
		}
	}, [scheduleConfiguration, form, users, specialJobs]);

	const {
		isSaturdayWorking,
		isSundayWorking,
		saturdayWorkingMode,
		sundayWorkingMode,
		saturdayWorkingUsersIds,
		sundayWorkingUsersIds,
		sameAsSaturday,
	} = form.watch();

	const handleSave = (data: IUpdateScheduleConfigFormSchema) => {
		if (!scheduleConfiguration) return;
		updateScheduleConfiguration(
			{
				id: scheduleConfiguration?.id,
				payload: {
					isSaturdayWorking: data.isSaturdayWorking,
					isSundayWorking: data.isSundayWorking,
					saturdayWorkingMode: data.saturdayWorkingMode,
					saturdayWorkingUsersIds: data.saturdayWorkingUsersIds,
					sundayWorkingMode: data?.sameAsSaturday ? data.saturdayWorkingMode : data.sundayWorkingMode,
					sundayWorkingUsersIds: data?.sameAsSaturday ? data?.saturdayWorkingUsersIds : data.sundayWorkingUsersIds,
					specialJobs: data.specialJobs?.map((specialJob, index) => ({
						...specialJob,
						sequence: specialJob.sequence || index + 1,
						teamIds: specialJob.teamIds || [],
						zones: specialJob.zones || [],
					})),
				},
			},
			{
				onSuccess: () => {
					openSuccessToast(tschedule.scheduleConfigurationUpdatedSuccessfully);
					onClose();
					queryClient.invalidateQueries({ queryKey: ["schedule-configuration"] });
					queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	if (isLoadingScheduleConfiguration || isLoadingSpecialJobs) return <Spinner />;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 p-1 pr-4">
				{/* Auto Scheduling Section */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<SelectField
							disabled={true}
							label={tschedule.autoSchedulingFrequency}
							value={frequency}
							onValueChange={setFrequency}
							options={scheduleFrequency.map((option) => ({ label: option, value: option }))}
						/>
					</div>

					<div className="space-y-1">
						<div className="relative">
							<SelectField
								disabled={true}
								label={tschedule.autoSchedulingTime}
								value={time}
								onValueChange={setTime}
								options={scheduleTime.map((option) => ({ label: option, value: option }))}
							/>
						</div>
					</div>
				</div>

				{/* Weekend Working Days */}
				<div className="space-y-2">
					<div className="space-y-1">
						<Label className="text-base font-medium text-brand-grey">{tschedule.selectWeekendWorkingDay}</Label>
						<p className="text-sm text-brand-dark50">{tschedule.autoScheduleNote}</p>
					</div>

					<div className="space-y-2">
						<FormField
							control={form.control}
							name="isSaturdayWorking"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between">
									<Label className="mb-0 text-base font-medium text-brand-dark">{tschedule.saturday}</Label>
									<FormControl>
										<Switch className="!m-0" checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{isSaturdayWorking && (
					<div className="space-y-2">
						<FormField
							control={form.control}
							name="saturdayWorkingMode"
							render={({ field }) => (
								<FormItem className="z-10 flex flex-col space-y-1">
									<Label className="mb-1 text-sm font-normal text-brand-grey">{tschedule.selectWorkingMode}</Label>
									<FormControl>
										<WorkingModeSelect value={field.value} onChange={field.onChange} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="py-2">
							{saturdayWorkingMode === E_WEEKEND_WORKING_MODE.VOLUNTARY && (
								<SelectEmployee
									users={users?.items ?? []}
									disabled={!isSaturdayWorking}
									label={tschedule.selectSaturdayVoluntaryEmployees}
									onChange={(value) => form.setValue("saturdayWorkingUsersIds", value)}
									value={saturdayWorkingUsersIds}
									error={form.formState.errors.saturdayWorkingUsersIds?.message}
								/>
							)}
						</div>
					</div>
				)}

				<>
					<div className="space-y-2">
						<FormField
							control={form.control}
							name="isSundayWorking"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between">
									<Label className="mb-0 text-base font-medium text-brand-dark">{tschedule.sunday}</Label>
									<FormControl>
										<Switch className="!m-0" checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div>
						{isSaturdayWorking && isSundayWorking && (
							<FormField
								control={form.control}
								name="sameAsSaturday"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormControl>
											<Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-2" />
										</FormControl>
										<Label className="mb-0 text-base font-medium text-brand-dark50">{tschedule.sameAsSaturday}</Label>

										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</div>

					{isSundayWorking && !sameAsSaturday && (
						<div>
							<FormField
								control={form.control}
								name="sundayWorkingMode"
								render={({ field }) => (
									<FormItem className="z-10 flex flex-col space-y-1">
										<Label className="mb-1 text-sm font-normal text-brand-grey">{tschedule.selectWorkingMode}</Label>
										<FormControl>
											<WorkingModeSelect value={field.value} onChange={field.onChange} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="py-4">
								{sundayWorkingMode === E_WEEKEND_WORKING_MODE.VOLUNTARY && (
									<SelectEmployee
										users={users?.items ?? []}
										disabled={!isSundayWorking}
										label={tschedule.selectSundayVoluntaryEmployees}
										onChange={(value) => form.setValue("sundayWorkingUsersIds", value)}
										value={sundayWorkingUsersIds}
										error={form.formState.errors.sundayWorkingUsersIds?.message}
									/>
								)}
							</div>
						</div>
					)}
				</>

				<SpecialJobsField />

				{/* Save Button */}
				<Button type="submit" disabled={isPending} variant={"filled"} className="w-full">
					{tschedule.saveConfiguration}
				</Button>
			</form>
		</Form>
	);
}

const SelectEmployee = ({
	users,
	disabled,
	label,
	onChange,
	value = [],
	error,
}: {
	users: IUser[];
	disabled: boolean;
	label: string;
	onChange: (value: string[]) => void;
	value: string[];
	error?: string;
}) => {
	const [crewSelectOpen, setCrewSelectOpen] = useState(false);
	const handleEmployeeToggle = (id: string) => {
		if (value?.includes(id)) {
			onChange(value?.filter((userId) => userId !== id));
		} else {
			onChange([...value, id]);
		}
	};

	const removeEmployee = (id: string) => {
		onChange(value?.filter((userId) => userId !== id));
	};
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	return (
		<div className="space-y-1">
			<Label className="text-sm font-normal text-brand-grey">{label}</Label>

			<Popover open={crewSelectOpen} onOpenChange={setCrewSelectOpen}>
				<PopoverTrigger asChild>
					<Button
						disabled={users?.length === 0 || disabled}
						variant="outline"
						role="combobox"
						aria-expanded={crewSelectOpen}
						className="h-10 w-full justify-between rounded-[10px] border-none bg-brand-bgLightgrey text-sm"
					>
						<span className="text-sm font-normal text-gray-500">{tschedule.searchByEmployeeName}</span>
						<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0" align="start">
					<Command>
						<CommandInput placeholder="Search crew members" />
						<CommandList className="max-h-none overflow-hidden">
							<CommandEmpty>{tschedule.noCrewMemberFound}</CommandEmpty>
							<CommandGroup>
								<ScrollArea className="h-[300px] cursor-pointer">
									{/* all */}
									<CommandItem
										onSelect={() =>
											value?.length === users?.length ? onChange([]) : onChange(users?.map((user) => user.id))
										}
										className="flex items-center space-x-2"
									>
										<Checkbox checked={value?.length === users?.length} />
										<span>{tschedule.all}</span>
										{value?.length === users?.length && <Check className="ml-auto h-4 w-4" />}
									</CommandItem>

									{users?.map((user) => (
										<CommandItem
											key={user.id}
											onSelect={() => handleEmployeeToggle(user.id)}
											className="flex items-center space-x-2"
										>
											<Checkbox checked={value?.includes(user.id)} />
											<span>{user.name}</span>
											{value?.includes(user.id) && <Check className="ml-auto h-4 w-4" />}
										</CommandItem>
									))}
								</ScrollArea>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{error && value?.length == 0 && <p className="text-sm text-red-500">{error}</p>}

			{/* Selected Crew Tags */}
			{value?.length > 0 && (
				<div className="mt-3 flex max-h-[100px] flex-wrap gap-2 overflow-y-auto pt-1">
					{value?.map((userId, index) => {
						const userData = users?.find((c) => c.id === userId);
						return (
							<Badge key={index}>
								{userData?.name}
								<X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeEmployee(userId)} />
							</Badge>
						);
					})}
				</div>
			)}
		</div>
	);
};

export const WorkingModeSelect = ({
	value,
	onChange,
}: {
	value: E_WEEKEND_WORKING_MODE;
	onChange: (value: E_WEEKEND_WORKING_MODE) => void;
}) => {
	return (
		<RadioGroup value={value} onValueChange={onChange} className="flex flex-row space-x-24">
			<div className="flex items-center space-x-6">
				<div className="flex items-center space-x-2">
					<RadioGroupItem value={E_WEEKEND_WORKING_MODE.VOLUNTARY} id="voluntary" />
					<Label htmlFor="voluntary" className="mb-0 text-sm font-medium text-gray-900">
						{E_WEEKEND_WORKING_MODE.VOLUNTARY}
					</Label>
				</div>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value={E_WEEKEND_WORKING_MODE.MANDATORY} id="mandatory" />
					<Label htmlFor="mandatory" className="mb-0 text-sm font-medium text-gray-900">
						{E_WEEKEND_WORKING_MODE.MANDATORY}
					</Label>
				</div>
			</div>
		</RadioGroup>
	);
};
