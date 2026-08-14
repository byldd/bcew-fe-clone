"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { FiPackage } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { DATE_FORMAT } from "@/types/date";
import { toFormattedDate } from "@/lib/utils/date";
import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useModal } from "@/hooks/useModal";
import ImageModal from "@/components/shared/image-upload/image-modal";
import { IAdminCrateActivityItem } from "../types";
import { CRATE_STATUS_LABEL } from "../utils/constants";
import { useMarkCrateReturned } from "../hooks/useCrateActivity";

const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
	<div className="space-y-1">
		<span className="text-xs text-brand-dark50">{label}</span>
		<p className="text-sm font-semibold text-brand-dark">{value}</p>
	</div>
);

const TimelineStep = ({ title, subtitle }: { title: string; subtitle: React.ReactNode }) => (
	<div className="flex gap-3">
		<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-bgLightgrey">
			<FiPackage size={12} className="text-brand-dark" />
		</span>
		<div>
			<p className="text-sm font-medium text-brand-dark">{title}</p>
			<p className="text-xs text-brand-dark50">{subtitle}</p>
		</div>
	</div>
);

type Props = {
	item: IAdminCrateActivityItem;
	onClose: () => void;
};

export const CrateActivityDetailsModal = ({ item, onClose }: Props) => {
	const [note, setNote] = useState("");
	const queryClient = useQueryClient();
	const { mutate: markReturned, isPending } = useMarkCrateReturned(item.id);
	const { openModal, closeModal, Modal } = useModal();

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
		<div className="space-y-5">
			<div className="grid grid-cols-4 gap-4">
				<DetailField label="Job" value={item.jobName ?? "--"} />
				<DetailField label="Phase" value={item.phase ?? "--"} />
				<DetailField label="Crate ID" value={item.scanned_crate} />
				<DetailField label="Status" value={CRATE_STATUS_LABEL[item.scan_action as CRATE_SCAN_ACTION]} />
			</div>

			<div className="grid grid-cols-4 gap-4">
				<DetailField label="Technician" value={item.user.name} />
				<DetailField label="Received" value={toFormattedDate(item.scanned_date, DATE_FORMAT.HH_MM_AA_PM)} />
				<DetailField label="Returned" value="--" />
				<DetailField label="Seal Tag Status" value={item.sealStatus === false ? "Broken/Missing" : "Intact"} />
			</div>

			{item.sealStatus === false && (
				<div className="rounded-[12px] border border-red-200 bg-red-50 p-3">
					<p className="text-sm font-medium text-red-600">Error detected</p>
					<p className="mt-1 text-xs text-red-500">
						A broken/missing seal was detected on receive. Review before marking this crate as returned.
					</p>
				</div>
			)}

			{!!item.photos.length && (
				<div className="space-y-2">
					<span className="text-sm font-medium text-brand-dark">Images Uploaded</span>
					<div className="flex flex-wrap gap-3">
						{item.photos.map((photo) => (
							<div
								key={photo.id}
								className="relative h-[85px] w-[85px] cursor-pointer overflow-hidden rounded-[10px] border border-brand-dark10"
								onClick={() =>
									openModal({
										modalTitle: "Preview Image",
										modalView: <ImageModal imageUrl={photo.url} onClose={closeModal} />,
										variant: "big",
									})
								}
							>
								<Image src={photo.url} alt="crate" fill className="object-cover" />
								<span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/80">
									<Expand size={11} className="text-brand-dark" />
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="space-y-3">
				<span className="text-sm font-medium text-brand-dark">Scan Timeline</span>
				<div className="space-y-4">
					{item.dispatchedDate && (
						<TimelineStep
							title="Dispatched from warehouse"
							subtitle={`${toFormattedDate(item.dispatchedDate, DATE_FORMAT.DATE_AND_TIME)} | Employee Name : ${item.dispatchedByName ?? "--"}`}
						/>
					)}
					<TimelineStep
						title="Scanned received"
						subtitle={`${toFormattedDate(item.scanned_date, DATE_FORMAT.DATE_AND_TIME)} | Employee Name : ${item.user.name}`}
					/>
				</div>
			</div>

			{item.note && (
				<div className="rounded-[12px] border border-brand-dark10 p-4">
					<span className="text-sm text-brand-dark50">Note</span>
					<p className="mt-1 text-sm font-medium text-brand-dark">{item.note}</p>
				</div>
			)}

			<TextareaField
				label="Note (If overriding the status)"
				placeholder="Description..."
				value={note}
				onChange={(e) => setNote(e.target.value)}
			/>

			<div className="flex justify-between gap-2 pt-2">
				<Button variant="outline" className="w-full" onClick={onClose} disabled={isPending}>
					Cancel
				</Button>
				<Button variant="filled" className="w-full" loading={isPending} onClick={handleMarkReturned}>
					Mark Returned
				</Button>
			</div>

			<Modal />
		</div>
	);
};
