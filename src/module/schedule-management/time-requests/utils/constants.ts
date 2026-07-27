const REQUEST_STATUS_OPTIONS = [
	{ label: "Pending", value: "pending" },
	{ label: "Approved", value: "approved" },
	{ label: "Rejected", value: "rejected" },
];

const ETR_REQUEST_TYPE_OPTIONS = [
	{ label: "Vehicle Breakdown", value: "vehicle_breakdown" },
	{ label: "Vehicle Maintenance", value: "vehicle_maintenance" },
	{ label: "Work on scheduled job", value: "work_on_scheduled_job" },
];

const MDTR_REQUEST_TYPE_OPTIONS = [
	{ label: "Vehicle Breakdown", value: "vehicle_breakdown" },
	{ label: "Vehicle Maintenance", value: "vehicle_maintenance" },
	{ label: "Add New Job", value: "add_new_stop" },
	{ label: "Paid Idle Time", value: "idle_time" },
];

export { REQUEST_STATUS_OPTIONS, ETR_REQUEST_TYPE_OPTIONS, MDTR_REQUEST_TYPE_OPTIONS };
