import { Suspense } from "react";
import CombinedMaterialTemplate from "@/module/material-management/combined-material-template";

export default function EmployeeMaterialRequestsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CombinedMaterialTemplate showBackButton />
		</Suspense>
	);
}
