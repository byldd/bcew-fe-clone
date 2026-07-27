import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import Schedular from "@/module/sub-contractor-admin-desktop/weekly-schedule-management/templates/schedular";
import { Suspense } from "react";

export default function SubContractorScheduleManagement() {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	return (
		<Suspense fallback={<div>{tEmployee.loading}</div>}>
			<Schedular />
		</Suspense>
	);
}
