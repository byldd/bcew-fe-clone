import { PULL_LIST_CONFIRMATION } from "@/module/job/material-selection/utils/enums";
import type { MaterialRequestApiRow, MaterialRequestRow, PullListItemImage } from "./types";
import { FALLBACK } from "@/module/job-level-details/constants";
import { normalizePhaseLabel } from "./constants";
import { MATERIAL_REQUEST_TYPE } from "./enums";

export const mapMaterialRequests = (rows: MaterialRequestApiRow[]): MaterialRequestRow[] => {
	const normalizePullListConfirmed = (value: boolean | string | null | undefined) => {
		if (value === true) return PULL_LIST_CONFIRMATION.YES;
		if (value === false) return PULL_LIST_CONFIRMATION.NO;
		if (typeof value === "string") return value;
		return null;
	};

	const mapImages = (images: PullListItemImage[] | null | undefined) => {
		if (!images || images.length === 0) return [];

		return images.map((image) => ({
			id: image.keyFile || image.url,
			url: image.url,
			keyFile: image.keyFile,
		}));
	};

	const getRequestedBy = (row: MaterialRequestApiRow) => {
		return row.user?.name ?? null;
	};

	return rows.flatMap<MaterialRequestRow>((row) => {
		const prospectiveAssigneeNamesByRole = Object.entries(row.prospectiveAssigneesByRole ?? {}).reduce<
			Record<string, string>
		>((acc, [assignRole, user]) => {
			if (user?.name) acc[assignRole] = user.name;
			return acc;
		}, {});

		const baseRow = {
			materialRequestId: row.id,
			jobDailyRecordId: row.jobDailyRecordId,
			requestId: row.requestId,
			date: row.date,
			requestDate: row.date,
			jobId: row.recnum ?? row.jobDailyRecord?.actrec?.recnum ?? null,
			jobName: row.jobName ?? row.jobDailyRecord?.actrec?.jobnme ?? null,
			phaseName: row.jobDailyRecord?.schlin?.tsknme ?? null,
			phaseNumber: row.jobDailyRecord?.schlin?.tsknum ?? null,
			model: row.model ?? null,
			userId: row.userId,
			requestedBy: getRequestedBy(row),
			requestedByDepartment: row.requestedByDepartment ?? null,
			builderName: row.builderName ?? null,
			projectName: row.projectName ?? null,
			isDeliveryOnBCEWTruck: row.isDeliveryOnBCEWTruck ?? null,
			assignTo: row.assignTo ?? null,
			assignToId: row.assignToId ?? null,
			isApproved: row.isApproved ?? null,
			isRejected: row.isRejected ?? null,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			jobDailyRecord: row.jobDailyRecord,
			assigneeIds: [] as string[],
			assigneeNamesByRole: {} as Record<string, string>,
			prospectiveAssigneeNamesByRole,
			typeOfRequest: MATERIAL_REQUEST_TYPE.MATERIAL,
		};

		if (!row.pullListItems || row.pullListItems.length === 0) {
			return [
				{
					...baseRow,
					id: `${row.id}-fallback`,
					partId: FALLBACK,
					name: FALLBACK,
					code: FALLBACK,
					vendor: FALLBACK,
					stockStatus: FALLBACK,
					orders: FALLBACK,
					received: FALLBACK,
					backorder: FALLBACK,
					quantity: FALLBACK,
					reason: FALLBACK,
					referenceId: null,
					workOrderNumber: null,
					pullListConfirmed: null,
					additionalQuantity: null,
					receivedInput: null,
					needed: null,
					note: null,
					approveNote: null,
					rejectNote: null,
					foremanNote: null,
					warehouseManagerNote: null,
					officeNote: null,
					procurementSpecialistNote: null,
					isRejected: null,
					images: [],
				},
			];
		}

		return row.pullListItems.map((item) => {
			const phaseLabel = normalizePhaseLabel(item.phase) || null;
			return {
				...baseRow,
				id: item.id,
				isDeliveryOnBCEWTruck: item.isDeliveryOnBCEWTruck ?? row.isDeliveryOnBCEWTruck ?? null,
				assignTo: item.assignTo ?? row.assignTo ?? null,
				isApproved: item.isApproved ?? row.isApproved ?? null,
				isRejected: item.isRejected ?? row.isRejected ?? null,
				notInPullList: item.notInPullList ?? false,
				phase: phaseLabel,
				phaseName: phaseLabel ?? baseRow.phaseName,
				partId: item.partId ?? FALLBACK,
				name: item.name ?? FALLBACK,
				code: item.code ?? FALLBACK,
				vendor: item.vendor ?? FALLBACK,
				stockStatus: item.stockStatus ?? FALLBACK,
				orders: item.orders ?? FALLBACK,
				received: item.received ?? FALLBACK,
				backorder: item.backorder ?? FALLBACK,
				quantity: item.quantity ?? FALLBACK,
				reason: item.reason ?? FALLBACK,
				referenceId: item.referenceId ?? null,
				workOrderNumber: item.workOrderNumber ?? null,
				pullListConfirmed: normalizePullListConfirmed(item.pullListConfirmed),
				additionalQuantity: item.additionalQuantity ?? null,
				receivedInput: item.receivedInput ?? null,
				needed: item.needed ?? null,
				note: item.note ?? null,
				approveNote: item.approveNote ?? null,
				rejectNote: item.rejectNote ?? null,
				foremanNote: item.foremanNote ?? null,
				warehouseManagerNote: item.warehouseManagerNote ?? null,
				officeNote: item.officeNote ?? null,
				procurementSpecialistNote: item.procurementSpecialistNote ?? null,
				images: mapImages(item.images),
				assignToId: item.assignToId ?? row.assignToId ?? null,
				assigneeIds: (item.assignees ?? []).map((assignee) => assignee.userId),
				assigneeNamesByRole: (item.assignees ?? []).reduce<Record<string, string>>((acc, assignee) => {
					if (assignee.user?.name) acc[assignee.assignedRole] = assignee.user.name;
					return acc;
				}, {}),
			};
		});
	});
};
