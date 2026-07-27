import EmployeeHistoryTemplate from "@/module/employee-history/templates/employee-history";
import { Suspense } from "react";

export default function HistoryPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<EmployeeHistoryTemplate />
		</Suspense>
	);
}
