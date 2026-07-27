import RoleList from "@/module/employee/template/roles-list";
import { Suspense } from "react";
export default function Crew() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<RoleList />
		</Suspense>
	);
}
