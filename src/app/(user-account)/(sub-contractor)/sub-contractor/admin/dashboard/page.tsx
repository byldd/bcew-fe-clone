import { Suspense } from "react";
import SubContractorDashboardTemplate from "@/module/sub-contractor/templates/sub-contractor-dashboard-template";

export default function DashboardPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SubContractorDashboardTemplate />
		</Suspense>
	);
}
