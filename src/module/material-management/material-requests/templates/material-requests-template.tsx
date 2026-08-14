"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	useMaterialRequests,
	useUpdateMaterialRequest,
	useUpdateMaterialRequestNote,
	useUpdateForemanMaterialRequestNote,
	useReassignForemanMaterialRequest,
	useAssignMaterialRequest,
	useUpdateTeamMaterialRequestNote,
} from "../hooks/useMaterialRequests";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useMaterialRequestColumns } from "../utils/material-requests-columns";
import { mapMaterialRequests } from "../utils/map-material-requests";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import type {
	MaterialRequestFiltersState,
	MaterialRequestParamsInput,
	MaterialRequestRow,
	MaterialRequestNoteField,
	MaterialRequestUpdatePayload,
} from "../utils/types";
import { dateToUTCString } from "@/lib/utils/date";
import MaterialRequestFilters from "../components/material-request-filters";
import MaterialRequestLegend from "../components/material-request-legend";
import { useMaterialRequestParams } from "../hooks/useMaterialRequestParams";
import {
	applyMaterialRequestFilters,
	getMaterialRequestHiddenColumns,
	noteFieldByAssignment,
	titleByAssignment,
} from "../utils";
import { useModal } from "@/hooks/useModal";
import MaterialRequestAssignmentModal from "../components/material-request-assignment-modal";
import MaterialRequestApprovalModal from "../components/material-request-approval-modal";
import MaterialRequestNoteModal from "../components/material-request-note-modal";
import MaterialRequestForemanReassignModal from "../components/material-request-foreman-approval-modal";
import useAuthStore from "@/store/auth-store";
import { E_ROLES } from "@/utils/enums";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/shared/section-header";
import BackButton from "@/components/common/back-button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
	MATERIAL_REQUEST_ASSIGN_TO,
	MATERIAL_REQUEST_FILTER_TYPE,
	MATERIAL_REQUEST_NOTE_MODE,
	MATERIAL_REQUEST_TYPE,
	MATERIAL_REQUEST_VIEW_MODE,
} from "../utils/enums";
import { MATERIAL_ROLE_TO_ASSIGN } from "../utils/constants";

export default function MaterialRequestsTemplate({
	showBackButton = false,
	hideHeader = false,
}: {
	showBackButton?: boolean;
	hideHeader?: boolean;
}) {
	const { user } = useAuthStore((state) => state);
	const isForeman = user ? user.role?.name?.toLowerCase() === E_ROLES.FOREMAN.toLowerCase() : undefined;
	const isMaterialRequestAllowed = user?.isMaterialRequestAllowed ?? false;
	const teamName = user?.team?.name ?? null;
	const hiddenColumns = getMaterialRequestHiddenColumns(isForeman ?? false, isMaterialRequestAllowed, teamName);

	if (hiddenColumns === null)
		return (
			<div className="flex h-screen w-full items-center justify-center text-red-500">
				You do not have access to this page
			</div>
		);
	return (
		<MaterialRequestsAllView
			isForeman={isForeman}
			isMaterialRequestAllowed={isMaterialRequestAllowed}
			hiddenColumns={hiddenColumns}
			showBackButton={showBackButton}
			hideHeader={hideHeader}
		/>
	);
}

function MaterialRequestsAllView({
	isForeman,
	isMaterialRequestAllowed,
	hiddenColumns,
	showBackButton,
	hideHeader,
}: {
	isForeman: boolean | undefined;
	isMaterialRequestAllowed: boolean;
	hiddenColumns: Set<string>;
	showBackButton?: boolean;
	hideHeader?: boolean;
}) {
	const { user } = useAuthStore((state) => state);
	const userAssignRole = user?.materialRole ? (MATERIAL_ROLE_TO_ASSIGN[user.materialRole] ?? null) : null;

	const editableNoteFields: MaterialRequestNoteField[] | null = useMemo(() => {
		if (isForeman) return ["foremanNote"];
		const ownNoteField = userAssignRole ? noteFieldByAssignment[userAssignRole] : null;
		return ownNoteField ? [ownNoteField] : null;
	}, [isForeman, userAssignRole]);

	const isRestrictedEditor = Boolean(isForeman) || isMaterialRequestAllowed;
	const isMaterialTeamMember = isMaterialRequestAllowed && !isForeman;

	const { getParams, setParams } = useMaterialRequestParams();
	const { startDate, endDate, ...filters } = getParams();

	const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
	const { openModal, closeModal, Modal } = useModal();

	const [foremanViewMode, setForemanViewMode] = useState<MATERIAL_REQUEST_VIEW_MODE>(MATERIAL_REQUEST_VIEW_MODE.ALL);
	const [keywordInput, setKeywordInput] = useState(filters.keywordFilter ?? "");
	const debouncedKeyword = useDebounce(keywordInput, 400);

	useEffect(() => {
		setKeywordInput(filters.keywordFilter ?? "");
	}, [filters.keywordFilter]);

	const { data, isLoading } = useMaterialRequests({
		startDate: startDate ? dateToUTCString(startDate) : undefined,
		endDate: endDate ? dateToUTCString(endDate) : undefined,
		isForeman,
		isMaterialRequestAllowed,
	});

	const { mutate: updateRequestMutation } = useUpdateMaterialRequest();
	const { mutate: updateRequestNoteMutation } = useUpdateMaterialRequestNote();
	const { mutate: updateForemanNoteMutation } = useUpdateForemanMaterialRequestNote();
	const { mutateAsync: reassignForemanAsync } = useReassignForemanMaterialRequest();
	const { mutate: assignMaterialRequestMutation } = useAssignMaterialRequest();
	const { mutate: updateTeamNoteMutation } = useUpdateTeamMaterialRequestNote();

	const rows = useMemo(() => mapMaterialRequests(data ?? []), [data]);

	const filteredRows = useMemo(() => {
		// Only the foreman sees missing-item requests; every other role (admin
		// included) is scoped to material requests only.
		const scopedRows = isForeman
			? rows
			: rows.filter((row) => row.typeOfRequest !== MATERIAL_REQUEST_TYPE.MISSING_ITEM);
		let filtered = applyMaterialRequestFilters(scopedRows, filters);

		if (startDate) {
			const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
			const end = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : start;
			filtered = filtered.filter((row) => {
				if (!row.requestDate) return true;
				const d = new Date(row.requestDate);
				const rowDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
				return rowDay >= start && rowDay <= end;
			});
		}

		if (foremanViewMode === MATERIAL_REQUEST_VIEW_MODE.MY_REQUESTS) {
			const currentUserId = user?.id;
			if (currentUserId) {
				return filtered.filter((row) => {
					// Missing-item requests belong to the foreman they were assigned to.
					if (row.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM) {
						return row.missingItemForemanId === currentUserId;
					}
					return (
						(row.assigneeIds.includes(currentUserId) || row.assignToId === currentUserId) &&
						row.isApproved !== true &&
						row.isRejected !== true
					);
				});
			}
		}
		return filtered;
	}, [rows, filters, startDate, endDate, foremanViewMode, user?.id, isForeman]);

	const getAssignToValue = (row: MaterialRequestRow) => row.assignTo ?? null;
	const getDeliveryValue = (row: MaterialRequestRow) => row.isDeliveryOnBCEWTruck ?? null;
	const getApprovedValue = (row: MaterialRequestRow) => row.isApproved ?? null;
	const getRejectedValue = (row: MaterialRequestRow) => row.isRejected ?? null;
	const getNoteLabel = (currentNote?: string | null) =>
		currentNote?.trim() ? "Update note (Optional)" : "Any specific note (Optional)";

	const openApprovalModal = ({
		rowId,
		title,
		confirmLabel,
		noteLabel,
		initialValue,
		payload,
		successMessage,
		requireNote,
	}: {
		rowId: string;
		title: string;
		confirmLabel: string;
		noteLabel?: string;
		initialValue?: string | null;
		payload: (note: string) => MaterialRequestUpdatePayload;
		successMessage: string;
		requireNote?: boolean;
	}) => {
		openModal({
			modalTitle: title,
			modalView: (
				<MaterialRequestApprovalModal
					confirmLabel={confirmLabel}
					noteLabel={noteLabel}
					initialValue={initialValue}
					requireNote={requireNote}
					onCancel={closeModal}
					onConfirm={(note) => {
						const noteValue = note.trim();
						updateRequestMutation(
							{
								pullListItemId: rowId,
								payload: payload(noteValue),
							},
							{
								onSuccess: () => {
									openSuccessToast(successMessage);
									closeModal();
								},
								onError: (error) => openErrorToast({ error }),
							}
						);
					}}
				/>
			),
		});
	};

	const openAssignmentModal = ({
		title,
		confirmLabel,
		noteLabel,
		initialValue,
		onSubmit,
	}: {
		title: string;
		confirmLabel: string;
		noteLabel?: string;
		initialValue?: string | null;
		onSubmit: (note: string) => void;
	}) => {
		openModal({
			modalTitle: title,
			modalView: (
				<MaterialRequestAssignmentModal
					confirmLabel={confirmLabel}
					noteLabel={noteLabel}
					initialValue={initialValue}
					onCancel={closeModal}
					onConfirm={(note) => onSubmit(note.trim())}
				/>
			),
		});
	};

	const openNoteModal = ({
		rowId,
		mode,
		field,
		initialValue,
		successMessage,
	}: {
		rowId: string;
		mode: MATERIAL_REQUEST_NOTE_MODE;
		field: string;
		initialValue?: string | null;
		successMessage: string;
	}) => {
		openModal({
			modalTitle: mode === MATERIAL_REQUEST_NOTE_MODE.UPDATE ? "Update Note" : "Add Note",
			modalView: (
				<MaterialRequestNoteModal
					mode={mode}
					initialValue={initialValue}
					onCancel={closeModal}
					onSubmit={(note) => {
						const noteValue = note.trim();
						// Team members have no admin-module access; their own note goes
						// through the foreman endpoint (which derives the field server-side).
						if (isMaterialTeamMember) {
							updateTeamNoteMutation(
								{ pullListItemId: rowId, note: noteValue || null },
								{
									onSuccess: () => {
										openSuccessToast(successMessage);
										closeModal();
									},
									onError: (error) => openErrorToast({ error }),
								}
							);
							return;
						}
						updateRequestNoteMutation(
							{
								pullListItemId: rowId,
								field,
								note: noteValue || null,
							},
							{
								onSuccess: () => {
									openSuccessToast(successMessage);
									closeModal();
								},
								onError: (error) => openErrorToast({ error }),
							}
						);
					}}
				/>
			),
		});
	};

	const handleNoteAction = (rowId: string, field: MaterialRequestNoteField, currentNote?: string | null) => {
		if (isForeman) {
			if (field !== "foremanNote") return;
			const mode = currentNote?.trim() ? MATERIAL_REQUEST_NOTE_MODE.UPDATE : MATERIAL_REQUEST_NOTE_MODE.ADD;
			openModal({
				modalTitle: mode === MATERIAL_REQUEST_NOTE_MODE.UPDATE ? "Update Note" : "Add Note",
				modalView: (
					<MaterialRequestNoteModal
						mode={mode}
						initialValue={currentNote ?? null}
						onCancel={closeModal}
						onSubmit={(note) => {
							updateForemanNoteMutation(
								{ pullListItemId: rowId, note: note.trim() || null },
								{
									onSuccess: () => {
										openSuccessToast(mode === MATERIAL_REQUEST_NOTE_MODE.UPDATE ? "Note updated." : "Note added.");
										closeModal();
									},
									onError: (error) => openErrorToast({ error }),
								}
							);
						}}
					/>
				),
			});
			return;
		}

		const mode = currentNote?.trim() ? MATERIAL_REQUEST_NOTE_MODE.UPDATE : MATERIAL_REQUEST_NOTE_MODE.ADD;
		const successMsg = mode === MATERIAL_REQUEST_NOTE_MODE.UPDATE ? "Note updated." : "Note added.";

		openNoteModal({
			rowId,
			mode,
			field,
			initialValue: currentNote ?? null,
			successMessage: successMsg,
		});
	};

	const handleAssignToChange = (
		rowId: string,
		value: string | null,
		isCurrentlyAssigned: boolean,
		currentNote?: string | null
	) => {
		if (!value) return;

		const noteField = noteFieldByAssignment[value];

		if (isForeman && value === MATERIAL_REQUEST_ASSIGN_TO.FOREMAN && isCurrentlyAssigned) {
			openModal({
				modalTitle: "Reassign Request to Production Manager",
				modalView: (
					<MaterialRequestForemanReassignModal
						onCancel={closeModal}
						onConfirm={async (note) => {
							try {
								await reassignForemanAsync({ pullListItemId: rowId, note });
								openSuccessToast("Request reassigned to Admin.");
								closeModal();
							} catch (error) {
								openErrorToast({ error: error as Error });
							}
						}}
					/>
				),
			});
			return;
		}

		if (isMaterialTeamMember) {
			openAssignmentModal({
				title: titleByAssignment[value] ?? "Assign Request",
				confirmLabel: "Assign Now",
				noteLabel: getNoteLabel(currentNote),
				initialValue: currentNote ?? null,
				onSubmit: (note) => {
					assignMaterialRequestMutation(
						{ pullListItemId: rowId, assignTo: value, note: note || null },
						{
							onSuccess: () => {
								openSuccessToast("Assignment updated.");
								closeModal();
							},
							onError: (error) => openErrorToast({ error }),
						}
					);
				},
			});
			return;
		}

		if (isCurrentlyAssigned) {
			updateRequestMutation(
				{
					pullListItemId: rowId,
					payload: {
						assignTo: null,
						isApproved: null,
						isRejected: null,
						...(noteField ? { [noteField]: null } : {}),
					},
				},
				{
					onSuccess: () => {
						openSuccessToast("Assignment removed.");
					},
					onError: (error) => openErrorToast({ error }),
				}
			);
		} else {
			openAssignmentModal({
				title: titleByAssignment[value] ?? "Assign Request",
				confirmLabel: "Assign Now",
				noteLabel: getNoteLabel(currentNote),
				initialValue: currentNote ?? null,
				onSubmit: (note) => {
					updateRequestMutation(
						{
							pullListItemId: rowId,
							payload: {
								assignTo: value,
								isApproved: null,
								isRejected: null,
								...(noteField ? { [noteField]: note || null } : {}),
							},
						},
						{
							onSuccess: () => {
								openSuccessToast("Assignment updated.");
								closeModal();
							},
							onError: (error) => openErrorToast({ error }),
						}
					);
				},
			});
		}
	};

	const handleDeliveryChange = (rowId: string, value: boolean) => {
		updateRequestMutation(
			{ pullListItemId: rowId, payload: { isDeliveryOnBCEWTruck: value } },
			{
				onSuccess: () => {
					openSuccessToast("Delivery updated.");
				},
				onError: (error) => openErrorToast({ error }),
			}
		);
	};

	const handleApproveChange = (rowId: string, isCurrentlyApproved: boolean, currentNote?: string | null) => {
		if (isCurrentlyApproved) {
			updateRequestMutation(
				{
					pullListItemId: rowId,
					payload: {
						isApproved: false,
						approveNote: null,
					},
				},
				{
					onSuccess: () => {
						openSuccessToast("Approval removed.");
					},
					onError: (error) => openErrorToast({ error }),
				}
			);
		} else {
			openApprovalModal({
				rowId,
				title: "Approve Material Request",
				confirmLabel: "Confirm Approval",
				noteLabel: getNoteLabel(currentNote),
				initialValue: currentNote ?? null,
				successMessage: "Approval updated.",
				payload: (note) => ({
					isApproved: true,
					isRejected: false,
					assignTo: null,
					approveNote: note || null,
				}),
			});
		}
	};

	const handleRejectChange = (rowId: string) => {
		openApprovalModal({
			rowId,
			title: "Reject Material Request",
			confirmLabel: "Confirm Rejection",
			noteLabel: "Reason (Required)",
			requireNote: true,
			successMessage: "Rejection updated.",
			payload: (note) => ({
				isApproved: false,
				isRejected: true,
				rejectNote: note || null,
			}),
		});
	};

	const handleRejectDetailsClick = (rowId: string, rejectNote?: string | null) => {
		openModal({
			modalTitle: "Reject Details",
			modalView: (
				<div className="space-y-6 pb-1">
					<div className="flex flex-col gap-2">
						<span className="text-[15px] font-normal text-brand-dark50">Reject Reason</span>
						<div className="min-h-[140px] w-full whitespace-pre-wrap break-words rounded-[12px] bg-brand-bgLightgrey p-4 text-[15px] text-brand-dark">
							{rejectNote?.trim() ? rejectNote : "--"}
						</div>
					</div>
					<div className="flex gap-4 pt-1">
						<Button
							type="button"
							variant="filled"
							className="h-12 w-full rounded-[12px] text-base font-medium"
							onClick={closeModal}
						>
							Close
						</Button>
					</div>
				</div>
			),
		});
	};

	const handlePhaseChange = (rowId: string, value: string) => {
		updateRequestMutation(
			{ pullListItemId: rowId, payload: { phase: value } },
			{
				onSuccess: () => {
					openSuccessToast("Task updated.");
				},
				onError: (error) => openErrorToast({ error }),
			}
		);
	};

	const handleDateRangeChange = (nextStart: Date | null, nextEnd: Date | null) => {
		setParams({ startDate: nextStart, endDate: nextEnd, requestNumberFilter: null });
	};

	const handleFilterChange = useCallback(
		(key: keyof MaterialRequestFiltersState, value: string) => {
			const normalizedValue = value.trim();
			const params: MaterialRequestParamsInput = { [key]: normalizedValue.length > 0 ? normalizedValue : null };
			if (key !== "requestNumberFilter") {
				params.requestNumberFilter = null;
			}
			setParams(params);
		},
		[setParams]
	);

	useEffect(() => {
		if (debouncedKeyword !== filters.keywordFilter) {
			handleFilterChange(MATERIAL_REQUEST_FILTER_TYPE.KEYWORD_FILTER, debouncedKeyword);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedKeyword]);

	const handleForemanViewModeChange = useCallback(
		(mode: MATERIAL_REQUEST_VIEW_MODE) => {
			setParams({ requestNumberFilter: null });
			setForemanViewMode(mode);
		},
		[setParams]
	);

	const handleResetFilters = () => {
		setParams({
			startDate: null,
			endDate: null,
			requestNumberFilter: null,
			keywordFilter: null,
			phaseFilter: null,
			jobFilter: null,
			jobNumberFilter: null,
			builderFilter: null,
			projectFilter: null,
			modelFilter: null,
			departmentFilter: null,
			partCodeFilter: null,
			partNameFilter: null,
			reasonFilter: null,
			requestedByFilter: null,
		});
	};

	const handleApplySavedView = useCallback(
		(viewId: string, viewFilters: MaterialRequestFiltersState) => {
			setParams({
				requestNumberFilter: viewFilters.requestNumberFilter || null,
				keywordFilter: viewFilters.keywordFilter || null,
				phaseFilter: viewFilters.phaseFilter || null,
				jobFilter: viewFilters.jobFilter || null,
				jobNumberFilter: viewFilters.jobNumberFilter || null,
				builderFilter: viewFilters.builderFilter || null,
				projectFilter: viewFilters.projectFilter || null,
				modelFilter: viewFilters.modelFilter || null,
				departmentFilter: viewFilters.departmentFilter || null,
				partCodeFilter: viewFilters.partCodeFilter || null,
				partNameFilter: viewFilters.partNameFilter || null,
				reasonFilter: viewFilters.reasonFilter || null,
				requestedByFilter: viewFilters.requestedByFilter || null,
			});
		},
		[setParams]
	);

	const baseColumns = useMaterialRequestColumns({
		getAssignToValue,
		getDeliveryValue,
		getApprovedValue,
		getRejectedValue,
		onAssignToChange: handleAssignToChange,
		onDeliveryChange: handleDeliveryChange,
		onApproveChange: handleApproveChange,
		onRejectChange: handleRejectChange,
		onRejectDetailsClick: handleRejectDetailsClick,
		onPhaseChange: handlePhaseChange,
		onNoteAction: handleNoteAction,
		editableNoteFields,
		isForeman: isForeman ?? false,
		currentUserId: user?.id ?? null,
		userAssignRole,
		isTeamMember: isRestrictedEditor,
	});

	const filteredBaseColumns = useMemo(() => {
		if (!hiddenColumns || hiddenColumns.size === 0) return baseColumns;
		return baseColumns.filter((column) => (column.id ? !hiddenColumns.has(column.id) : true));
	}, [baseColumns, hiddenColumns]);

	const columnOptions = useMemo(
		() =>
			filteredBaseColumns
				.filter((column) => !!column.id)
				.map((column) => ({
					id: column.id as string,
					label: typeof column.header === "string" ? column.header : (column.id as string),
				})),
		[filteredBaseColumns]
	);

	const handleToggleColumn = (columnId: string) => {
		setColumnVisibility((prev) => ({
			...prev,
			[columnId]: prev[columnId] === false,
		}));
	};

	const columns = useMemo(
		() => filteredBaseColumns.filter((column) => (column.id ? columnVisibility[column.id] !== false : true)),
		[filteredBaseColumns, columnVisibility]
	);

	return (
		<div className="w-full space-y-4 bg-white px-2 py-4">
			<Modal />

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				{!hideHeader && (
					<div className="flex items-center gap-2">
						{showBackButton && <BackButton />}
						<SectionHeader title="Material Review" />
					</div>
				)}

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
					<MaterialRequestLegend isForeman={isForeman} />
					<Input
						value={keywordInput}
						onChange={(e) => setKeywordInput(e.target.value)}
						placeholder="Search by job, part, model or request#"
						className="h-10 w-full text-sm sm:w-[360px]"
						icon={<Search className="h-4 w-4 text-brand-dark50" />}
						iconPosition="left"
					/>
				</div>
			</div>

			<MaterialRequestFilters
				startDate={startDate}
				endDate={endDate}
				onDateRangeChange={handleDateRangeChange}
				filters={filters}
				onFilterChange={handleFilterChange}
				onResetFilters={handleResetFilters}
				rows={rows}
				columnOptions={columnOptions}
				columnVisibility={columnVisibility}
				onToggleColumn={handleToggleColumn}
				onApplySavedView={handleApplySavedView}
				isForeman={isForeman}
				showViewModeTabs={isMaterialRequestAllowed && !isForeman}
				foremanViewMode={foremanViewMode}
				onForemanViewModeChange={handleForemanViewModeChange}
			/>

			<DataTable
				columns={columns}
				data={filteredRows}
				isLoading={isLoading}
				useSectionHeader={false}
				showGridLines
				stickyHeaderMode
				compact
				enableSorting
				rowClassName={(row) => {
					if (row.typeOfRequest === MATERIAL_REQUEST_TYPE.MISSING_ITEM) {
						return "bg-yellow-50 hover:bg-yellow-100 [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-amber-400";
					}
					if (row.notInPullList) {
						return "bg-blue-50 hover:bg-blue-100 [&>td:first-child]:border-l-4 [&>td:first-child]:border-l-blue-600";
					}
					return "hover:bg-gray-50";
				}}
			/>
			<Modal />
		</div>
	);
}
