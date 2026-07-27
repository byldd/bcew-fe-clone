import EmployeeTimeConfig from "@/module/schedule-management/roster-time-configuration/template/employee-time-config";
import { Suspense } from "react";

const EmployeeTimeConfigPage = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<EmployeeTimeConfig />
		</Suspense>
	);
};

export default EmployeeTimeConfigPage;
