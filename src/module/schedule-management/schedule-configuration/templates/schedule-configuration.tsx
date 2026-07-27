"use client";
import SectionHeader from "@/components/shared/section-header";
import React from "react";
import AutoSchedule from "../components/auto-schedule";
import SpecialJobForm from "../components/special-jobs-form";
import WeekendConfigForm from "../components/weekend-config-form";
import WeekendHistoryTable from "../components/weekend-history-table";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";

const ScheduleConfiguration = () => {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	return (
		<div className="space-y-4">
			<div className="flex flex-col pb-4">
				<SectionHeader title={tschedule.scheduleConfiguration} showBackButton />
				<p className="ml-10 text-base text-brand-dark50">{tschedule.changeScheduleSettingsHint}</p>
			</div>

			<AutoSchedule />
			<div className="my-4 flex flex-col gap-4 md:flex-row">
				<div className="w-full rounded-[20px] border border-brand-dark10 bg-white px-6 py-4 md:w-[50%]">
					<SpecialJobForm />
				</div>

				<div className="w-full rounded-[20px] border border-brand-dark10 bg-white px-6 py-4 md:w-[50%]">
					<WeekendConfigForm />
				</div>
			</div>
			<div className="rounded-[20px] border-t border-brand-dark10 bg-white px-6 py-4 shadow-sm">
				<WeekendHistoryTable />
			</div>
		</div>
	);
};

export default ScheduleConfiguration;
