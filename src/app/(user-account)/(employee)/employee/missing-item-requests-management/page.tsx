import { Suspense } from "react";
import MissingItemRequestsAdminTemplate from "@/module/material-management/missing-item-requests-admin/components/missing-item-requests-admin-template";

export default function ForemanMissingItemRequestsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<MissingItemRequestsAdminTemplate showBackButton />
		</Suspense>
	);
}
