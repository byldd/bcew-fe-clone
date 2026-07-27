import SubContractorCrews from "@/module/sub-contractor-admin-desktop/crew-management/templates/crews";
import { Suspense } from "react";

export default function SubContractorAdminCrew() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SubContractorCrews />
		</Suspense>
	);
}
