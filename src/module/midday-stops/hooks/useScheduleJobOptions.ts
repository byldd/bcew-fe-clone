import { useMemo } from "react";
import {
	IWeekScheduleResponse,
	QC_JOB_TYPE,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { JOB_PHASE_LABEL } from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";
import { getJobNameBeforeNumber } from "@/lib/utils/schedule";
import { getTodayDate } from "@/lib/utils/date";
import { isAfter } from "date-fns";
import { MDTR_REQUEST_TYPE_OPTIONS } from "@/module/schedule-management/time-requests/utils/constants";

export const useScheduleJobOptions = (
	scheduleJobs: IWeekScheduleResponse | undefined,
	project?: string,
	actrec?: number,
	date?: Date | string
) => {
	const isFutureDate = useMemo(() => {
		const today = getTodayDate();

		if (!date) return false;

		return isAfter(new Date(date), today);
	}, [date]);

	// ---------------- PROJECT OPTIONS ----------------
	const projectOptions = useMemo(() => {
		if (!scheduleJobs?.bcewJobs) return [];

		const projects = scheduleJobs.bcewJobs.map((job) => {
			const name = job.srvinv?.actrec.jobnme || job.schlinExtended?.actrec.jobnme || job.schlin?.actrec.jobnme || "";

			const formatted = getJobNameBeforeNumber(name) || "";

			return { label: formatted, value: formatted };
		});

		return projects.filter(
			(project, index, self) => project.value && index === self.findIndex((t) => t.value === project.value)
		);
	}, [scheduleJobs]);

	// ---------------- JOB OPTIONS ----------------
	const jobOptions = useMemo(() => {
		if (!scheduleJobs?.bcewJobs || !project) return [];

		return scheduleJobs.bcewJobs
			.filter((job) => {
				const name = job.srvinv?.actrec.jobnme || job.schlinExtended?.actrec.jobnme || job.schlin?.actrec.jobnme || "";

				return getJobNameBeforeNumber(name) === project;
			})
			.map((job) => ({
				label: job.srvinv?.actrec.jobnme || job.schlinExtended?.actrec.jobnme || job.schlin?.actrec.jobnme || "",
				value: job.srvinv?.actrec.recnum || job.schlinExtended?.actrec.recnum || job.schlin?.actrec.recnum || "",
			}))
			.filter((option, index, self) => option.value && index === self.findIndex((t) => t.value === option.value));
	}, [scheduleJobs, project]);

	// ---------------- PHASE OPTIONS ----------------
	const taskOptions = useMemo(() => {
		if (!scheduleJobs?.bcewJobs || !actrec) return [];

		const phases = scheduleJobs.bcewJobs.filter(
			(job) =>
				!job.srvinv &&
				(Number(job.schlinExtended?.actrec.recnum) === Number(actrec) ||
					Number(job.schlin?.actrec.recnum) === Number(actrec))
		);

		const base = phases
			.map((job) => ({
				label: job.schlin?.tsknme || "",
				value: job.schlin?.idnum || "",
				bcewSchlinIdnum: job.schlin?.idnum,
				qcType: null,
				bcewSchlinExtendedId: null,
			}))
			.filter((o) => o.value);

		const qcInspection = phases
			.filter((job) => job.schlinExtended?.qc_rdy)
			.map((job) => ({
				label: `${JOB_PHASE_LABEL[job.schlinExtended?.tsknum as keyof typeof JOB_PHASE_LABEL]} QC Inspection`,
				value: `${job.schlinExtended?.id}-${QC_JOB_TYPE.INSPECTION}`,
				qcType: QC_JOB_TYPE.INSPECTION,
				bcewSchlinExtendedId: job.schlinExtended?.id,
			}));

		const qcRepair = phases
			.filter((job) => job.schlinExtended?.qcrcmp)
			.map((job) => ({
				label: `${JOB_PHASE_LABEL[job.schlinExtended?.tsknum as keyof typeof JOB_PHASE_LABEL]} QC Repair`,
				value: `${job.schlinExtended?.id}-${QC_JOB_TYPE.REPAIR}`,
				qcType: QC_JOB_TYPE.REPAIR,
				bcewSchlinExtendedId: job.schlinExtended?.id,
			}));

		return [...base, ...qcInspection, ...qcRepair];
	}, [scheduleJobs, actrec]);

	// ---------------- WORK ORDER OPTIONS ----------------
	const workOrderOptions = useMemo(() => {
		if (!scheduleJobs?.bcewJobs) return [];

		return (
			scheduleJobs.bcewJobs
				//TODO @arjun remove acrtec filter
				// .filter((job) => job.srvinv && Number(job.srvinv?.actrec.recnum) === Number(actrec))
				.filter((job) => job.srvinv)
				.map((job) => ({
					label: `${job?.srvinv?.actrec?.jobnme} (${job.srvinv?.ordnum})`,
					value: job.srvinv?.idnum || "",
				}))
				.filter((o) => o.value)
		);
	}, [scheduleJobs]);

	// ---------------- SPECIAL JOB OPTIONS ----------------
	const specialJobOptions = useMemo(() => {
		return (
			scheduleJobs?.specialJobs?.map((job) => ({
				label: job.name,
				value: job.id,
			})) || []
		)?.filter((spj) => {
			if (!isFutureDate) return true;

			const cleanSPJ = spj.label.replace(/[^a-zA-Z]/g, "").toLowerCase();

			const isNotAllowedForFuture = MDTR_REQUEST_TYPE_OPTIONS?.some((opt) => {
				const cleanOpt = opt.label.replace(/[^a-zA-Z]/g, "").toLowerCase();
				return cleanOpt == cleanSPJ;
			});

			return !isNotAllowedForFuture;
		});
	}, [scheduleJobs, isFutureDate]);

	return {
		projectOptions,
		jobOptions,
		taskOptions,
		workOrderOptions,
		specialJobOptions,
	};
};
