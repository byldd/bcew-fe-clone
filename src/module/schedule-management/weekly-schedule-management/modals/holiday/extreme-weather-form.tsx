"use client";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/selectField";
import { DatePicker } from "@/components/ui/date-picker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IExtremeWeatherFormProps, ISpecialDayFormValues, specialDay } from "../../types/schedule-configuration";
import { holidayTypes } from "../../utils/enums";
import { DEFAULT_START_TIME, HOLIDAY_OPTIONS, HOLIDAY_REASON_OPTIONS } from "../../constants/week-schedule";
import { useCreateHolidayConfiguration, useUpdateHolidayConfiguration } from "../../hooks/useScheduleConfig";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { InputField } from "@/components/ui/inputField";
import { dateToUTCString, getTodayDate, isPastDate, setTime, toDate, toFormattedDate } from "@/lib/utils/date";
import TimeInput from "@/components/ui/time-input";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const ExtremeWeatherForm: React.FC<IExtremeWeatherFormProps> = ({ onCancel, holidayData }) => {
	const form = useForm<ISpecialDayFormValues>({
		resolver: zodResolver(specialDay),
		defaultValues: {
			type: holidayData?.type || holidayTypes.EXTREME_WEATHER,
			name: holidayData?.name || "",
			displayName: holidayData?.displayName || "",
			date: holidayData?.date ? toDate(holidayData?.date) : getTodayDate(),
			note: holidayData?.note || "",

			// start and end time are UTC string date example: "2025-10-01T09:00:00Z"
			startTime: holidayData?.startTime
				? dateToUTCString(holidayData.startTime)
				: dateToUTCString(setTime(new Date(), DEFAULT_START_TIME)),
			endTime: holidayData?.endTime
				? dateToUTCString(holidayData?.endTime)
				: dateToUTCString(setTime(new Date(), DEFAULT_START_TIME)),
		},
	});

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		watch,
	} = form;
	const { mutate: createHoliday } = useCreateHolidayConfiguration();
	const { mutate: updateHoliday } = useUpdateHolidayConfiguration(holidayData?.id);
	const queryClient = useQueryClient();
	const selectedType = watch("type");
	const selectedName = watch("name");
	const { date } = watch();
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const onSubmit = (data: ISpecialDayFormValues) => {
		const { date, startTime, endTime } = data;

		if (isPastDate(date)) {
			openErrorToast({ message: "Past date modifications are not allowed." });
			return;
		}

		if (!date) return;

		const payload = {
			...data,
			date: dateToUTCString(date),
			//if we change date, we need to adjust date for start and end time, so we make sure that time fields have correct date
			startTime: dateToUTCString(setTime(date, toFormattedDate(startTime, DATE_FORMAT.HH_MM))),
			endTime: dateToUTCString(setTime(date, toFormattedDate(endTime, DATE_FORMAT.HH_MM))),
		};

		if (holidayData?.id) {
			updateHoliday(
				{
					payload,
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["holiday-configuration"] });
						openSuccessToast("Holiday updated successfully.");
						onCancel();
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
		} else {
			createHoliday(
				{
					payload,
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["holiday-configuration"] });
						openSuccessToast("Holiday added successfully.");
						onCancel();
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="mt-4 space-y-4 px-1">
				<Controller
					control={control}
					name="type"
					render={({ field }) => (
						<SelectField
							label={tSchedule.selectTypeOfDay}
							placeholder="Select type"
							value={field.value}
							onValueChange={field.onChange}
							options={HOLIDAY_OPTIONS}
						/>
					)}
				/>
				{errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}

				{selectedType === holidayTypes.SPECIAL_DAY && (
					<div className="mt-3">
						<Controller
							control={control}
							name="displayName"
							render={({ field }) => (
								<InputField
									label={tSchedule.nameOfTheDay}
									placeholder={tSchedule.enterDayName}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						/>
						{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
					</div>
				)}

				<Controller
					control={control}
					name="name"
					render={({ field }) => (
						<SelectField
							label={tSchedule.selectOption}
							placeholder={tSchedule.selectOption}
							value={field.value}
							options={HOLIDAY_REASON_OPTIONS}
							onValueChange={field.onChange}
						/>
					)}
				/>
				{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}

				<div>
					<Label className="text-14-inter-light-grey-400">{tSchedule.noteForEmployees}</Label>
					<Textarea
						autoFocus
						placeholder={tCommon.typeHere}
						className="mt-1 text-xs font-medium"
						{...register("note")}
					/>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div>
						<Label className="text-14-inter-light-grey-400">{tCommon.selectDate}</Label>
						<Controller
							control={control}
							name="date"
							render={({ field }) => (
								<DatePicker
									value={field.value}
									onChange={(date) => {
										field.onChange(date);
									}}
								/>
							)}
						/>
						{errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="mt-1 flex w-full items-center gap-4">
						{selectedName !== holidayTypes.HOLIDAY && (
							<div>
								{selectedName === holidayTypes.LATE_START && (
									<div className="flex min-w-[260px] flex-col">
										<Label className="text-14-inter-light-grey-400">{tCommon.startTime}</Label>
										<Controller
											control={control}
											name="startTime"
											render={({ field }) => <TimeInput value={field.value} onChange={field.onChange} date={date} />}
										/>
									</div>
								)}
								{selectedName === holidayTypes.EARLY_RELEASE && (
									<div className="flex min-w-[260px] flex-col">
										<Label className="text-14-inter-light-grey-400">{tCommon.endTime}</Label>
										<Controller
											control={control}
											name="endTime"
											render={({ field }) => <TimeInput value={field.value} onChange={field.onChange} date={date} />}
										/>
									</div>
								)}
							</div>
						)}
					</div>
					<div className="mt-8 flex items-center gap-2">
						<Button size="icon" variant="filled" className="h-8 w-8 rounded p-1.5" type="submit">
							<Check className="h-4 w-4" />
						</Button>
						<Button size="icon" variant="outline" className="h-8 w-8 rounded p-1" type="button" onClick={onCancel}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
};

export default ExtremeWeatherForm;
