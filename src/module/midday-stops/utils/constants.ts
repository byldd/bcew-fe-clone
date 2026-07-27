const requestTypeOptions = [
	{ label: "Vehicle Breakdown", value: "vehicle_breakdown" },
	{ label: "Vehicle Maintenance", value: "vehicle_maintenance" },
	{ label: "Paid Idle Time", value: "paid_idle_time" },
	{ label: "Add New Job", value: "add_new_stop" },
];

const requestTypeLabel: Record<string, string> = {
	add_new_stop: "Add New Job",
	vehicle_breakdown: "Vehicle Breakdown",
	vehicle_maintenance: "Vehicle Maintenance",
	paid_idle_time: "Paid Idle Time",
};

export { requestTypeOptions, requestTypeLabel };
