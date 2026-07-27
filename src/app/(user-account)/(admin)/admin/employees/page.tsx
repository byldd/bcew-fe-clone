import EmployeeList from "@/module/employee/template/employee-list";
import { Suspense } from "react";

export default function Employee() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<EmployeeList />
		</Suspense>
	);
}
