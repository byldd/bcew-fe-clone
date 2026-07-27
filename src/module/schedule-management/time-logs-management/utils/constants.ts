import { extendedTimeType } from "@/module/job/utils/enums";

const TimeLogsParamsKey = {
	startDate: "startDate",
	userName: "userName",
	activeTeam: "activeTeam",
};

const ALL_EMPLOYEES_KEY = "all";

const timeLogsTableHeaders = [
	"Employee’s Name",
	"No. of Stops",
	"Day Start & End Time",
	"Unpaid Pause Time",
	"Extended Time",
	"New Job Request",
	"Hours",
	"Notes",
	"Truck Assigned",
	"Distance Travelled",
	"Action",
];

const detailHeaders = [
	"Stop No.",
	"Job Name",
	"Phase",
	"Logged Start Time",
	"Logged End Time",
	"Override Start & End Time",
	"Hours",
	"Notes",
	"Action",
] as const;

const defaultRosterTime = {
	dayStartTime: "",
	dayEndTime: "",
	date: new Date().toISOString(),
};

const extendedTimeTypeMap: Record<extendedTimeType, string> = {
	[extendedTimeType.EARLY_START]: "Early Start",
	[extendedTimeType.LATE_RELEASE]: "Late Release",
	[extendedTimeType.BOTH]: "Both (Early & Late)",
};

// EST is 4 hours behind UTC except during daylight saving time when it is 5 hours behind.
// This value may need to be adjusted based on the time of year.
const UTCtoESTHoursDifference = 4;

export {
	TimeLogsParamsKey,
	ALL_EMPLOYEES_KEY,
	timeLogsTableHeaders,
	detailHeaders,
	defaultRosterTime,
	extendedTimeTypeMap,
	UTCtoESTHoursDifference,
};
