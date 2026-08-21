"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { IAdminTechnicalIssueResponse } from "../types";
import { TECHNICAL_ISSUE_CLASSIFICATION, TECHNICAL_ISSUE_SEVERITY, TECHNICAL_ISSUE_STATUS } from "@/utils/enums";
import { toFormattedDate } from "@/lib/utils/date";
import { getTechnicalIssueClassificationLabel, getTechnicalIssueTypeLabel } from "../helpers";
import { useModal } from "@/hooks/useModal";
import TakeActionModal from "@/module/employee-technical-issue/report-technical-bug/components/take-action-modal";
import ReportTechnicalIssue from "@/module/employee-technical-issue/report-technical-bug/components/report-technical-issue";
import StatusSelector from "../components/status-selector";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { FaRegEdit } from "react-icons/fa";
import { ScreenshotPreview } from "../components/screenshot-previews";
import useAuthStore from "@/store/auth-store";
import { ROLES } from "@/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useAdminUpdateTechnicalIssue } from "../hooks/useTechnicalIssues";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";
import { ACCESS_LEVEL } from "@/module/employee/enums";

const StatusBadge = ({ label }: { label: TECHNICAL_ISSUE_STATUS }) => {
	const styles: Record<TECHNICAL_ISSUE_STATUS, string> = {
		OPEN: "bg-white text-[#151515] border border-[#E5E7EB]",
		IN_PROGRESS: "bg-[#FFFCE5] text-[#937823]",
		RESOLVED: "bg-[#E6F4EA] text-[#1E7F3C]",
		CANCELLED: "bg-[#F2F2F2] text-[#9CA3AF]",
		ON_HOLD: "bg-[#F2F2F2] text-[#9CA3AF]",
	};

	return (
		<span className={`min-w-[90px] rounded-[6px] py-1.5 text-center text-xs font-medium ${styles[label]}`}>
			{formatSnakeCase(label)}
		</span>
	);
};

const SeverityBadge = ({ label }: { label: TECHNICAL_ISSUE_SEVERITY }) => {
	const styles: Record<TECHNICAL_ISSUE_SEVERITY, string> = {
		HIGH: "bg-[#F01D1D1A] text-[#F01D1D]",
		MEDIUM: "bg-[#FFF7ED] text-[#C2410C]",
		LOW: "bg-[#FFFCE5] text-[#937823]",
	};

	return (
		<span className={`min-w-[90px] rounded-[6px] py-1.5 text-center text-xs font-medium ${styles[label]}`}>
			{formatSnakeCase(label)}
		</span>
	);
};

const useTakeActionModal = (issue: IAdminTechnicalIssueResponse) => {
	const { openModal, closeModal, Modal } = useModal();

	const openTakeAction = () =>
		openModal({
			modalTitle: `Ticket #${issue.ticketNumber}`,
			modalView: <TakeActionModal issueId={issue.id} onClose={closeModal} />,
		});

	return { openTakeAction, Modal };
};

const ActionCell = ({ issue }: { issue: IAdminTechnicalIssueResponse }) => {
	const { openTakeAction, Modal } = useTakeActionModal(issue);
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);

	return (
		<div className="ml-6 flex min-h-[40px] items-center">
			<div className="w-[120px]">
				{!issue?.classification?.classification ? (
					<Button
						onClick={openTakeAction}
						className="h-[29px] min-w-[100px] rounded-[6px] bg-brand-dark px-3 text-xs font-medium text-white"
					>
						{tAdmin.takeAction}
					</Button>
				) : (
					<span className="text-xs font-medium text-brand-dark60">
						{getTechnicalIssueClassificationLabel(issue.classification.classification)}
					</span>
				)}
			</div>
			<Modal />
		</div>
	);
};

const EditIssueCell = ({ issue }: { issue: IAdminTechnicalIssueResponse }) => {
	const { openModal, closeModal, Modal } = useModal();
	const { mutateAsync: updateIssue } = useAdminUpdateTechnicalIssue();
	const queryClient = useQueryClient();

	const classification = issue.classification?.classification;
	const isValidBug = classification === TECHNICAL_ISSUE_CLASSIFICATION.VALID_BUG;
	const isNotABug = classification === TECHNICAL_ISSUE_CLASSIFICATION.NOT_A_BUG;

	if (isValidBug) {
		return <div className="flex items-center justify-center text-brand-dark">--</div>;
	}

	// Unclassified and "Not a Bug" issues stay editable; other classifications hide the edit action.
	if (classification && !isNotABug) {
		return null;
	}

	const handleEdit = () => {
		openModal({
			modalTitle: `Edit Issue #${issue.ticketNumber}`,
			modalView: (
				<ReportTechnicalIssue
					onClose={closeModal}
					openModal={openModal}
					editIssue={{
						id: issue.id,
						defaultValues: {
							issueType: issue.issueType,
							description: issue.description,
							images: issue.screenshots.map((s) => ({ keyFile: s.keyFile, url: s.url })),
						},
						onSave: async (payload) => {
							await updateIssue({ id: issue.id, ...payload });
							queryClient.invalidateQueries({ queryKey: ["admin-technical-issues"] });
						},
					}}
				/>
			),
		});
	};

	return (
		<div className="flex items-center justify-center">
			<FaRegEdit size={18} onClick={handleEdit} className="cursor-pointer text-brand-dark" />
			<Modal />
		</div>
	);
};

export const useTechnicalIssuesColumns = () => {
	const { user } = useAuthStore((state) => state);

	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);
	const { pageAccess } = useAdminPageAccessContext();

	const baseColumns: ColumnDef<IAdminTechnicalIssueResponse>[] = [
		{
			header: tAdmin.employee,
			cell: ({ row }) => (
				<div className="flex flex-col items-start">
					<span className="text-sm text-brand-dark">{row.original?.reporter?.name}</span>
				</div>
			),
		},
		{
			accessorKey: "ticketNumber",
			header: tAdmin.ticketNumber,
		},
		{
			accessorKey: "date",
			header: tAdmin.date,
			cell: ({ row }) => <div className="ml-4 flex items-center">{toFormattedDate(row?.original?.createdAt)}</div>,
		},
		{
			header: tAdmin.issue,
			cell: ({ row }) => (
				<span
					className="ml-4 block max-w-[220px] truncate text-sm font-medium text-brand-dark"
					title={getTechnicalIssueTypeLabel(row.original.issueType)}
				>
					{getTechnicalIssueTypeLabel(row.original.issueType)}
				</span>
			),
		},
		{
			accessorKey: "description",
			header: tAdmin.description,
			size: 280,
			cell: ({ getValue }) => {
				const value = getValue<string>();
				return (
					<div className="max-w-[280px] overflow-hidden">
						<p
							className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-brand-dark"
							title={value}
						>
							{value || "--"}
						</p>
					</div>
				);
			},
		},
		{
			header: tAdmin.screenshots,
			cell: ({ row }) => <ScreenshotPreview images={row.original?.screenshots} />,
		},
		{
			header: tAdmin.status,
			cell: ({ row }) => {
				const issue = row.original;

				const isStatusEditable =
					user?.userType === ROLES.ADMIN &&
					issue?.classification?.classification === TECHNICAL_ISSUE_CLASSIFICATION.VALID_BUG &&
					issue.status !== TECHNICAL_ISSUE_STATUS.CANCELLED;

				return (
					<div className="ml-6 flex items-center justify-center gap-2">
						{isStatusEditable ? (
							<StatusSelector issueId={issue.id} status={issue.status} />
						) : (
							<StatusBadge label={issue.status} />
						)}
					</div>
				);
			},
		},
		{
			header: tAdmin.severity,
			cell: ({ row }) => {
				const severity = row.original?.classification?.severity;

				return (
					<div className="ml-6 flex items-center justify-center">
						{severity ? <SeverityBadge label={severity} /> : "--"}
					</div>
				);
			},
		},
		{
			header: "Asana",
			cell: ({ row }) => {
				const url = row.original?.asana?.asanaUrl;

				return (
					<div className="ml-6 flex items-center justify-center">
						{url ? (
							<a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
								View Task
							</a>
						) : (
							"--"
						)}
					</div>
				);
			},
		},
	];

	// Action column logic
	if (pageAccess?.accessLevel === ACCESS_LEVEL.WRITE) {
		baseColumns.push({
			header: tAdmin.action,
			cell: ({ row }) => {
				const issue = row.original;

				const isAdmin = user?.userType === ROLES.ADMIN;
				const isClassified = !!issue?.classification?.classification;

				if (isAdmin) {
					return <ActionCell issue={issue} />;
				} else if (isClassified) {
					return <ActionCell issue={issue} />;
				}

				return null;
			},
		});
	}

	// Only add Edit column if ADMIN
	if (user?.userType === ROLES.ADMIN && pageAccess?.accessLevel === ACCESS_LEVEL.WRITE) {
		baseColumns.push({
			header: tAdmin.edit,
			cell: ({ row }) => <EditIssueCell issue={row.original} />,
		});
	}

	return baseColumns;
};
