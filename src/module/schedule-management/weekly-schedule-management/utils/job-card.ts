import { statusColors, statusTextColors } from "@/module/employee-dashboard/constants/legend-items";
import { IJobEmployeeAssignment } from "../types/schedule-interface";

export enum ColorFor {
	CARD = "CARD",
	TEXT = "TEXT",
}

export const getCardColorClass = (labelIds: string[], colorFor: ColorFor = ColorFor.CARD): string => {
	if (colorFor === ColorFor.CARD) {
		for (const [status, classes] of Object.entries(statusColors)) {
			if (labelIds.includes(status)) {
				return classes;
			}
		}
	}
	if (colorFor === ColorFor.TEXT) {
		for (const [status, classes] of Object.entries(statusTextColors)) {
			if (labelIds.includes(status)) {
				return classes;
			}
		}
	}

	return "border border-gray-200";
};

export function formatJobSiteName(jobName: string) {
	const parts = jobName.split(" ");
	const name = parts.slice(0, -1).join(" ");
	const number = parts.slice(-1)[0];

	return { name, number };
}

export function sortJobEmployee<T extends Pick<IJobEmployeeAssignment, "employeeId" | "stopNumber" | "employee">>({
	jobEmployees = [],
	crewLeaderId,
	taskLeaderId,
}: {
	jobEmployees: T[];
	crewLeaderId?: string | null;
	taskLeaderId?: string | null;
}) {
	return jobEmployees.sort((a, b) => {
		const isCrewLeaderA = crewLeaderId === a.employeeId;
		const isTaskLeaderA = taskLeaderId === a.employeeId;

		const isCrewLeaderB = crewLeaderId === b.employeeId;
		const isTaskLeaderB = taskLeaderId === b.employeeId;

		const rank = (isCrewLeader: boolean, isTaskLeader: boolean) => {
			if (isCrewLeader) return 1;
			if (isTaskLeader) return 2;
			return 3;
		};

		const rankA = rank(isCrewLeaderA, isTaskLeaderA);
		const rankB = rank(isCrewLeaderB, isTaskLeaderB);

		if (rankA <= 2 || rankB <= 2) {
			return rankA - rankB;
		}

		return a.employee?.user?.name && b.employee?.user?.name
			? a.employee?.user?.name < b.employee?.user?.name
				? -1
				: 1
			: 0;
	});
}
