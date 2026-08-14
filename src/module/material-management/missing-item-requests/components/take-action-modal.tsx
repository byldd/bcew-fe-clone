"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import { cn } from "@/lib/utils/utils";
import { routes } from "@/config/routes";
import { getPhaseNumberByName } from "@/utils/schedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useRejectMissingItem } from "@/module/material-management/missing-item-requests-admin/hooks/useAdminMissingItemRequests";
import {
	MISSING_ITEM_REQUEST_STATUS,
	type AdminMissingItemRequest,
} from "@/module/material-management/missing-item-requests-admin/utils/types";
import { TAKE_ACTION_TAB } from "../utils/enums";

const TAB_CONFIG: Record<TAKE_ACTION_TAB, { label: string; confirmLabel: string }> = {
	[TAKE_ACTION_TAB.REJECT]: { label: "Reject with a Reason", confirmLabel: "Reject Request" },
	[TAKE_ACTION_TAB.CONVERT]: { label: "Convert to Standard Material Request", confirmLabel: "Convert Request" },
};

type TakeActionModalProps = {
	item: AdminMissingItemRequest;
	onClose: () => void;
};

export default function TakeActionModal({ item, onClose }: TakeActionModalProps) {
	const initialTab =
		item.status === MISSING_ITEM_REQUEST_STATUS.REJECTED
			? TAKE_ACTION_TAB.REJECT
			: item.status === MISSING_ITEM_REQUEST_STATUS.CONVERTED
				? TAKE_ACTION_TAB.CONVERT
				: null;

	const [activeTab, setActiveTab] = useState<TAKE_ACTION_TAB | null>(initialTab);
	const [reason, setReason] = useState(item.foremanNote ?? "");
	const [showError, setShowError] = useState(false);
	const router = useRouter();
	const { mutate: rejectItem, isPending } = useRejectMissingItem();

	const isReasonEmpty = !reason.trim();

	const handleConvert = () => {
		if (!item.recnum || !item.jobDailyRecordId) return;
		router.push(
			routes.admin.jobMaterialSelection({
				jobDailyRecordId: item.jobDailyRecordId,
				jobnum: item.recnum,
				tsknum: getPhaseNumberByName(item.phase ?? "") ?? undefined,
				userId: item.user?.id,
				missingItemRequestId: item.id,
			})
		);
		onClose();
	};

	const handleConfirm = () => {
		if (activeTab === TAKE_ACTION_TAB.CONVERT) {
			handleConvert();
			return;
		}

		if (isReasonEmpty) {
			setShowError(true);
			return;
		}

		rejectItem(
			{ id: item.id, payload: { foremanNote: reason } },
			{
				onSuccess: () => {
					openSuccessToast("Unknown item request rejected");
					onClose();
				},
				onError: (error) => openErrorToast({ error }),
			}
		);
	};

	return (
		<div className="space-y-5 px-1 py-2">
			<div className="my-2 flex gap-2">
				{(Object.keys(TAB_CONFIG) as TAKE_ACTION_TAB[]).map((tab) => (
					<Button
						key={tab}
						type="button"
						onClick={() => setActiveTab(tab)}
						variant={activeTab === tab ? "filled" : "outline"}
						disabled={isPending}
						loading={isPending}
						className={cn("w-full py-4", activeTab === tab ? "" : "border-gray-500 text-gray-500")}
					>
						{TAB_CONFIG[tab].label}
					</Button>
				))}
			</div>

			{activeTab === TAKE_ACTION_TAB.REJECT && (
				<TextareaField
					placeholder="Type here"
					value={reason}
					onChange={(event) => {
						setReason(event.target.value);
						if (showError) setShowError(false);
					}}
					error={showError && isReasonEmpty ? "Reason is required" : undefined}
				/>
			)}

			<div className="flex gap-4">
				<Button className="w-full" variant="outline" onClick={onClose} disabled={isPending}>
					Cancel
				</Button>
				{activeTab && (
					<Button
						className="w-full"
						variant="filled"
						onClick={handleConfirm}
						loading={activeTab === TAKE_ACTION_TAB.REJECT && isPending}
						disabled={activeTab === TAKE_ACTION_TAB.REJECT && isPending}
					>
						{TAB_CONFIG[activeTab].confirmLabel}
					</Button>
				)}
			</div>
		</div>
	);
}
