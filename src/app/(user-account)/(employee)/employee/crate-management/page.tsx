import { Suspense } from "react";
import CrateManagementHome from "@/module/crate-management/templates/crate-management-home";

export default function CrateManagementPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CrateManagementHome />
		</Suspense>
	);
}
