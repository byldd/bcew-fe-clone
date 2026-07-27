import { Switch } from "@/components/ui/switch";
import React from "react";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useSubCrewPushNotification } from "../hooks/useSubCrewPushNotification";

const SubCrewPushNotification = () => {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const { isSupported, isSubscribed, isLoading: isPushLoading, subscribe, unsubscribe } = useSubCrewPushNotification();

	const handleTogglePush = async (checked: boolean) => {
		if (checked) {
			await subscribe();
		} else {
			await unsubscribe();
		}
	};

	if (!isSupported) return null;

	return (
		<div className="flex h-8 items-center justify-between gap-2 rounded-[8px] bg-white p-2">
			<p className="mt-1 font-inter text-sm font-medium text-brand-dark">{tschedule.pushNotifications}</p>

			<Switch
				id="push-notifications"
				checked={isSubscribed}
				onCheckedChange={handleTogglePush}
				disabled={isPushLoading}
			/>
		</div>
	);
};

export default SubCrewPushNotification;
