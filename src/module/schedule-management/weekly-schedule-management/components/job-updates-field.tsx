import React from "react";
import { useFormContext } from "react-hook-form";
import { addDays } from "date-fns";

import { IUpdateDailyJobFormSchema } from "../utils/create-daily-job-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import RadioGroupField from "@/components/ui/radio-group-field";
import { DatePicker } from "@/components/ui/date-picker";
import ImageUpload from "@/components/shared/image-upload/image-upload";

import { OptionYesNo } from "@/utils/enums";
import { getTodayDate, toFormattedDate } from "@/lib/utils/date";
import { isBoolean } from "@/module/job/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

import { IForecastCrew, IJobUpdateReasons } from "../types/schedule-interface";
import { DATE_FORMAT } from "@/types/date";

const JobUpdatesField = ({
	isSubcontractorJob,
	readOnly = false,
	jobUpdateReasons,
	forecastCrew,
}: {
	isSubcontractorJob: boolean;
	readOnly?: boolean;
	jobUpdateReasons?: IJobUpdateReasons[];
	forecastCrew?: IForecastCrew[];
}) => {
	const formContext = useFormContext<IUpdateDailyJobFormSchema>();
	const { isJobFinishTomorrow, isJobFinishToday, forecastDate } = formContext.watch();
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	return (
		<div className="space-y-4 pt-2">
			<div className="space-y-2">
				<p className="text-base font-medium text-brand-dark">{tjobCards.title}</p>
				<div className="flex justify-between gap-4">
					<FormField
						control={formContext.control}
						name="isJobFinishToday"
						render={({ field }) => (
							<FormItem className="w-full flex-1">
								<Label className="text-sm font-medium text-brand-dark60"> {tjobCards.completedToday}</Label>
								<FormControl>
									<RadioGroupField
										options={Object.values(OptionYesNo).map((option) => ({
											label: option,
											value: option,
										}))}
										value={!isBoolean(field.value) ? undefined : field.value ? OptionYesNo.YES : OptionYesNo.NO}
										onChange={(value) => field.onChange(value === OptionYesNo.YES)}
										disabled={readOnly}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					{!isJobFinishToday && !isSubcontractorJob && (
						<FormField
							control={formContext.control}
							name="isJobFinishTomorrow"
							render={({ field }) => (
								<FormItem className="w-full flex-1 space-y-2">
									<Label className="text-sm font-medium text-brand-dark60"> {tjobCards.forecastTomorrow}</Label>
									<FormControl>
										<RadioGroupField
											options={Object.values(OptionYesNo).map((option) => ({
												label: option,
												value: option,
											}))}
											value={!isBoolean(field.value) ? undefined : field.value ? OptionYesNo.YES : OptionYesNo.NO}
											onChange={(value) => field.onChange(value === OptionYesNo.YES)}
											disabled={readOnly}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					{isSubcontractorJob && !isJobFinishToday && (
						<FormField
							control={formContext.control}
							name="subContractorJobUpdate.forecastDate"
							render={({ field }) => (
								<FormItem className="w-full flex-1">
									<Label className="text-sm font-medium text-brand-dark60">{tjobCards.expectedCompletionDate}</Label>
									<FormControl>
										<DatePicker
											value={field.value || undefined}
											onChange={field.onChange}
											placeholder={tjobCards.selectDate}
											className="w-full"
											disabled={readOnly}
											disabledDate={{ before: addDays(getTodayDate(), 1) }}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
				</div>
			</div>

			{!isJobFinishToday && isJobFinishTomorrow === false && forecastDate && (
				<div className="space-y-1">
					<p className="text-sm font-medium text-brand-dark60">{tjobCards.forecastDate}</p>
					<p className="text-dark text-sm font-medium">{toFormattedDate(forecastDate, DATE_FORMAT.MM_DD_YYYY)}</p>
				</div>
			)}

			{
				<>
					{forecastCrew?.length ? (
						<div className="space-y-1">
							<p className="text-sm font-medium text-brand-dark60">{tjobCards.forecastCrew}</p>
							{forecastCrew.map((crew) => (
								<div key={crew.id} className="flex items-center justify-between">
									<p className="text-sm font-medium text-brand-dark">{crew?.employee?.user?.name} </p>
									<p className="text-sm text-brand-dark60">{crew.forecastHours} hrs</p>
								</div>
							))}
						</div>
					) : null}

					{jobUpdateReasons?.length ? (
						<div className="space-y-1">
							<p className="text-sm font-medium text-brand-dark60">{tjobCards.jobUpdateReasons}</p>

							<div className="space-y-2">
								{jobUpdateReasons.map((reason) => (
									<div key={reason.id} className="flex items-start space-x-2">
										<p className="text-sm font-medium text-brand-dark">{reason.reason}</p>
									</div>
								))}
							</div>
						</div>
					) : null}

					<FormField
						control={formContext.control}
						name="images"
						render={({ field }) => (
							<FormItem className="w-full flex-1">
								<FormControl>
									<ImageUpload
										label={tjobCards.images}
										value={field.value || []}
										onChange={field.onChange}
										disabled={readOnly}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</>
			}
		</div>
	);
};

export default JobUpdatesField;
