"use client";

import { TRUE_FALSE } from "@/utils/enums";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { SCHEDULE_DOWNLOAD_MODAL_TYPE } from "../modals/enum";
import { addDays } from "date-fns";

type ScheduleParams = {
	startDate: Date;
	endDate: Date;
	builder: string;
	departmentId: string;
	labelIds?: string[];
	withAssignments?: boolean;
	startInRange?: boolean;
	active?: boolean;
	completed?: boolean;
	stopNotInSequence?: boolean;
	teamId?: string;
	pdf?: boolean;
	pdfType?: SCHEDULE_DOWNLOAD_MODAL_TYPE;
	subcontractorCrewId?: string;
	crewLeaderId?: string;
	search?: string;
};

const scheduleParamsKey = {
	startDate: "startDate",
	endDate: "endDate",
	builder: "builder",
	departmentId: "departmentId",
	labelIds: "labelIds",
	withAssignments: "withAssignments",
	startInRange: "startInRange",
	active: "active",
	completed: "completed",
	stopNotInSequence: "stopNotInSequence",
	teamId: "teamId",
	pdf: "pdf",
	pdfType: "pdfType",
	subcontractorCrewId: "subcontractorCrewId",
	crewLeaderId: "crewLeaderId",
	search: "search",
};

export const useScheduleParams = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const { effectiveStartDate, effectiveEndDate } = useMemo(() => {
		const today = new Date();
		const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

		const paramStartDate = searchParams.get(scheduleParamsKey.startDate);
		const derivedStartDate = paramStartDate ? new Date(paramStartDate) : normalizedToday;

		const paramEndDate = searchParams.get(scheduleParamsKey.endDate);

		const derivedEndDate = paramEndDate ? new Date(paramEndDate) : addDays(derivedStartDate, 9);

		return { effectiveStartDate: derivedStartDate, effectiveEndDate: derivedEndDate };
	}, [searchParams]);

	const getParams = (): ScheduleParams => {
		return {
			startDate: effectiveStartDate,
			endDate: effectiveEndDate,
			builder: searchParams.get(scheduleParamsKey.builder) || "",
			departmentId: searchParams.get(scheduleParamsKey.departmentId) || "",
			labelIds: searchParams.get(scheduleParamsKey.labelIds)
				? searchParams.get(scheduleParamsKey.labelIds)?.split(",")
				: [],
			withAssignments: searchParams.get(scheduleParamsKey.withAssignments)
				? searchParams.get(scheduleParamsKey.withAssignments) === TRUE_FALSE?.TRUE
				: true,
			startInRange: searchParams.get(scheduleParamsKey.startInRange)
				? searchParams.get(scheduleParamsKey.startInRange) === TRUE_FALSE?.TRUE
				: true,
			active: searchParams.get(scheduleParamsKey.active)
				? searchParams.get(scheduleParamsKey.active) === TRUE_FALSE?.TRUE
				: true,
			completed: searchParams.get(scheduleParamsKey.completed)
				? searchParams.get(scheduleParamsKey.completed) === TRUE_FALSE.TRUE
				: false,
			stopNotInSequence: searchParams.get(scheduleParamsKey.stopNotInSequence)
				? searchParams.get(scheduleParamsKey.stopNotInSequence) === TRUE_FALSE?.TRUE
				: false,
			teamId: searchParams.get(scheduleParamsKey.teamId) || "",
			pdf: searchParams.get(scheduleParamsKey.pdf) === TRUE_FALSE?.TRUE,
			pdfType: searchParams.get(scheduleParamsKey.pdfType) as SCHEDULE_DOWNLOAD_MODAL_TYPE | undefined,
			subcontractorCrewId: searchParams.get(scheduleParamsKey.subcontractorCrewId) || "",
			crewLeaderId: searchParams.get(scheduleParamsKey.crewLeaderId) || "",
			search: searchParams.get(scheduleParamsKey.search) || "",
		};
	};

	const setParams = (params: Partial<ScheduleParams>, persistPreviousParams = true) => {
		const newParams = new URLSearchParams();
		const previous = getParams();

		if (persistPreviousParams) {
			Object.entries(previous).forEach(([key, value]) => {
				if (value !== undefined && value !== null)
					newParams.set(scheduleParamsKey[key as keyof typeof scheduleParamsKey], value.toString());
			});
		}

		if (params.startDate !== undefined) {
			newParams.set(scheduleParamsKey.startDate, params.startDate.toString());
			const endDate = addDays(params.startDate, 9);
			newParams.set(scheduleParamsKey.endDate, endDate.toString());
		}

		if (params.builder !== undefined) {
			newParams.set(scheduleParamsKey.builder, params.builder.toString());
		}
		if (params.departmentId !== undefined) {
			newParams.set(scheduleParamsKey.departmentId, params.departmentId.toString());
		}
		if (params.labelIds !== undefined) {
			newParams.set(scheduleParamsKey.labelIds, params.labelIds.toString());
		}
		if (params.withAssignments !== undefined) {
			newParams.set(scheduleParamsKey.withAssignments, params.withAssignments.toString());
		}
		if (params.startInRange !== undefined) {
			newParams.set(scheduleParamsKey.startInRange, params.startInRange.toString());
		}
		if (params.active !== undefined) {
			newParams.set(scheduleParamsKey.active, params.active.toString());
		}
		if (params.completed !== undefined) {
			newParams.set(scheduleParamsKey.completed, params.completed.toString());
		}
		if (params.stopNotInSequence !== undefined) {
			newParams.set(scheduleParamsKey.stopNotInSequence, params.stopNotInSequence.toString());
		}

		if (params.subcontractorCrewId !== undefined) {
			newParams.set(scheduleParamsKey.subcontractorCrewId, params.subcontractorCrewId.toString());
		}

		if (params.crewLeaderId !== undefined) {
			newParams.set(scheduleParamsKey.crewLeaderId, params.crewLeaderId.toString());
		}

		if (params.teamId !== undefined) {
			newParams.set(scheduleParamsKey.teamId, params.teamId.toString());
		}

		newParams.delete(scheduleParamsKey.search);

		router.replace(`?${newParams.toString()}`, { scroll: false });
	};

	const clearParams = () => {
		router.replace(`?`, { scroll: false });
	};

	return { getParams, setParams, clearParams };
};
