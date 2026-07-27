"use client";

import SectionHeader from "@/components/shared/section-header";
import DatePickModal from "@/module/schedule-management/weekly-schedule-management/modals/date-pick-modal";
import CreateSubContractorNewCrewTrigger from "../../crew-management/components/create-new-sub-contractor-crew-trigger";
import { SubContractorScheduleProvider } from "../context/schedule-context";
import SubContractorCalendar from "../components/calendar";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const Schedular = () => {
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	return (
		<SubContractorScheduleProvider>
			<div className="flex flex-col gap-3 space-y-4 bg-brand-bgLightgrey50">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap items-center gap-3">
						<SectionHeader title={tSchedule.scheduleGenerator} />

						<div className="hidden sm:block">
							<DatePickModal />
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div className="sm:hidden">
							<DatePickModal />
						</div>
						<CreateSubContractorNewCrewTrigger />
					</div>
				</div>
				<SubContractorCalendar />
			</div>
		</SubContractorScheduleProvider>
	);
};

export default Schedular;
