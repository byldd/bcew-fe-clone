"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/selectField";
import Image from "next/image";

import { TECHNICAL_ISSUE_CLASSIFICATION, TECHNICAL_ISSUE_SEVERITY } from "@/utils/enums";

import {
	getTechnicalIssueTypeLabel,
	getTechnicalIssueClassificationLabel,
	getTechnicalIssueSeverityLabel,
} from "@/module/admin-technical-issues/helpers";

import { toFormattedDate } from "@/lib/utils/date";
import {
	useAdminTechnicalIssue,
	useTakeTechnicalIssueAction,
} from "@/module/admin-technical-issues/hooks/useTechnicalIssues";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import ImageModal from "@/components/shared/image-upload/image-modal";
import { useModal } from "@/hooks/useModal";
import { Spinner } from "@/components/ui/spinner";

type Props = {
	onClose: () => void;
	issueId: string;
};

export default function TakeActionModal({ onClose, issueId }: Props) {
	const { data: issue, isLoading } = useAdminTechnicalIssue(issueId);

	const [classification, setClassification] = useState<TECHNICAL_ISSUE_CLASSIFICATION>(
		issue?.classification?.classification ?? TECHNICAL_ISSUE_CLASSIFICATION.NOT_A_BUG
	);

	const [severity, setSeverity] = useState<TECHNICAL_ISSUE_SEVERITY | "">(issue?.classification?.severity ?? "");

	const [reason, setReason] = useState(issue?.classification?.reason ?? "");
	const [validBugDescription, setValidBugDescription] = useState(issue?.classification?.validBugDescription ?? "");

	const { openModal, closeModal: closeChildModal, Modal } = useModal();

	const queryClient = useQueryClient();

	/* ------------------------------ API ------------------------------ */
	const { mutate: takeAction, isPending } = useTakeTechnicalIssueAction(issue?.id ?? "");

	/* ------------------------------ Options ------------------------------ */

	const classifyIssueOptions = Object.values(TECHNICAL_ISSUE_CLASSIFICATION).map((value) => ({
		label: getTechnicalIssueClassificationLabel(value),
		value,
	}));

	const severityOptions = Object.values(TECHNICAL_ISSUE_SEVERITY).map((value) => ({
		label: getTechnicalIssueSeverityLabel(value),
		value,
	}));

	/* ------------------------------ Submit ------------------------------ */

	const handleSubmit = () => {
		takeAction(
			{
				classification,
				reason: classification === TECHNICAL_ISSUE_CLASSIFICATION.NOT_A_BUG ? reason : undefined,
				validBugDescription: validBugDescription,
				severity:
					classification === TECHNICAL_ISSUE_CLASSIFICATION.VALID_BUG
						? (severity as TECHNICAL_ISSUE_SEVERITY)
						: undefined,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["admin-technical-issues"],
					});
					onClose();
				},
			}
		);
	};

	const handleImageClick = (imageUrl: string) => {
		openModal({
			modalTitle: "Preview Image",
			modalView: <ImageModal imageUrl={imageUrl} onClose={closeChildModal} />,
			variant: "big",
		});
	};

	const isSubmitDisabled = classification === TECHNICAL_ISSUE_CLASSIFICATION.VALID_BUG && !severity;

	/* ------------------------------ UI ------------------------------ */

	if (isLoading)
		return (
			<div className="flex items-center justify-center p-2">
				<Spinner />
			</div>
		);

	if (!issue) return <div className="flex items-center justify-center p-2">Issue not found</div>;

	return (
		<div className="flex max-h-[100vh] flex-col rounded-[10px] bg-white">
			<div className="flex-1 space-y-4 overflow-y-auto">
				<Modal />
				{/* Meta */}
				<div className="grid grid-cols-2 gap-10">
					<div className="space-y-1">
						<p className="text-sm text-brand-grey">Employee Name</p>
						<p className="text-sm font-medium text-brand-dark">{issue?.reporter?.name}</p>
					</div>

					<div className="space-y-1">
						<p className="text-sm text-brand-grey">Date</p>
						<p className="text-sm font-medium text-brand-dark">{toFormattedDate(issue?.createdAt)}</p>
					</div>
				</div>

				{/* Issue Type */}
				<div className="space-y-1">
					<p className="text-sm text-brand-grey">Issue Type</p>
					<p className="text-sm font-medium text-brand-dark">{getTechnicalIssueTypeLabel(issue.issueType)}</p>
				</div>

				{/* Description */}
				<div className="space-y-1">
					<p className="text-sm text-brand-grey">Issue Description</p>
					<p className="max-h-20 overflow-y-auto whitespace-pre-wrap break-words text-sm font-medium text-brand-dark">
						{issue.description}
					</p>
				</div>

				{/* Screenshots */}
				{issue?.screenshots?.length > 0 && (
					<div className="space-y-1">
						<p className="text-sm text-brand-grey">Screenshots</p>
						<div className="flex gap-2">
							{issue.screenshots.map((img) => (
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

				{/* Classify */}
				<div className="space-y-1">
					<p className="text-sm text-brand-grey">Select Issue</p>
					<SelectField
						placeholder="Select Issue Type"
						value={classification}
						options={classifyIssueOptions}
						onValueChange={(val) => setClassification(val as TECHNICAL_ISSUE_CLASSIFICATION)}
					/>
				</div>

				{/* Not a Bug */}
				{classification === TECHNICAL_ISSUE_CLASSIFICATION.NOT_A_BUG && (
					<div className="space-y-1">
						<p className="text-sm text-brand-grey">Reason</p>
						<div className="px-0.5">
							<Textarea
								className="w-full resize-none rounded-[8px] border text-sm outline-none"
								rows={3}
								maxLength={500}
								placeholder="Briefly explain"
								value={reason}
								onChange={(e) => setReason(e.target.value)}
							/>
						</div>
						<p className="text-right text-[10px] text-brand-grey">{reason.length}/500</p>
					</div>
				)}

				{classification === TECHNICAL_ISSUE_CLASSIFICATION.VALID_BUG && (
					<div className="space-y-1">
						<p className="text-sm text-brand-grey">Bug Description</p>
						<div className="px-0.5">
							<Textarea
								className="w-full resize-none rounded-[8px] border text-sm outline-none"
								rows={3}
								maxLength={1000}
								placeholder="Briefly explain"
								value={validBugDescription}
								onChange={(e) => setValidBugDescription(e.target.value)}
							/>
						</div>
						<p className="text-right text-[10px] text-brand-grey">{validBugDescription.length}/1000</p>
					</div>
				)}

				{/* Valid Bug */}
				{classification === TECHNICAL_ISSUE_CLASSIFICATION.VALID_BUG && (
					<div className="space-y-1">
						<p className="text-sm text-brand-grey">Set Severity</p>
						<SelectField
							placeholder="Low, Medium, High"
							value={severity}
							options={severityOptions}
							onValueChange={(val) => setSeverity(val as TECHNICAL_ISSUE_SEVERITY)}
						/>
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="sticky bottom-0 bg-white pt-6">
				<div className="flex w-full justify-between gap-2">
					<Button variant="outline" onClick={onClose} className="w-full">
						Cancel
					</Button>

					<Button
						variant="filled"
						className="w-full"
						onClick={handleSubmit}
						loading={isPending}
						disabled={isSubmitDisabled}
					>
						Save & Close
					</Button>
				</div>
			</div>
		</div>
	);
}
