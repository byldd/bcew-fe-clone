import MissingItemRequestsAdminTemplate from "@/module/material-management/missing-item-requests-admin/components/missing-item-requests-admin-template";
import { Suspense } from "react";

export default function MissingItemRequestsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<MissingItemRequestsAdminTemplate />
		</Suspense>
	);
}
