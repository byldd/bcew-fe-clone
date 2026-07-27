"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TICKET_STATUS_LABEL } from "../constants/constants";
import { useMyTechnicalIssueById } from "../../hooks/useTechnicalIssues";
import { Spinner } from "@/components/ui/spinner";
import { TECHNICAL_ISSUE_CLASSIFICATION } from "@/utils/enums";
import { toFormattedDate } from "@/lib/utils/date";
import { getTechnicalIssueTypeLabel } from "@/module/admin-technical-issues/helpers";
import useAuthStore from "@/store/auth-store";
import { useModal } from "@/hooks/useModal";
import ImageModal from "@/components/shared/image-upload/image-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type Props = {
	ticketId: string;
	onClose: () => void;
};

export default function TrackTicketCard({ ticketId, onClose }: Props) {
	const { user, subcontractorCrew } = useAuthStore((state) => state);
	const { data, isLoading } = useMyTechnicalIssueById(user, subcontractorCrew, ticketId);
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);
	const { openModal, closeModal, Modal } = useModal();

	const handleImageClick = (imageUrl: string) => {
		openModal({
			modalTitle: tAdmin.previewImage,
			modalView: <ImageModal imageUrl={imageUrl} onClose={closeModal} />,
			variant: "big",
		});
	};

	if (isLoading) return <Spinner />;

	if (!data) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
				<div className="w-full max-w-sm rounded-2xl bg-white p-4 text-center shadow-lg">
					<p className="text-sm font-medium text-brand-dark">{tAdmin.ticketNotFound}</p>
					<p className="mt-1 text-xs text-brand-grey">{tAdmin.ticketNotFoundDescription}</p>

					<Button onClick={onClose} className="mt-4 h-10 w-full rounded-xl">
						{tAdmin.close}
					</Button>
				</div>
			</div>
		);
	}

	const statusUI = TICKET_STATUS_LABEL[data.status] ?? TICKET_STATUS_LABEL.OPEN;

	const classification = data?.classification;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
			<div className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-4 shadow-lg">
				{/* Header */}
				<div className="mb-3 flex items-center justify-between">
					<p className="text-sm font-medium text-brand-dark50">
						{tAdmin.ticketNumber}
						{data.ticketNumber}
					</p>

					{statusUI && (
						<span className={`rounded-full px-2 py-[2px] text-sm font-medium ${statusUI.className}`}>
							{statusUI.label}
						</span>
					)}
				</div>

				{data?.classification?.classification === TECHNICAL_ISSUE_CLASSIFICATION?.NOT_A_BUG && (
					<p className="rounded-[6px] bg-brand-lightyellow py-[6px] text-center text-[11px] font-medium text-brand-yellow600">
						{tAdmin.issueMarkedNotBugCancelled}
					</p>
				)}

				{/* Issue + Date */}
				<div className="flex justify-between">
					<div className="space-y-1">
						<p className="text-xs text-brand-grey">{tAdmin.issue}</p>
						<p className="text-sm font-medium text-brand-dark">{getTechnicalIssueTypeLabel(data?.issueType)}</p>
					</div>

					<div className="space-y-1">
						<p className="text-xs text-brand-grey">{tAdmin.dateCreated}</p>
						<p className="text-sm font-medium text-brand-dark">{toFormattedDate(data?.createdAt)}</p>
					</div>
				</div>

				{/* Description */}
				<div className="mb-4">
					<p className="mb-1 text-xs text-brand-grey">{tAdmin.whatWentWrong}</p>
					<p className="block max-h-[140px] min-h-[40px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-all text-sm leading-tight text-brand-dark">
						{data.description}
					</p>
				</div>

				{/* Screenshots */}
				{data.screenshots?.length > 0 && (
					<div>
						<p className="mb-2 text-xs text-brand-grey">{tAdmin.screenshots}</p>
						<div className="flex gap-2">
							{data.screenshots.map((img) => (
								<div key={img.id} className="h-14 w-14 overflow-hidden rounded-md bg-brand-bgLightgrey">
									<Image
										src={img.url}
										alt="screenshot"
										width={56}
										height={56}
										className="h-full w-full object-cover"
										onClick={() => handleImageClick(img.url)}
									/>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Classification Reason */}
				{classification?.reason && (
					<div className="space-y-1">
						<p className="mb-1 text-xs text-brand-grey">{tAdmin.reason}</p>
						<p className="block max-h-[140px] min-h-[40px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words text-sm leading-tight text-brand-dark">
							{classification.reason}
						</p>
					</div>
				)}

				<Button onClick={onClose} className="my-6 w-full rounded-xl bg-black text-sm font-medium text-white">
					{tAdmin.done}
				</Button>
			</div>
			<Modal />
		</div>
	);
}
