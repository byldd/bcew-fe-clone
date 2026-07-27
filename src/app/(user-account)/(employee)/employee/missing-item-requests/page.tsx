import { Suspense } from "react";
import MissingItemRequestsTemplate from "@/module/material-management/missing-item-requests/templates/missing-item-requests-template";

export default function MissingItemRequestsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<MissingItemRequestsTemplate showBackButton />
		</Suspense>
	);
}
