import { Button } from "@/components/ui/button";
import { SCHEDULE_DOWNLOAD_MODAL_TYPE } from "./enum";
import { useDownloadSchedule } from "../hooks/useSchedule";
import { getTodayDate, toFormattedDate, toMidnightDateString } from "@/lib/utils/date";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { getPayrollWeekRange } from "../utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useScheduleContext } from "../context/schedule-context";

interface DownloadConfirmModalProps {
	type: SCHEDULE_DOWNLOAD_MODAL_TYPE;
	onClose: () => void;
}

const DownloadConfirmModal = ({ type, onClose }: DownloadConfirmModalProps) => {
	const { mutate: downloadSchedule, isPending: isDownloadingSchedule } = useDownloadSchedule();
	const { dataOfWeek } = useScheduleContext();
	const calendarStartDate = dataOfWeek.at(0)?.date;
	const calendarEndDate = dataOfWeek.at(-1)?.date;

	const { weekStart, weekEnd } = getPayrollWeekRange(getTodayDate());
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const startDate = type == SCHEDULE_DOWNLOAD_MODAL_TYPE.SCHEDULE ? calendarStartDate : weekStart;
	const endDate = type == SCHEDULE_DOWNLOAD_MODAL_TYPE.SCHEDULE ? calendarEndDate : weekEnd;

	const handleDownloadSchedule = () => {
		if (!startDate || !endDate) return;
		downloadSchedule(
			{
				startDate: toMidnightDateString(startDate),
				endDate: toMidnightDateString(endDate),
				pdfType: type,
			},
			{
				onSuccess: (response) => {
					const pdfData = response.data;

					const blob = new Blob([pdfData], { type: "application/pdf" });
					const url = window.URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;

					const contentDisposition = response.headers?.["content-disposition"] as string | undefined;
					let fileName = `${type == SCHEDULE_DOWNLOAD_MODAL_TYPE.SCHEDULE ? "weekly" : "payroll"}-schedule-${toFormattedDate(startDate)}-to-${toFormattedDate(endDate)}.pdf`;

					if (contentDisposition) {
						const match = contentDisposition.match(/filename="?(.+?)"?$/i);
						if (match && match[1]) {
							fileName = match[1];
						}
					}

					link.download = fileName;

					document.body.appendChild(link);
					link.click();

					document.body.removeChild(link);
					window.URL.revokeObjectURL(url);

					onClose();
					openSuccessToast(tschedule.scheduleDownloadedSuccessfully);
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<p className="text-sm font-medium text-muted-foreground">
				{type == SCHEDULE_DOWNLOAD_MODAL_TYPE.SCHEDULE
					? "You are downloading the schedule for date range."
					: tschedule.downloadingPayrollForDateRange}{" "}
				{startDate && endDate && `${toFormattedDate(startDate)} - ${toFormattedDate(endDate)}`}
			</p>

			<div className="flex gap-3 py-1">
				<Button variant="outline" className="w-full" onClick={onClose}>
					{tCommon.cancel}
				</Button>

				<Button variant={"filled"} className="w-full" onClick={handleDownloadSchedule} loading={isDownloadingSchedule}>
					{tschedule.download}
				</Button>
			</div>
		</div>
	);
};

export default DownloadConfirmModal;
