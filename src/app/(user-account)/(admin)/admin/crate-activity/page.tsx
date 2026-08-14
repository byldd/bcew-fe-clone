import AdminCrateActivityPage from "@/module/admin-crate-activity/templates/crate-activity-page";
import { Suspense } from "react";

export default function CrateActivity() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AdminCrateActivityPage />
		</Suspense>
	);
}
