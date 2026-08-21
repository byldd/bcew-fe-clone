"use client";

import { useState } from "react";
import Image from "next/image";
import { FiPackage } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { DATE_FORMAT } from "@/types/date";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useModal } from "@/hooks/useModal";
import ImageModal from "@/components/shared/image-upload/image-modal";
import { IAdminCrateActivityItem } from "../types";
import { CRATE_STATUS_LABEL } from "../utils/constants";
import { useAdminCrateActivityReceiveDetails, useMarkCrateReturned } from "../hooks/useCrateActivity";

const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
	<div className="space-y-1">
		<span className="text-xs font-medium text-brand-dark50">{label}</span>
		<p className="text-sm font-medium text-brand-dark">{value}</p>
	</div>
);

const DateTimeValue = ({ date }: { date: string }) => (
	<>
		<span className="block">{toLocalFormattedDate(date, DATE_FORMAT.MM_SLASH_DD_YYYY)}</span>
		<span className="block">{toLocalFormattedDate(date, DATE_FORMAT.HH_MM_AA_PM)}</span>
	</>
);

const TimelinePhotos = ({ photos }: { photos: IAdminCrateActivityItem["photos"] }) => {
	const { openModal, closeModal, Modal } = useModal();

	if (!photos.length) return null;

	return (
		<>
			<div className="flex flex-wrap gap-2">
				{photos.map((photo) => (
					<div
						key={photo.id}
						className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-[8px] border border-brand-dark10"
						onClick={() =>
							openModal({
								modalTitle: "Preview Image",
								modalView: <ImageModal imageUrl={photo.url} onClose={closeModal} />,
								variant: "big",
							})
						}
					>
						<Image src={photo.url} alt="crate" fill className="object-cover" />
					</div>
				))}
			</div>
			<Modal />
		</>
	);
};

const TimelineStep = ({
	title,
	subtitle,
	photos,
}: {
	title: string;
	subtitle: React.ReactNode;
	photos?: IAdminCrateActivityItem["photos"];
}) => (
	<div className="flex gap-3">
		<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-bgLightgrey">
			<FiPackage size={12} className="text-brand-dark" />
		</span>
		<div className="space-y-1">
			<p className="text-sm font-medium text-brand-dark">{title}</p>
			<p className="text-xs text-brand-dark50">{subtitle}</p>
			{!!photos?.length && <TimelinePhotos photos={photos} />}
		</div>
	</div>
);

type Props = {
	item: IAdminCrateActivityItem;
	onClose: () => void;
	readOnly?: boolean;
};

export const CrateActivityDetailsModal = ({ item, onClose, readOnly = false }: Props) => {
	const [note, setNote] = useState("");
	const queryClient = useQueryClient();
	const { mutate: markReturned, isPending } = useMarkCrateReturned(item.id);
	const isReturnRow = item.scan_action === CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN;
	const { data: receiveDetails } = useAdminCrateActivityReceiveDetails(item.id, isReturnRow);
	const sealStatus = isReturnRow ? receiveDetails?.sealStatus : item.sealStatus;

	const handleMarkReturned = () => {
		markReturned(
			{ note: note.trim() || undefined },
			{
				onSuccess: () => {
					openSuccessToast("Crate marked as returned successfully");
					queryClient.invalidateQueries({ queryKey: ["admin-crate-activity"] });
					queryClient.invalidateQueries({ queryKey: ["admin-crate-activity-details"] });
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
			<div className="mt-3 grid grid-cols-4 gap-4">
				<DetailField label="Job" value={item.jobName ?? "--"} />
				<DetailField label="Phase" value={item.phase ?? "--"} />
				<DetailField label="Crate ID" value={item.scanned_crate} />
				<DetailField label="Status" value={CRATE_STATUS_LABEL[item.scan_action as CRATE_SCAN_ACTION]} />
			</div>

			<div className="grid grid-cols-4 gap-4">
				<DetailField label="Technician" value={item.user.name} />
				<DetailField
					label="Received"
					value={
						isReturnRow ? (
							receiveDetails ? (
								<DateTimeValue date={receiveDetails.scanned_date} />
							) : (
								"--"
							)
						) : (
							<DateTimeValue date={item.scanned_date} />
						)
					}
				/>
				<DetailField label="Returned" value={isReturnRow ? <DateTimeValue date={item.scanned_date} /> : "--"} />
				<DetailField label="Seal Tag Status" value={sealStatus === false ? "Broken/Missing" : "Intact"} />
			</div>

			{sealStatus === false && (
				<div className="rounded-[8px] border border-red-200 bg-red-50 p-2">
					<p className="text-sm font-medium text-red-600">Error Detected</p>
					<p className="mt-1 text-xs text-red-500">
						A broken/missing seal was detected on receive. Review before marking this crate as returned.
					</p>
				</div>
			)}

			<div className="space-y-3">
				<span className="text-sm font-medium text-brand-dark">Scan Timeline</span>
				<div className="space-y-4">
					{item.dispatchedDate && (
						<TimelineStep
							title="Dispatched from warehouse"
							subtitle={`${toLocalFormattedDate(item.dispatchedDate, DATE_FORMAT.DATE_AND_TIME)} | Employee Name : ${item.dispatchedByName ?? "--"}`}
						/>
					)}
					{isReturnRow && receiveDetails && (
						<TimelineStep
							title="Scanned received"
							subtitle={`${toLocalFormattedDate(receiveDetails.scanned_date, DATE_FORMAT.DATE_AND_TIME)} | Employee Name : ${receiveDetails.user.name}`}
							photos={receiveDetails.photos}
						/>
					)}
					<TimelineStep
						title={isReturnRow ? "Scanned returned" : "Scanned received"}
						subtitle={`${toLocalFormattedDate(item.scanned_date, DATE_FORMAT.DATE_AND_TIME)} | Employee Name : ${item.user.name}`}
						photos={item.photos}
					/>
				</div>
			</div>

			{!readOnly && (
				<div className="px-0.5">
					<TextareaField
						label="Note (If overriding the status)"
						placeholder="Description..."
						value={note}
						onChange={(e) => setNote(e.target.value)}
					/>

					<div className="flex justify-between gap-2 py-3">
						<Button variant="outline" className="w-full" onClick={onClose} disabled={isPending}>
							Cancel
						</Button>
						<Button variant="filled" className="w-full" loading={isPending} onClick={handleMarkReturned}>
							Mark Returned
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
