import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import SubContractorList from "@/module/admin-sub-contractor/template/sub-contractor-list";
import { Suspense } from "react";

export default function SubContractor() {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	return (
		<Suspense fallback={<div>{tEmployee.loading}</div>}>
			<SubContractorList />
		</Suspense>
	);
}
