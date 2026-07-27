import { Switch } from "@/components/ui/switch";
import { usePushNotification } from "@/hooks/usePushNotification";
import React from "react";
import { PushNotificationVariant } from "../types/push-notifications";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type Props = {
	variant: PushNotificationVariant;
};

const PushNotification = ({ variant }: Props) => {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const { isSupported, isSubscribed, isLoading: isPushLoading, subscribe, unsubscribe } = usePushNotification();

	const handleTogglePush = async (checked: boolean) => {
		if (checked) {
			await subscribe();
		} else {
			await unsubscribe();
		}
	};

	if (!isSupported) return null;

	//  Employee side
	if (variant === PushNotificationVariant.EMPLOYEE) {
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
	}

	//admin side
	return (
		<div className="mr-2 flex items-center justify-between gap-3">
			<p className="font-inter text-lg font-medium text-brand-dark">{tschedule.pushNotifications}</p>

			<Switch
				id="push-notifications"
				checked={isSubscribed}
				onCheckedChange={handleTogglePush}
				disabled={isPushLoading}
			/>
		</div>
	);
};

export default PushNotification;
