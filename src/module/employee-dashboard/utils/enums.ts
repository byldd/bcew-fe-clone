export enum AttendanceReasonPrefix {
	LATE_START = "Late Start Reason",
	EARLY_QUIT = "Early Quit Reason",
}

export enum Navigate {
	PREV = "prev",
	NEXT = "next",
}

export enum WeekdayAbbreviation {
	SUNDAY = "Sun",
	MONDAY = "Mon",
	TUESDAY = "Tue",
	WEDNESDAY = "Wed",
	THURSDAY = "Thu",
	FRIDAY = "Fri",
	SATURDAY = "Sat",
}

export enum PauseTimes {
	PAUSE_START_TIME = "pauseStartTime",
	PAUSE_END_TIME = "pauseEndTime",
	TIMER_IS_RUNNING = "timerIsRunning",
	TIMER_SESSION_START_TIME = "timerSessionStartTime",
	TIMER_ACCUMULATED_TIME = "timerAccumulatedTime",
	TIMER_LAST_SEGMENT_START_TIME = "timerLastSegmentStartTime",
}

export enum PrimaryButtonState {
	UPDATE_LOGGED_TIME,
	RUNNING_TIMER,
	GPS_RESTRICTED,
	FINGERPRINT_RESTRICTED,
	MANUAL_LOG,
}
