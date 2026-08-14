import { Suspense } from "react";
import ScanCrateTemplate from "@/module/crate-management/templates/scan-crate";
import { CRATE_SCAN_ACTION } from "@/module/crate-management/enums";

export default function ScanReturnPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ScanCrateTemplate action={CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN} />
		</Suspense>
	);
}
