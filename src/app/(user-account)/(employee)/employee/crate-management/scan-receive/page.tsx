import { Suspense } from "react";
import ScanReceiveTemplate from "@/module/crate-management/templates/scan-receive";

export default function ScanReceivePage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ScanReceiveTemplate />
		</Suspense>
	);
}
