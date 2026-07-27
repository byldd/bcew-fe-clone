import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const NotificationEmptyState = () => {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	return (
		<Card className="flex h-[460px] items-center justify-center border-dashed shadow-none">
			<CardContent className="flex flex-col items-center justify-center text-center">
				<p className="text-center text-base font-medium text-brand-dark50">{tschedule.noNotificationsYet}</p>
				<p className="mt-2 text-center text-sm text-brand-dark30">{tschedule.caughtUp}</p>
			</CardContent>
		</Card>
	);
};

export default NotificationEmptyState;
