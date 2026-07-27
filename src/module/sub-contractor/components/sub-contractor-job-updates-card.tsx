import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { FiEdit } from "react-icons/fi";
import { OptionYesNo } from "@/utils/enums";
import Image from "next/image";
import { ISubContractorDailyJobDetailsResponse } from "@/module/sub-contractor/types";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { formatDateToMMDDYYYY } from "@/module/schedule-management/time-logs-management/utils";
import { extractUTCDayAndTime } from "@/module/job/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export interface ISubContractorJobUpdatesCardProps {
	jobData: ISubContractorDailyJobDetailsResponse;
	handleEditButtonClick: () => void;
	isEditAllowed?: boolean;
}

export function SubContractorJobUpdatesCard({
	jobData,
	handleEditButtonClick,
	isEditAllowed,
}: ISubContractorJobUpdatesCardProps) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);
	return (
		<div className="my-4 w-full space-y-[10px] rounded-[10px] border border-brand-dark10 bg-white py-3">
			<div className="flex items-center justify-between">
				<h3 className="pl-4 text-base font-medium">{tEmployee.jobUpdates}</h3>
				<Button disabled={!isEditAllowed} onClick={handleEditButtonClick}>
					<FiEdit className="h-[18px] w-[18px] !text-brand-dark" />
				</Button>
			</div>
			<div className="px-4">
				<div className="space-y-3 text-sm">
					<div className="grid gap-1">
						<p className="text-xs font-medium text-brand-dark50">{tEmployee.jobCompletedTodayRequired}</p>
						<p className="font-inter font-medium text-brand-dark">
							{jobData?.isJobFinishToday
								? OptionYesNo.YES
								: jobData?.subContractorJobUpdate?.forecastDate
									? OptionYesNo.NO
									: "--"}
						</p>
					</div>
					{!jobData?.isJobFinishToday && jobData?.subContractorJobUpdate?.forecastDate && (
						<>
							{jobData?.images?.length > 0 && (
								<div className="grid gap-1">
									<p className="text-xs font-medium text-brand-dark50">{tEmployee.imagesAdded}</p>
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
											<Camera className="h-20 w-20 text-gray-400" />
										)}
									</div>
								</div>
							)}
							<div className="grid gap-1">
								<p className="text-xs font-medium text-brand-dark50">{tEmployee.completionDate}</p>
								<p className="font-inter font-medium text-brand-dark">
									{toFormattedDate(jobData?.subContractorJobUpdate?.forecastDate, DATE_FORMAT.MM_SLASH_DD_YYYY)}
								</p>
							</div>
						</>
					)}
					{!jobData?.isJobFinishToday && (
						<div className="grid gap-1">
							<p className="text-xs font-medium text-brand-dark50">{tAdmin.reason}:</p>
							{jobData?.jobUpdateReasons &&
								jobData.jobUpdateReasons?.map((jobUpdate, index) => (
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
					)}
				</div>
			</div>
		</div>
	);
}
