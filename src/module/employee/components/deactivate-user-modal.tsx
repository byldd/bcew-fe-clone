"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/ui/selectField";
import { useModal } from "@/hooks/useModal";
import { useEmployees } from "@/module/employee/hooks/useEmployee";
import { useEmployeeTransferItems, useTransferAssignments } from "@/module/employee/hooks/useEmployeeOffboarding";
import { mockEmployeeOptions } from "../utils/mock-employee-options";
import { TRANSFER_ITEM_CATEGORY } from "@/module/employee/enums";
import { ITransferGroup } from "@/module/employee/types";
import ConfirmDeactivationModal from "./confirm-deactivation-modal";

interface Props {
	employeeId: string;
	employeeName: string;
	onClose: () => void;
	onConfirmDeactivate: () => void;
}

const FALLBACK_TRANSFER_GROUPS: ITransferGroup[] = [
	{
		category: TRANSFER_ITEM_CATEGORY.OPEN_TASKS,
		label: "Open Tasks",
		items: [
			{
				id: "install-primary-conduit",
				title: "Install primary conduit",
				subtitle: "Job #112 - Franconia Square TH803 - Due May 20",
				category: TRANSFER_ITEM_CATEGORY.OPEN_TASKS,
			},
			{
				id: "schedule-final-inspection",
				title: "Schedule final inspection",
				subtitle: "Job #145 - Cedar Run Townhomes - Due May 22",
				category: TRANSFER_ITEM_CATEGORY.OPEN_TASKS,
			},
			{
				id: "complete-addendum-review",
				title: "Complete addendum review",
				subtitle: "Job #098 - Oakview Terrace - Due May 18",
				category: TRANSFER_ITEM_CATEGORY.OPEN_TASKS,
			},
		],
	},
	{
		category: TRANSFER_ITEM_CATEGORY.PENDING_APPROVALS,
		label: "Pending Approvals",
		items: [
			{
				id: "material-request-002491",
				title: "Material Request #002491 — final sign-off",
				subtitle: " Main Warehouse - Awaiting QC review",
				category: TRANSFER_ITEM_CATEGORY.PENDING_APPROVALS,
			},
			{
				id: "addendum-foundation-repair",
				title: "Addendum — Foundation Repair Scope Expansion",
				subtitle: "Job #112 - Franconia Square TH803 - Awaiting approval",
				category: TRANSFER_ITEM_CATEGORY.PENDING_APPROVALS,
			},
		],
	},
	{
		category: TRANSFER_ITEM_CATEGORY.SCHEDULE_ASSIGNMENTS,
		label: "Schedule Assignments",
		items: [
			{
				id: "qc-reviewer-job-112",
				title: "QC Reviewer — Job #112, Franconia Square",
				subtitle: "May 19 - May 30",
				category: TRANSFER_ITEM_CATEGORY.SCHEDULE_ASSIGNMENTS,
			},
			{
				id: "on-call-qc-rotation",
				title: "On-call QC rotation",
				subtitle: "Week of May 26",
				category: TRANSFER_ITEM_CATEGORY.SCHEDULE_ASSIGNMENTS,
			},
		],
	},
	{
		category: TRANSFER_ITEM_CATEGORY.ACCESS_PERMISSIONS,
		label: "Access & Permissions",
		items: [
			{
				id: "qc-config-east-region",
				title: "QC Config — East Region",
				subtitle: "Edit access to QC workflow configuration",
				category: TRANSFER_ITEM_CATEGORY.ACCESS_PERMISSIONS,
			},
			{
				id: "reason-codes-library",
				title: "Reason Codes Library",
				subtitle: "Edit access to global reason code list",
				category: TRANSFER_ITEM_CATEGORY.ACCESS_PERMISSIONS,
			},
			{
				id: "qc-templates-east-region",
				title: "QC Templates — East Region",
				subtitle: "Edit access to checklist templates",
				category: TRANSFER_ITEM_CATEGORY.ACCESS_PERMISSIONS,
			},
			{
				id: "pdf-markup-tool",
				title: "PDF Markup Tool",
				subtitle: "Reviewer access to plan markup & annotations",
				category: TRANSFER_ITEM_CATEGORY.ACCESS_PERMISSIONS,
			},
			{
				id: "project-admin-east-region",
				title: "Project Admin — East Region",
				subtitle: "Full admin/reviewer access for this region",
				category: TRANSFER_ITEM_CATEGORY.ACCESS_PERMISSIONS,
			},
		],
	},
];

const DeactivateUserModal = ({ employeeId, employeeName, onClose, onConfirmDeactivate }: Props) => {
	const { openModal, closeModal, Modal } = useModal();

	const { data: employeesData } = useEmployees({ pageSize: 100 });

	const { data: transferGroupsData } = useEmployeeTransferItems(employeeId);

	const transferMutation = useTransferAssignments(employeeId);

	const transferGroups = transferGroupsData ?? FALLBACK_TRANSFER_GROUPS;

	const recipientOptions = employeesData?.items?.length
		? employeesData.items
				.filter((employee) => employee.id !== employeeId)
				.map((employee) => ({ label: employee.memberName, value: employee.id }))
		: mockEmployeeOptions;

	const [bulkRecipient, setBulkRecipient] = useState("");
	const [assignments, setAssignments] = useState<Record<string, string>>({});
	const [transferredIds, setTransferredIds] = useState<Set<string>>(new Set());

	const totalTransferItems = transferGroups.reduce((count, group) => count + group.items.length, 0);
	const assignedCount = transferredIds.size;
	const allAssigned = totalTransferItems > 0 && assignedCount === totalTransferItems;

	const handleTransfer = (itemId: string) => {
		const recipientEmployeeId = assignments[itemId];
		if (!recipientEmployeeId) return;

		transferMutation.mutate(
			{ assignments: [{ itemId, recipientEmployeeId }] },
			{ onSettled: () => setTransferredIds((prev) => new Set(prev).add(itemId)) }
		);
	};

	const handleApplyToAll = () => {
		if (!bulkRecipient) return;

		const nextAssignments: Record<string, string> = {};
		transferGroups.forEach((group) => {
			group.items.forEach((item) => {
				nextAssignments[item.id] = bulkRecipient;
			});
		});
		setAssignments(nextAssignments);

		transferMutation.mutate(
			{
				assignments: Object.entries(nextAssignments).map(([itemId, recipientEmployeeId]) => ({
					itemId,
					recipientEmployeeId,
				})),
			},
			{ onSettled: () => setTransferredIds(new Set(Object.keys(nextAssignments))) }
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<span className="text-sm font-semibold text-brand-dark">Transfer Progress</span>
				<span className="text-xs text-brand-dark60">
					{assignedCount}/{totalTransferItems} Completed
				</span>
			</div>

			<div className="flex items-center gap-3 rounded-[10px] border border-brand-dark10 bg-[#FFFFFF] p-3">
				<span className="flex-1 text-sm text-brand-dark">Transfer all remaining to</span>
				<SelectField
					placeholder="Select recipient..."
					options={recipientOptions}
					className="w-48"
					value={bulkRecipient}
					onValueChange={setBulkRecipient}
				/>
				<Button
					type="button"
					variant="filled"
					size="sm"
					disabled={!bulkRecipient}
					loading={transferMutation.isPending}
					onClick={handleApplyToAll}
					className="rounded-[6px]"
				>
					Apply to All
				</Button>
			</div>

			<div className="space-y-4">
				{transferGroups.map((group) => (
					<div key={group.category} className="space-y-2">
						<span className="text-xs font-medium text-brand-grey">
							{group.label} ({group.items.length})
						</span>
						{group.items.map((item) => (
							<Card
								key={item.id}
								className="flex items-center gap-3 rounded-[10px] border border-brand-dark10 bg-[#FFFFFF] p-3"
							>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium text-brand-dark">{item.title}</p>
									<p className="truncate text-xs text-brand-grey">{item.subtitle}</p>
								</div>
								<SelectField
									placeholder="Select recipient..."
									options={recipientOptions}
									className="w-48 border border-brand-dark10"
									value={assignments[item.id] ?? ""}
									onValueChange={(value) => setAssignments((prev) => ({ ...prev, [item.id]: value }))}
								/>
								<Button
									type="button"
									variant="filled"
									size="sm"
									disabled={!assignments[item.id] || transferredIds.has(item.id)}
									onClick={() => handleTransfer(item.id)}
									className="rounded-[6px]"
								>
									{transferredIds.has(item.id) ? "Transferred" : "Transfer"}
								</Button>
							</Card>
						))}
					</div>
				))}
			</div>

			<div className="flex justify-end gap-2 pt-2">
				<Button type="button" variant="outline" className="flex-1" onClick={onClose}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="filled"
					className="flex-1"
					disabled={!allAssigned}
					onClick={() =>
						openModal({
							modalTitle: <CardTitle className="text-xl font-semibold">Deactivate {employeeName}?</CardTitle>,
							modalView: (
								<ConfirmDeactivationModal
									employeeName={employeeName}
									transferredCount={totalTransferItems}
									onClose={closeModal}
									onConfirm={() => {
										closeModal();
										onClose();
										onConfirmDeactivate();
									}}
								/>
							),
							variant: "default",
						})
					}
				>
					Transfer & Deactivate
				</Button>
			</div>

			<Modal />
		</div>
	);
};

export default DeactivateUserModal;
