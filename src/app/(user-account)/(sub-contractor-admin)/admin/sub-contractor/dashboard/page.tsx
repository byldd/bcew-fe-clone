import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";

export default function SubContractorDashboard() {
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	return <div>{tCommon.dashboard}</div>;
}
