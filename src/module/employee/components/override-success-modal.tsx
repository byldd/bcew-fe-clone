import { Button } from "@/components/ui/button";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import React from "react";

interface IOverrideSuccessModalProps {
	name: string | undefined;
	timeRange: string;
	onClose: () => void;
}

const OverrideSuccessModal: React.FC<IOverrideSuccessModalProps> = ({
	name,
	timeRange,
	onClose,
}: IOverrideSuccessModalProps) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tTimelogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	return (
		<div className="w-full rounded-md bg-white text-center shadow-md">
			<h2 className="mb-4 text-xl font-semibold">{tTimelogs.loggedTimeOverride}</h2>
			<p className="mb-6 text-gray-600">
				{tTimelogs.overrideSuccess} <span className="font-semibold text-black">“{timeRange}”</span>{" "}
				{tTimelogs.forEmployee} <span className="font-semibold text-black">{name}</span>.{tTimelogs.reflectMessage}
			</p>
			<Button variant="outline" className="min-w-full" onClick={onClose}>
				{tEmployee.okay}
			</Button>
		</div>
	);
};

export default OverrideSuccessModal;
