"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const LatenessDetectionButton = () => {
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const router = useRouter();

	return (
		<Button
			variant="outline"
			onClick={() => router.push(routes.admin.latenessDetection)}
			className="relative h-10 min-w-[169px] rounded-[8px] font-medium text-brand-dark"
		>
			{tTimeLogs.latenessDetection}
		</Button>
	);
};

export default LatenessDetectionButton;
