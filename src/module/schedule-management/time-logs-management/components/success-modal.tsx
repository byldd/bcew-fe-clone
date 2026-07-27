import { Button } from "@/components/ui/button";
import React from "react";
import { IOverrideSuccessModalProps } from "../types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const OverrideSuccessModal: React.FC<IOverrideSuccessModalProps> = ({ name, timeRange, onClose }) => {
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	return (
		<div className="w-full rounded-md bg-white text-center shadow-md">
			<h2 className="mb-4 text-xl font-semibold">{tTimeLogs.loggedTimeOverride}</h2>
			<p className="mb-6 text-gray-600">
				{tTimeLogs.overrideSuccess} <span className="font-semibold text-black">“{timeRange}”</span>
				{tTimeLogs.forEmployee} <span className="font-semibold text-black">{name}</span>. {tTimeLogs.reflectMessage}
			</p>
			<Button variant="filled" className="min-w-full" onClick={onClose}>
				{tTimeLogs.okay}
			</Button>
		</div>
	);
};

export default OverrideSuccessModal;
