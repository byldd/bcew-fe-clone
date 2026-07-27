import { BUILDER_COMMS_PHASE_TYPE } from "@/module/builder-communication/types";
import { SchedulePhaseFilterKey } from "../utils/types";

const COLLAPSED_IMAGE_COUNT = 4;
const JOB_HIERARCHY_LIMIT = 15;
const FALLBACK = "--";
const WORK_ORDER_TAB_KEY = BUILDER_COMMS_PHASE_TYPE.WORK_ORDER;

const SCHEDULE_PHASE_FILTERS: { key: SchedulePhaseFilterKey; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "slabRough", label: "Slab Rough" },
	{ key: "service", label: "Service" },
	{ key: "rough", label: "Rough" },
	{ key: "final", label: "Final" },
	{ key: "secondHit", label: "Second Hit" },
];

export { COLLAPSED_IMAGE_COUNT, JOB_HIERARCHY_LIMIT, FALLBACK, WORK_ORDER_TAB_KEY, SCHEDULE_PHASE_FILTERS };
