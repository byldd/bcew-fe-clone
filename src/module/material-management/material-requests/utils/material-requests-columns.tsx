"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { getMaterialSelectionReasonLabel } from "@/module/job/material-selection/utils";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import type { MaterialRequestColumnsProps, MaterialRequestRow } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectField } from "@/components/ui/selectField";
import AdditionalInformation from "../components/additional-info";
import MaterialRequestNumberPopUp from "../components/material-request-number-popup";
import MaterialRequestHistoryButton from "../components/material-request-history-button";
import MaterialRequestAssignmentCheckbox from "../components/material-request-assignment-checkbox";
import { MATERIAL_REQUEST_ASSIGN_TO, MATERIAL_REQUEST_TYPE } from "./enums";
import { formatDisplayValue } from "@/lib/utils/value-formatter";
import {
	ALL_VALUE,
	BOOLEAN_FILTER_OPTIONS,
	CROSS_ASSIGN_COUNTERPART,
	PHASE_OPTIONS,
	REQUEST_TYPE_FILTER_OPTIONS,
} from "./constants";
import { booleanFilterFn, getRequestTypeFilterValue, requestTypeFilterFn } from ".";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { cn } from "@/lib/utils/utils";
import type { MaterialRequestNoteField } from "./types";
import { SORT_ORDER } from "@/types";

export const useMaterialRequestColumns = (props: MaterialRequestColumnsProps) => {
	const {
		getAssignToValue,
		getDeliveryValue,
		getApprovedValue,
		getRejectedValue,
		onAssignToChange,
		onDeliveryChange,
		onApproveChange,
		onRejectChange,
		onRejectDetailsClick,
		onPhaseChange,
		onNoteAction,
		editableNoteFields,
		isTeamMember = false,
		isForeman = false,
		currentUserId = null,
		userAssignRole = null,
	} = props;

	const isAssignedToCurrentUser = (row: MaterialRequestRow) =>
		Boolean(currentUserId) && row.assignToId === currentUserId;

	const canCrossAssignTo = (row: MaterialRequestRow, targetRole: MATERIAL_REQUEST_ASSIGN_TO) => {
		if (!isTeamMember || !userAssignRole) return false;
		if (CROSS_ASSIGN_COUNTERPART[userAssignRole] !== targetRole) return false;
		return row.assignTo === userAssignRole;
	};

	const SortIcons = ({
		sorted,
		onAsc,
		onDesc,
	}: {
		sorted: false | SORT_ORDER.ASC | SORT_ORDER.DESC;
		onAsc: () => void;
		onDesc: () => void;
	}) => (
		<div className="flex flex-col gap-0">
			<IoMdArrowDropup
				onClick={onAsc}
				className={cn("h-4 w-4 cursor-pointer", sorted === SORT_ORDER.ASC ? "text-brand-dark" : "text-gray-400")}
			/>
			<IoMdArrowDropdown
				onClick={onDesc}
				className={cn("h-4 w-4 cursor-pointer", sorted === SORT_ORDER.DESC ? "text-brand-dark" : "text-gray-400")}
			/>
		</div>
	);

	const SortableHeader = ({ column, label }: { column: Column<MaterialRequestRow, unknown>; label: string }) => (
		<div className="flex items-center justify-center gap-1 font-semibold">
			<span className="text-xs font-semibold text-brand-dark50">{label}</span>
			<SortIcons
				sorted={column.getIsSorted() as false | SORT_ORDER.ASC | SORT_ORDER.DESC}
				onAsc={() => column.toggleSorting(false)}
				onDesc={() => column.toggleSorting(true)}
			/>
		</div>
	);

	const PlainHeader = ({ label }: { label: string }) => (
		<div className="flex items-center justify-center gap-1">
			<span className="text-xs font-semibold text-brand-dark50">{label}</span>
		</div>
	);

	const noteFieldMeta: Record<MaterialRequestNoteField, { label: string; emptyLabel: string }> = {
		approveNote: { label: "Note", emptyLabel: "Add note" },
		foremanNote: { label: "Foreman Note", emptyLabel: "Add note" },
		warehouseManagerNote: { label: "Warehouse Note", emptyLabel: "Add note" },
		officeNote: { label: "Office Note", emptyLabel: "Add note" },
		procurementSpecialistNote: { label: "Procurement Specialist Note", emptyLabel: "Add note" },
	};

	const NoteAction = ({
		value,
		onClick,
		field,
		isRowAssigned = true,
		isMissingItem = false,
	}: {
		value: string | null | undefined;
		field: MaterialRequestNoteField;
		onClick: () => void;
		isRowAssigned?: boolean;
		isMissingItem?: boolean;
	}) => {
		const hasNote = Boolean(value?.trim());
		const meta = noteFieldMeta[field];
		// Team members/foremen may edit only their own note field, and only when
		// the row is assigned to them. Admins (isTeamMember === false) stay editable.
		const isReadOnly = isMissingItem || (isTeamMember && (!editableNoteFields?.includes(field) || !isRowAssigned));

		if (isReadOnly) {
			return (
				<span
					className="block max-w-full truncate text-xs text-brand-dark"
					title={hasNote ? (value ?? undefined) : undefined}
				>
					{hasNote ? value : <span className="text-brand-dark50">--</span>}
				</span>
			);
		}

		return (
			<div className={`flex items-center gap-2 ${hasNote ? "justify-between" : "justify-center"}`}>
				{hasNote && (
					<span
						className="min-w-0 flex-1 truncate text-left text-xs text-brand-dark"
						aria-label={meta.label}
						title={value ?? undefined}
					>
						{value}
					</span>
				)}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-6 w-6 shrink-0 items-center"
					onClick={onClick}
					aria-label={hasNote ? `Update ${meta.label}` : meta.emptyLabel}
					title={hasNote ? `Update ${meta.label}` : meta.emptyLabel}
				>
					{hasNote ? (
						<Pencil className="h-3.5 w-3.5 text-brand-dark50" />
					) : (
						<Plus className="h-3.5 w-3.5 text-brand-dark50" />
					)}
				</Button>
			</div>
		);
	};

	const renderQtyCell = (row: MaterialRequestRow, value: string) =>
		row.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM ? (
			<span className="text-brand-dark50">--</span>
		) : (
			<span>{formatDisplayValue(value)}</span>
		);

	const BooleanFilterHeader = ({
		label,
		column,
		sortable = true,
	}: {
		label: string;
		column: Column<MaterialRequestRow, unknown>;
		sortable?: boolean;
	}) => {
		const rawValue = column.getFilterValue();
		const currentValue = typeof rawValue === "string" ? rawValue : ALL_VALUE;

		return (
			<div className="flex w-full flex-col items-center gap-0 py-0.5">
				<div className="flex items-center gap-1 text-center text-xs font-semibold leading-tight text-brand-dark50">
					{label}
					{sortable && (
						<SortIcons
							sorted={column.getIsSorted() as false | SORT_ORDER.ASC | SORT_ORDER.DESC}
							onAsc={() => column.toggleSorting(false)}
							onDesc={() => column.toggleSorting(true)}
						/>
					)}
				</div>
				<SelectField
					value={currentValue}
					onValueChange={(value) => column.setFilterValue(value === ALL_VALUE ? undefined : value)}
					options={BOOLEAN_FILTER_OPTIONS}
					placeholder="Sort by"
					className="h-5 w-auto rounded-[4px] px-1.5 text-[10px] shadow-sm"
				/>
			</div>
		);
	};

	const SelectFilterHeader = ({
		label,
		column,
		options,
	}: {
		label: string;
		column: Column<MaterialRequestRow, unknown>;
		options: { value: string; label: string }[];
	}) => {
		const rawValue = column.getFilterValue();
		const currentValue = typeof rawValue === "string" ? rawValue : ALL_VALUE;

		return (
			<div className="flex w-full flex-col items-center gap-0 py-0.5">
				<div className="flex items-center gap-1 text-center text-xs font-semibold leading-tight text-brand-dark50">
					{label}
				</div>
				<SelectField
					value={currentValue}
					onValueChange={(value) => column.setFilterValue(value === ALL_VALUE ? undefined : value)}
					options={options}
					placeholder="Sort by"
					className="h-5 w-auto rounded-[4px] px-1.5 text-[10px] shadow-sm"
				/>
			</div>
		);
	};

	const columns: ColumnDef<MaterialRequestRow>[] = [
		{
			id: "approved",
			size: 120,
			enableSorting: false,
			header: ({ column }) => (
				<BooleanFilterHeader label="Approved by Production Manager" column={column} sortable={false} />
			),
			accessorFn: (row) => row.isApproved ?? null,
			filterFn: booleanFilterFn,
			cell: ({ row }) => {
				if (row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM)
					return <span className="text-brand-dark50">--</span>;
				const rowId = row.original.id;
				const checked = getApprovedValue(row.original) === true;
				const currentNote = isForeman ? (row.original.foremanNote ?? null) : (row.original.approveNote ?? null);

				const disabled = isTeamMember;

				return (
					<div className="flex justify-center">
						<Checkbox
							data-testid={`material-request-approved-${rowId}`}
							checked={checked}
							onCheckedChange={() => onApproveChange(rowId, checked, currentNote)}
							aria-label="Approved by production manager"
							disabled={disabled}
						/>
					</div>
				);
			},
		},
		{
			id: "requestType",
			size: 100,
			enableSorting: false,
			header: ({ column }) => (
				<SelectFilterHeader label="Request Type" column={column} options={REQUEST_TYPE_FILTER_OPTIONS} />
			),
			accessorFn: (row) => getRequestTypeFilterValue(row),
			filterFn: requestTypeFilterFn,
			cell: ({ row }) => {
				const value = getRequestTypeFilterValue(row.original);
				const label = REQUEST_TYPE_FILTER_OPTIONS.find((option) => option.value === value)?.label ?? "--";
				return <span className="text-xs text-brand-dark">{label}</span>;
			},
		},
		{
			id: "adminNote",
			size: 110,
			enableSorting: false,
			header: () => <PlainHeader label="Note" />,
			accessorFn: (row) => row.approveNote ?? "",
			cell: ({ row }) => (
				<NoteAction
					field="approveNote"
					value={row.original.approveNote ?? null}
					isRowAssigned={isAssignedToCurrentUser(row.original)}
					isMissingItem={row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM}
					onClick={() => onNoteAction(row.original.id, "approveNote", row.original.approveNote ?? null)}
				/>
			),
		},
		{
			id: "foremanAddress",
			size: 110,
			enableSorting: false,
			header: ({ column }) => <BooleanFilterHeader label="Foreman to Address" column={column} sortable={false} />,
			accessorFn: (row) => row.assignTo === MATERIAL_REQUEST_ASSIGN_TO.FOREMAN,
			filterFn: booleanFilterFn,
			cell: ({ row }) => {
				if (row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM)
					return <span className="text-brand-dark50">--</span>;
				const rowId = row.original.id;
				const assignTo = getAssignToValue(row.original) ?? null;
				const checked = assignTo === MATERIAL_REQUEST_ASSIGN_TO.FOREMAN;

				return (
					<MaterialRequestAssignmentCheckbox
						testId={`material-request-assign-foreman-${rowId}`}
						checked={checked}
						onToggle={() =>
							onAssignToChange(rowId, MATERIAL_REQUEST_ASSIGN_TO.FOREMAN, checked, row.original.foremanNote ?? null)
						}
						ariaLabel="Foreman to address"
						disabled={isForeman ? !(checked && isAssignedToCurrentUser(row.original)) : isTeamMember}
						assigneeName={
							row.original.assigneeNamesByRole[MATERIAL_REQUEST_ASSIGN_TO.FOREMAN] ??
							row.original.prospectiveAssigneeNamesByRole[MATERIAL_REQUEST_ASSIGN_TO.FOREMAN]
						}
					/>
				);
			},
		},
		{
			id: "foremanNote",
			size: 110,
			enableSorting: false,
			header: () => <PlainHeader label="Foreman Note" />,
			accessorFn: (row) => row.foremanNote ?? "",
			cell: ({ row }) => (
				<NoteAction
					field="foremanNote"
					value={row.original.foremanNote ?? null}
					isRowAssigned={isAssignedToCurrentUser(row.original)}
					isMissingItem={row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM}
					onClick={() => onNoteAction(row.original.id, "foremanNote", row.original.foremanNote ?? null)}
				/>
			),
		},
		// ── Role-specific assignment columns ──
		{
			id: "warehouseAddress",
			size: 110,
			enableSorting: false,
			header: ({ column }) => (
				<BooleanFilterHeader label="Warehouse Manager to Address" column={column} sortable={false} />
			),
			accessorFn: (row) => row.assignTo === MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER,
			filterFn: booleanFilterFn,
			cell: ({ row }) => {
				if (row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM)
					return <span className="text-brand-dark50">--</span>;
				const rowId = row.original.id;
				const assignTo = getAssignToValue(row.original) ?? null;
				const checked = assignTo === MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER;

				return (
					<MaterialRequestAssignmentCheckbox
						testId={`material-request-assign-warehouse-${rowId}`}
						checked={checked}
						onToggle={() =>
							onAssignToChange(
								rowId,
								MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER,
								checked,
								row.original.warehouseManagerNote ?? null
							)
						}
						ariaLabel="Warehouse manager to address"
						disabled={isTeamMember && !canCrossAssignTo(row.original, MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER)}
						assigneeName={
							row.original.assigneeNamesByRole[MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER] ??
							row.original.prospectiveAssigneeNamesByRole[MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER]
						}
					/>
				);
			},
		},
		{
			id: "warehouseNote",
			size: 110,
			enableSorting: false,
			header: () => <PlainHeader label="Warehouse Note" />,
			accessorFn: (row) => row.warehouseManagerNote ?? "",
			cell: ({ row }) => (
				<NoteAction
					field="warehouseManagerNote"
					value={row.original.warehouseManagerNote ?? null}
					isRowAssigned={row.original.assignTo === MATERIAL_REQUEST_ASSIGN_TO.WAREHOUSE_MANAGER}
					isMissingItem={row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM}
					onClick={() =>
						onNoteAction(row.original.id, "warehouseManagerNote", row.original.warehouseManagerNote ?? null)
					}
				/>
			),
		},
		{
			id: "officeAddress",
			size: 100,
			enableSorting: false,
			header: ({ column }) => <BooleanFilterHeader label="Office to Address" column={column} sortable={false} />,
			accessorFn: (row) => row.assignTo === MATERIAL_REQUEST_ASSIGN_TO.OFFICE_MANAGER,
			filterFn: booleanFilterFn,
			cell: ({ row }) => {
				if (row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM)
					return <span className="text-brand-dark50">--</span>;
				const rowId = row.original.id;
				const assignTo = getAssignToValue(row.original) ?? null;
				const checked = assignTo === MATERIAL_REQUEST_ASSIGN_TO.OFFICE_MANAGER;

				return (
					<MaterialRequestAssignmentCheckbox
						testId={`material-request-assign-office-${rowId}`}
						checked={checked}
						onToggle={() =>
							onAssignToChange(
								rowId,
								MATERIAL_REQUEST_ASSIGN_TO.OFFICE_MANAGER,
								checked,
								row.original.officeNote ?? null
							)
						}
						ariaLabel="Office to address"
						disabled={isTeamMember}
						assigneeName={
							row.original.assigneeNamesByRole[MATERIAL_REQUEST_ASSIGN_TO.OFFICE_MANAGER] ??
							row.original.prospectiveAssigneeNamesByRole[MATERIAL_REQUEST_ASSIGN_TO.OFFICE_MANAGER]
						}
					/>
				);
			},
		},
		{
			id: "officeNote",
			size: 110,
			enableSorting: false,
			header: () => <PlainHeader label="Office Note" />,
			accessorFn: (row) => row.officeNote ?? "",
			cell: ({ row }) => (
				<NoteAction
					field="officeNote"
					value={row.original.officeNote ?? null}
					isRowAssigned={row.original.assignTo === MATERIAL_REQUEST_ASSIGN_TO.OFFICE_MANAGER}
					isMissingItem={row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM}
					onClick={() => onNoteAction(row.original.id, "officeNote", row.original.officeNote ?? null)}
				/>
			),
		},
		{
			id: "procurementSpecialistAddress",
			size: 110,
			enableSorting: false,
			header: ({ column }) => (
				<BooleanFilterHeader label="Procurement Specialist to Address" column={column} sortable={false} />
			),
			accessorFn: (row) => row.assignTo === MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST,
			filterFn: booleanFilterFn,
			cell: ({ row }) => {
				if (row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM)
					return <span className="text-brand-dark50">--</span>;
				const rowId = row.original.id;
				const assignTo = getAssignToValue(row.original) ?? null;
				const checked = assignTo === MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST;

				return (
					<MaterialRequestAssignmentCheckbox
						testId={`material-request-assign-procurement-${rowId}`}
						checked={checked}
						onToggle={() =>
							onAssignToChange(
								rowId,
								MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST,
								checked,
								row.original.procurementSpecialistNote ?? null
							)
						}
						ariaLabel="Procurement specialist to address"
						disabled={
							isTeamMember && !canCrossAssignTo(row.original, MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST)
						}
						assigneeName={
							row.original.assigneeNamesByRole[MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST] ??
							row.original.prospectiveAssigneeNamesByRole[MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST]
						}
					/>
				);
			},
		},
		{
			id: "procurementSpecialistNote",
			size: 110,
			enableSorting: false,
			header: () => <PlainHeader label="Procurement Specialist Note" />,
			accessorFn: (row) => row.procurementSpecialistNote ?? "",
			cell: ({ row }) => (
				<NoteAction
					field="procurementSpecialistNote"
					value={row.original.procurementSpecialistNote ?? null}
					isRowAssigned={row.original.assignTo === MATERIAL_REQUEST_ASSIGN_TO.PROCUREMENT_SPECIALIST}
					isMissingItem={row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM}
					onClick={() =>
						onNoteAction(row.original.id, "procurementSpecialistNote", row.original.procurementSpecialistNote ?? null)
					}
				/>
			),
		},
		{
			id: "delivery",
			size: 110,
			enableSorting: false,
			header: ({ column }) => <BooleanFilterHeader label="Deliver on BCEW Truck" column={column} sortable={false} />,
			accessorFn: (row) => row.isDeliveryOnBCEWTruck ?? null,
			filterFn: booleanFilterFn,
			cell: ({ row }) => {
				if (row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM)
					return <span className="text-brand-dark50">--</span>;
				const rowId = row.original.id;
				const checked = getDeliveryValue(row.original) === true;

				return (
					<div className="flex justify-center">
						<Checkbox
							data-testid={`material-request-delivery-${rowId}`}
							checked={checked}
							onCheckedChange={(value) => onDeliveryChange(rowId, value === true)}
							aria-label="Deliver on BCEW truck"
							disabled={isTeamMember}
						/>
					</div>
				);
			},
		},
		// ── Job / date / part info ──
		{
			id: "jobId",
			size: 100,
			header: ({ column }) => <SortableHeader column={column} label="Job # (Checked in Materials)" />,
			accessorFn: (row) => row.jobId ?? -Infinity,
			cell: ({ row }) => <span>{formatDisplayValue(row.original.jobId)}</span>,
		},
		{
			id: "jobName",
			size: 150,
			header: ({ column }) => <SortableHeader column={column} label="Job Name (job files)" />,
			accessorFn: (row) => row.jobName ?? "",
			cell: ({ row }) => (
				<span className="block max-w-full truncate" title={row.original.jobName ?? undefined}>
					{formatDisplayValue(row.original.jobName)}
				</span>
			),
		},
		{
			id: "requestDate",
			size: 100,
			header: ({ column }) => <SortableHeader column={column} label="Request Date" />,
			accessorFn: (row) => row.requestDate ?? "",
			cell: ({ row }) => (
				<span>
					{row.original.requestDate ? (
						toFormattedDate(row.original.requestDate, DATE_FORMAT.MM_SLASH_DD_YYYY)
					) : (
						<span className="text-brand-dark50">--</span>
					)}
				</span>
			),
		},
		{
			id: "task",
			size: 130,
			enableSorting: false,
			header: () => <PlainHeader label="Task" />,
			accessorFn: (row) => row.phase ?? row.phaseName ?? "",
			cell: ({ row }) => {
				if (row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM) {
					const phase = row.original.phase ?? row.original.phaseName ?? null;
					return <span className="text-xs">{phase ?? <span className="text-brand-dark50">--</span>}</span>;
				}
				const rowId = row.original.id;
				const reason = row.original.reason ?? "";
				//TODO: handle phase options when reason is jobbing/warranty, remove hardcoded strings
				const reasonDefault = reason === "jobbing" ? "Jobbing" : reason === "warranty" ? "Warranty" : "";
				const currentPhase = row.original.phase ?? row.original.phaseName ?? reasonDefault;
				const phaseOptions = PHASE_OPTIONS.map((option) => ({ value: option, label: option }));

				return (
					<SelectField
						value={currentPhase}
						onValueChange={(value) => onPhaseChange(rowId, value)}
						options={phaseOptions}
						placeholder="Select"
						className="h-6 w-full bg-white text-xs"
						disabled={isTeamMember}
					/>
				);
			},
		},
		{
			id: "partCode",
			size: 75,
			header: ({ column }) => <SortableHeader column={column} label="Part#" />,
			accessorFn: (row) => row.code ?? "",
			cell: ({ row }) => <span>{formatDisplayValue(row.original.code)}</span>,
		},
		{
			id: "partName",
			size: 260,
			header: ({ column }) => <SortableHeader column={column} label="Part Name" />,
			accessorFn: (row) => row.name ?? "",
			cell: ({ row }) => (
				<span className="block max-w-full truncate" title={row.original.name ?? undefined}>
					{formatDisplayValue(row.original.name)}
				</span>
			),
		},
		// ── Reject / Action ──
		{
			id: "reject",
			size: 80,
			enableSorting: false,
			header: ({ column }) => <BooleanFilterHeader label="Reject" column={column} sortable={false} />,
			accessorFn: (row) => row.isRejected ?? null,
			filterFn: booleanFilterFn,
			cell: ({ row }) => {
				const rowId = row.original.id;
				const checked = getRejectedValue(row.original) === true;
				return (
					<div className="flex items-center justify-center gap-1">
						<Checkbox
							data-testid={`material-request-reject-${rowId}`}
							checked={checked}
							onCheckedChange={() => onRejectChange(rowId)}
							aria-label="Reject request"
							disabled={isTeamMember}
						/>
						{!isTeamMember && (
							<Button
								type="button"
								variant="link"
								className="h-auto p-0 text-xs font-normal text-brand-dark underline hover:text-brand-dark/80"
								onClick={() => onRejectDetailsClick(rowId, row.original.rejectNote ?? null)}
							>
								Details
							</Button>
						)}
					</div>
				);
			},
		},
		// ── QTY columns ──
		{
			id: "qtyOrd",
			size: 65,
			header: ({ column }) => <SortableHeader column={column} label="QTY ORD" />,
			accessorFn: (row) => Number(row.orders) || 0,
			cell: ({ row }) => renderQtyCell(row.original, row.original.orders),
		},
		{
			id: "qtyChkd",
			size: 65,
			header: ({ column }) => <SortableHeader column={column} label="QTY CHKD" />,
			accessorFn: (row) => Number(row.received) || 0,
			cell: ({ row }) => renderQtyCell(row.original, row.original.received),
		},
		{
			id: "qtyBord",
			size: 65,
			header: ({ column }) => <SortableHeader column={column} label="QTY BO" />,
			accessorFn: (row) => Number(row.backorder) || 0,
			cell: ({ row }) => renderQtyCell(row.original, row.original.backorder),
		},
		{
			id: "qtyReq",
			size: 65,
			header: ({ column }) => <SortableHeader column={column} label="QTY REQ" />,
			accessorFn: (row) => Number(row.quantity) || 0,
			cell: ({ row }) => renderQtyCell(row.original, row.original.quantity),
		},
		// ── Reason / description / extras ──
		{
			id: "reason",
			size: 260,
			enableSorting: false,
			header: () => <PlainHeader label="Reason" />,
			accessorFn: (row) => row.reason ?? "",
			cell: ({ row }) => {
				const text =
					row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM
						? row.original.reason
						: getMaterialSelectionReasonLabel(row.original.reason);
				return (
					<span className="block max-w-full truncate" title={text ?? undefined}>
						{text ?? <span className="text-brand-dark50">--</span>}
					</span>
				);
			},
		},
		{
			id: "reasonDescription",
			size: 260,
			enableSorting: false,
			header: () => <PlainHeader label="Reason Description" />,
			accessorFn: (row) => row.note ?? "",
			cell: ({ row }) => (
				<div className="flex items-center justify-center gap-2">
					<span className="block max-w-full truncate text-xs text-brand-dark" title={row.original.note ?? undefined}>
						{formatDisplayValue(row.original.note)}
					</span>
				</div>
			),
		},
		{
			id: "additionalInfo",
			size: 160,
			enableSorting: false,
			header: "Additional Information",
			cell: ({ row }) => (
				<div className="flex items-center justify-center gap-2">
					<AdditionalInformation row={row.original} />
				</div>
			),
		},
		{
			id: "model",
			size: 260,
			header: ({ column }) => <SortableHeader column={column} label="Model" />,
			accessorFn: (row) => row.model ?? "",
			cell: ({ row }) => (
				<span className="block max-w-full truncate" title={row.original.model ?? undefined}>
					{formatDisplayValue(row.original.model)}
				</span>
			),
		},
		{
			id: "requestedBy",
			size: 110,
			header: ({ column }) => <SortableHeader column={column} label="Requested By" />,
			accessorFn: (row) => row.requestedBy ?? "",
			cell: ({ row }) => (
				<span className="block max-w-full truncate" title={row.original.requestedBy ?? undefined}>
					{formatDisplayValue(row.original.requestedBy)}
				</span>
			),
		},
		{
			id: "requestId",
			size: 90,
			header: ({ column }) => <SortableHeader column={column} label="Request#" />,
			accessorFn: (row) => row.requestId ?? 0,
			cell: ({ row }) => {
				if (row.original.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM) {
					return <span className="flex justify-center text-xs">UI-{row.original.requestId}</span>;
				}
				return (
					<span id={`mr-${row.original.requestId}`} className="flex items-center justify-center gap-1.5">
						<MaterialRequestNumberPopUp requestId={row.original.requestId} />
						<MaterialRequestHistoryButton requestId={row.original.requestId} />
					</span>
				);
			},
		},
	];

	return columns;
};
