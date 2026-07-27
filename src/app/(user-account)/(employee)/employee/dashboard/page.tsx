import DashboardTemplate from "@/module/employee-dashboard/templates/dashboard-template";
import { Suspense } from "react";
import { EmployeeJobProvider } from "@/module/employee-dashboard/context/JobContext";

export default function DashboardPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<EmployeeJobProvider>
				<DashboardTemplate />
			</EmployeeJobProvider>
		</Suspense>
	);
}
