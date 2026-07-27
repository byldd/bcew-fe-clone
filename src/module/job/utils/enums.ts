enum extendedTimeType {
	EARLY_START = "early_start",
	LATE_RELEASE = "late_release",
	BOTH = "both",
}

enum JobWorkType {
	DID_NOT_WORKED = "DNW",
}

enum extendedReasonType {
	NEW_JOB = "New job",
	VEHICLE_BREAKDOWN = "vehicle_breakdown",
	VEHICLE_MAINTENANCE = "vehicle_maintenance",
	WORK_ON_SCHEDULED_JOB = "work_on_scheduled_job",
}

enum MATERIAL_HISTORY_FILTER {
	ALL = "All",
	PULL_LIST = "pull-list",
	MATERIAL_PULLED = "material-pulled",
	MATERIAL_VALIDATED = "material-validated",
	PACKAGE_LOADED = "package-loaded",
	PACKAGE_DELIVERY = "package-delivery",
	ADDITIONAL_MATERIAL = "additional-material",
}

enum MATERIAL_STATUS_TONE {
	DONE = "done",
	PENDING = "pending",
}

enum ADDITIONAL_MATERIAL_STATUS {
	REQUESTED = "Requested",
	APPROVED = "Approved",
	REJECTED = "Rejected",
}

enum ADDITIONAL_MATERIAL_SOURCE {
	EMPLOYEE = "employee",
	ADMIN = "admin",
}

export {
	extendedTimeType,
	JobWorkType,
	extendedReasonType,
	MATERIAL_HISTORY_FILTER,
	MATERIAL_STATUS_TONE,
	ADDITIONAL_MATERIAL_STATUS,
	ADDITIONAL_MATERIAL_SOURCE,
};
