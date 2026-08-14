import { JOB_PHASE_LABEL_NUM } from "@/module/schedule-management/weekly-schedule-management/constants/week-schedule";

const getPhaseNumberByName = (phaseName: string): number | null => {
	// return number or null
	return (
		Object.entries(JOB_PHASE_LABEL_NUM).find(([key]) => key.toLowerCase() === phaseName.toLowerCase())?.[1] ?? null
	);
};

const getPhaseNameByNumber = (phaseNumber: number): string | null => {
	// return name or null
	return Object.entries(JOB_PHASE_LABEL_NUM).find(([_, value]) => value === phaseNumber)?.[0] ?? null;
};

export { getPhaseNumberByName, getPhaseNameByNumber };
