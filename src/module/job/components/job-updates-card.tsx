import { Camera } from "lucide-react";
import { OptionYesNo } from "@/utils/enums";
import { IJobUpdatesCardProps } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import Image from "next/image";
import { extractUTCDayAndTime, isBoolean } from "../utils";
import { formatDateToMMDDYYYY } from "@/module/schedule-management/time-logs-management/utils";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export function JobUpdatesCard({ jobData }: IJobUpdatesCardProps) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);
	const jobUpdateReasons = jobData?.jobUpdateReasons || [];
	return (
		<div className="w-full space-y-[10px]">
			<div className="space-y-3 text-sm">
				<div className="grid gap-1">
					<p className="text-xs font-medium text-brand-dark50">{tEmployee.jobCompletedTodayRequired}</p>
					<p className="font-inter font-medium text-brand-dark">
						{!isBoolean(jobData?.isJobFinishToday)
							? "--"
							: jobData?.isJobFinishToday
								? OptionYesNo.YES
								: OptionYesNo.NO}
					</p>
				</div>
				{!jobData?.isJobFinishToday && (
					<>
						<div className="grid gap-1">
							<p className="text-xs font-medium text-brand-dark50">{tEmployee.forecastCompletionTomorrowRequired}</p>
							<p className="font-inter font-medium text-brand-dark">
								{!isBoolean(jobData?.isJobFinishTomorrow)
									? "--"
									: jobData?.isJobFinishTomorrow
										? OptionYesNo.YES
										: OptionYesNo.NO}
							</p>
						</div>
						{jobData?.forecastDate && jobData?.isJobFinishTomorrow === false && (
							<div className="grid gap-1">
								<p className="text-xs font-medium text-brand-dark50">{tEmployee.forecastDate}</p>
								<p className="font-inter font-medium text-brand-dark">
									{toFormattedDate(jobData?.forecastDate, DATE_FORMAT.MM_DD_YYYY)}
								</p>
							</div>
						)}

						<div className="grid gap-1">
							<p className="text-xs font-medium text-brand-dark50">{tEmployee.timeNeededToCompleteJobRequired}</p>
							<p className="font-inter font-medium text-brand-dark">
								{jobData?.forecastTime === 0 ? "--" : jobData?.forecastTime}
							</p>
						</div>
						<div className="grid gap-1">
							<p className="text-xs font-medium text-brand-dark50">{tAdmin.reason}:</p>
							{jobUpdateReasons &&
								jobUpdateReasons.map((jobUpdate, index) => (
									<div key={index} className="space-y-1">
										<div className="flex justify-between text-xs font-medium text-brand-dark50">
											<span>{formatDateToMMDDYYYY(jobUpdate.createdAt)}</span>
											<span>{extractUTCDayAndTime(jobUpdate.createdAt)}</span>
										</div>
										<div className="flex justify-between text-xs font-medium text-brand-dark50">
											<p className="break-words text-sm font-medium text-brand-dark">{jobUpdate.reason}</p>
											<span>{jobUpdate.user?.name}</span>
										</div>
									</div>
								))}
						</div>
					</>
				)}

				{
					<div className="grid gap-1">
						<p className="text-xs font-medium text-brand-dark50">{tEmployee.imagesAdded}:</p>
						<div className="flex flex-wrap items-center gap-2">
							{jobData?.images?.length ? (
								jobData?.images?.map((image, i) => (
									<Image
										key={i}
										width={40}
										height={40}
										src={image.url}
										alt={`Job image ${i}`}
										className="h-12 w-12 rounded-lg object-cover"
									/>
								))
							) : (
								<Camera className="h-10 w-10 text-gray-400" />
							)}
						</div>
					</div>
				}
			</div>
		</div>
	);
}
