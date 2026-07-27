import { Button } from "@/components/ui/button";
import { AppTooltip } from "@/components/ui/tooltip";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import useAuthStore from "@/store/auth-store";
import React from "react";

const SendJobAlertButton = ({
	onSendAlerts,
	isPending,
	isPublish,
}: {
	onSendAlerts: () => void;
	isPending: boolean;
	isPublish: boolean;
}) => {
	const { user } = useAuthStore((state) => state);

	const tcommon = useTypedTranslations(NAMESPACE.COMMON);

	if (!user?.role?.canSendNotification) {
		return null;
	}

	const trigger = (
		<Button
			onClick={() => {
				if (isPublish) {
					onSendAlerts();
				}
			}}
			key="send-alerts"
			className="w-full"
			variant={"outline"}
			disabled={isPending}
			type="button"
		>
			{tcommon.sendAlerts}
		</Button>
	);

	if (isPublish) {
		return trigger;
	}
	return <AppTooltip trigger={trigger} text="Publish job to send alerts" />;
};

export default SendJobAlertButton;
