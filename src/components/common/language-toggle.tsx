import React from "react";
import { SelectField } from "../ui/selectField";
import { useLanguage } from "@/i18n/useLanguage";
import { LANGUAGES, NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";

const LanguageToggle = () => {
	const { getLanguage, changeLanguage } = useLanguage();
	const language = getLanguage();
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	return (
		<SelectField
			options={[
				{ label: tCommon.english, value: LANGUAGES.ENGLISH },
				{ label: tCommon.spanish, value: LANGUAGES.SPANISH },
			]}
			onValueChange={(value) => changeLanguage(value as LANGUAGES)}
			value={language}
			className="w-full"
		/>
	);
};

export default LanguageToggle;
