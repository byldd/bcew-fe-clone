"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import TrackTicketCard from "./track-ticket-details";
import { useMyTechnicalIssues } from "../../hooks/useTechnicalIssues";
import { IMyTechnicalIssue } from "../types/types";
import { TICKET_STATUS_LABEL } from "../constants/constants";
import { Spinner } from "@/components/ui/spinner";
import { toFormattedDate } from "@/lib/utils/date";
import {
	getTechnicalIssueClassificationLabel,
	getTechnicalIssueTypeLabel,
} from "@/module/admin-technical-issues/helpers";
import useAuthStore from "@/store/auth-store";
import BackButton from "@/components/common/back-button";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useSearchParams } from "next/navigation";
import { EditIssueButton } from "../components/edit-button";

export default function EmployeeTechnicalIssueTemplate() {
	const [selectedTicket, setSelectedTicket] = useState<IMyTechnicalIssue | null>(null);
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);
	const { user, subcontractorCrew } = useAuthStore((state) => state);
	const { data, isLoading } = useMyTechnicalIssues(user, subcontractorCrew);

	const searchParams = useSearchParams();
	const issueId = searchParams.get("issueId");

	useEffect(() => {
		// scroll to empoyeeId
		const element = document.getElementById(`${issueId}`);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, [issueId, data]);

	if (isLoading) return <Spinner />;

	return (
		<div className="min-h-screen bg-brand-bgLightgrey px-4 pb-20 pt-4">
			<div className="mb-4 flex items-center gap-1">
				<BackButton />
				<h1 className="text-xl font-semibold text-brand-dark">{tAdmin.trackTickets}</h1>
			</div>

			<div className="space-y-3">
				{data?.map((ticket) => {
					const statusUI = TICKET_STATUS_LABEL[ticket.status] ?? TICKET_STATUS_LABEL.OPEN;
					const isEditable = !ticket.classification;

					return (
						<div
							key={ticket.id}
							id={ticket.id}
							onClick={() => setSelectedTicket(ticket)}
							className={`w-full space-y-1 rounded-[10px] p-4 shadow-md ${issueId === ticket?.id ? "bg-gray-300" : "bg-white"}`}
						>
							<div className="mb-2 flex justify-between">
								<p className="text-xs font-medium text-brand-dark50">
									{tAdmin.ticketNumber}
									{ticket.ticketNumber}
								</p>

								<div className="flex items-center gap-2">
									{isEditable && <EditIssueButton ticket={ticket} user={user} subcontractorCrew={subcontractorCrew} />}

									{statusUI && (
										<span className={`text-xs font-medium ${statusUI.className}`}>
											{formatSnakeCase(statusUI.label)}
										</span>
									)}
								</div>
							</div>

							<p className="text-sm font-semibold text-brand-dark">{getTechnicalIssueTypeLabel(ticket?.issueType)}</p>

							<p className="line-clamp-2 text-[10px] text-brand-dark50">{ticket.description}</p>

							<p className="text-[8px] text-brand-dark30">
								{tAdmin.createdOn}: {toFormattedDate(ticket.createdAt)}
							</p>

							{ticket.classification?.classification && (
								<p className="text-brand-dark40 text-[10px]">
									{getTechnicalIssueClassificationLabel(ticket.classification.classification)}
								</p>
							)}
						</div>
					);
				})}
			</div>

			<div className="fixed inset-x-0 bottom-0 bg-white px-4 py-3">
				<Button className="h-11 w-full" variant="filled">
					{tAdmin.done}
				</Button>
			</div>

			{selectedTicket && <TrackTicketCard ticketId={selectedTicket.id} onClose={() => setSelectedTicket(null)} />}
		</div>
	);
}
