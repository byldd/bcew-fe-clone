import { RosterWeekDays, TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import { TIME_VARIANCE_TYPE } from "@/utils/enums";
import { LATENESS_FILTER_TAB } from "../../lateness-detection/types";

// Sat → Fri
export const rosterDays = Object.values(RosterWeekDays);

export const LUNCH_BREAK_CUTOFF = { hours: 12, minutes: 15 } as const;
export const LUNCH_BREAK_DURATION = 0.5; // hours

export const VARIANCE_LABEL_MAP: Record<TIME_VARIANCE_TYPE, string> = {
	[TIME_VARIANCE_TYPE.LATE_ARRIVAL]: "Late Start",
	[TIME_VARIANCE_TYPE.EARLY_LOGOUT]: "Early Quit",
	[TIME_VARIANCE_TYPE.BOTH]: "Both",
};

export const LATENESS_FILTER_TABS = [
	{
		key: LATENESS_FILTER_TAB.ALL,
		label: "All",
	},
	{
		key: LATENESS_FILTER_TAB.UNHANDLED,
		label: "Unhandled",
	},

	{
		key: LATENESS_FILTER_TAB.HANDLED,
		label: "Handled",
	},
] as const;

export const TIME_SOURCE_DISPLAY_MAP: Record<TimeSource, string> = {
	[TimeSource.TEAM]: "TSH",
	[TimeSource.ROLE]: "RSH",
	[TimeSource.CUSTOM]: "Custom",
	[TimeSource.NOT_WORKING]: "Not Working",
};
