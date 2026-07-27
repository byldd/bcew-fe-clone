"use client";

import { UserType } from "@/module/profile/types";
import { IMyTechnicalIssue } from "../types/types";
import { useModal } from "@/hooks/useModal";
import { useMyTechnicalIssueById, useUpdateMyTechnicalIssue } from "../../hooks/useTechnicalIssues";
import ReportTechnicalIssue from "../../report-technical-bug/components/report-technical-issue";
import { Spinner } from "@/components/ui/spinner";
import { FaRegEdit } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";

export function EditIssueButton({
	ticket,
	user,
	subcontractorCrew,
}: {
	ticket: IMyTechnicalIssue;
	user: UserType["data"]["user"] | null;
	subcontractorCrew?: UserType["data"]["subContractorCrew"] | null;
}) {
	const { openModal, closeModal, Modal } = useModal();
	const { mutateAsync: updateIssue } = useUpdateMyTechnicalIssue(user, subcontractorCrew);
	const queryClient = useQueryClient();

	const { refetch, isFetching } = useMyTechnicalIssueById(user, subcontractorCrew, ticket.id);

	const handleEditClick = async () => {
		const result = await refetch();
		const detail = result.data;
		if (!detail) return;

		openModal({
			modalTitle: `Edit Issue #${ticket.ticketNumber}`,
			modalView: (
				<ReportTechnicalIssue
					onClose={closeModal}
					openModal={openModal}
					editIssue={{
						id: ticket.id,
						defaultValues: {
							issueType: detail.issueType,
							description: detail.description,
							images: detail.screenshots.map((s) => ({ keyFile: s.keyFile, url: s.url })),
						},
						onSave: async (payload) => {
							await updateIssue({ id: ticket.id, ...payload });
							queryClient.invalidateQueries({ queryKey: ["my-technical-issues"] });
						},
					}}
				/>
			),
		});
	};

	return (
		<div onClick={(e) => e.stopPropagation()}>
			<button
				type="button"
				onClick={handleEditClick}
				disabled={isFetching}
				className="rounded p-1 text-brand-dark50 hover:text-brand-dark disabled:opacity-50"
				aria-label="Edit issue"
			>
				{isFetching ? <Spinner className="h-3.5 w-3.5" /> : <FaRegEdit size={14} />}
			</button>
			<Modal />
		</div>
	);
}
