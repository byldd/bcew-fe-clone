import { Suspense } from "react";
import SubContractorMissingItemRequestsTemplate from "@/module/job/material-selection/templates/subcontractor-missing-item-requests-template";

export default function SubContractorCrewLeaderMissingItemRequestsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SubContractorMissingItemRequestsTemplate />
		</Suspense>
	);
}
