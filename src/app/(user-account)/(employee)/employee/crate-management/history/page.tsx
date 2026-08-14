import { Suspense } from "react";
import ScanHistoryTemplate from "@/module/crate-management/templates/scan-history";

export default function ScanHistoryPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ScanHistoryTemplate />
		</Suspense>
	);
}
