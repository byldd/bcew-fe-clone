"use client";

import React from "react";

import BackButton from "@/components/common/back-button";
import SelfScheduleForm from "../components/self-schedule-form";
import useAuthStore from "@/store/auth-store";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export default function SelfSchedulingTemplate() {
	const { user } = useAuthStore((state) => state);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	return (
		<div className="flex min-h-screen flex-col rounded-[20px] bg-brand-bgLightgrey">
			<div className="flex-1 overflow-y-auto px-4 pb-28 pt-3">
				<div className="flex items-center gap-1">
					<BackButton />
					<h2 className="text-lg font-semibold">{tEmployee.selfScheduling}</h2>
				</div>
				<div className="mb-4 ml-8 space-y-1">
					<p className="text-sm text-muted-foreground">{tEmployee.scheduleYourselfWeekend}</p>
				</div>

				{user?.isWeekendSelfSchedulingAllowed ? (
					<div className="space-y-2 rounded-[20px] bg-white px-4 py-6">
						<SelfScheduleForm />
					</div>
				) : (
					<div className="space-y-2 rounded-[20px] bg-white px-4 py-6">
						<p className="text-sm text-muted-foreground">{tEmployee.notAllowedWeekendScheduling}</p>
					</div>
				)}
			</div>
		</div>
	);
}
