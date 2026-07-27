import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import Image from "next/image";
import React, { useState } from "react";
import { useTravelPayParams } from "../hooks/useTravelPayParams";
import { getBcewWeekRange, toFormattedDate, toMidnightDateString } from "@/lib/utils/date";
import { toDate } from "date-fns";
import { useDownloadTravelPay } from "../hooks/useTravelPay";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import DateRangePickModal, { DATE_PICK_APPLY_TO } from "@/components/common/date-range-modal";
import { Label } from "@/components/ui/label";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const DownloadModal = ({ onClose }: { onClose: () => void }) => {
	const { getParams } = useTravelPayParams();
	const { date } = getParams();

	const tTravelPay = useTypedTranslations(NAMESPACE.TRAVEL_PAY);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const [pdfDate, setPdfDate] = useState<Date | undefined>(date);

	const { weekStart, weekEnd } = getBcewWeekRange(pdfDate);

	const { mutateAsync: downloadTravelPay, isPending } = useDownloadTravelPay();

	const onDownload = () => {
		if (!pdfDate) return;
		downloadTravelPay(
			{ date: toMidnightDateString(pdfDate) },
			{
				onSuccess: (response) => {
					const pdfData = response.data;

					const blob = new Blob([pdfData], { type: "application/pdf" });
					const url = window.URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;

					const contentDisposition = response.headers?.["content-disposition"] as string | undefined;
					let fileName = `travel-pay-${toFormattedDate(weekStart)}-to-${toFormattedDate(weekEnd)}.pdf`;

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

					openSuccessToast(tTravelPay.travelPayDownloadedSuccessfully);
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="space-y-4">
			<div className="space-y-1">
				<Label className="text-brand-grey">{tTravelPay.selectWeek}</Label>
				<DateRangePickModal
					startDate={weekStart}
					endDate={weekEnd}
					onChange={(startDate) => {
						setPdfDate(startDate ? toDate(startDate) : undefined);
					}}
					selectApplyTo={DATE_PICK_APPLY_TO.END_DATE}
					onMoveBack={(startDate) => {
						setPdfDate(startDate);
					}}
					onMoveForward={(startDate, endDate) => {
						setPdfDate(endDate);
					}}
					dayRange={6}
				/>
			</div>

			<p className="my-12 text-sm text-brand-dark60">
				{tTravelPay.downloadingTravelPayForDateRange}
				{toFormattedDate(weekStart)} - {toFormattedDate(weekEnd)}
			</p>

			<div className="mt-18 flex flex-col gap-2">
				<Button disabled={isPending} className="w-full" variant={"outline"} onClick={onClose}>
					{tCommon.cancel}
				</Button>

				<Button loading={isPending} disabled={isPending} className="w-full" variant={"filled"} onClick={onDownload}>
					{tTravelPay.download}
				</Button>
			</div>
		</div>
	);
};

const DownloadPdf = () => {
	const { openModal, Modal, closeModal } = useModal();
	const tTravelPay = useTypedTranslations(NAMESPACE.TRAVEL_PAY);

	const onDownload = () => {
		openModal({
			modalView: <DownloadModal onClose={closeModal} />,
			modalTitle: tTravelPay.downloadTravelPay,
			variant: "medium",
		});
	};

	return (
		<>
			<Button
				variant="outline"
				className="h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 outline-none hover:bg-white 3xl:h-[80px] 3xl:w-[80px]"
				onClick={onDownload}
			>
				<Image
					src="/assets/svg/download.svg"
					alt="download"
					width={28}
					height={28}
					className="3xl:h-[56px] 3xl:w-[56px]"
				/>
			</Button>
			<Modal />
		</>
	);
};

export default DownloadPdf;
