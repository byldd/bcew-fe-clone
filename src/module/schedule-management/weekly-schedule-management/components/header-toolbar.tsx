"use client";
import "react-datepicker/dist/react-datepicker.css";

import SectionHeader from "@/components/shared/section-header";
import DatePickModal from "../modals/date-pick-modal";
import LegendModalTrigger from "../modals/legends-modal";
import RerunModalButton from "../modals/rerun-modal-button";
import SendAlertModalTrigger from "../modals/send-alert-modal";
import TaskFiltersModalTrigger from "../modals/task-filter-modal";
import ValidateScheduleModalTrigger from "../modals/validate-publish/validate-and-publish-modal";
import NotificationPopoverTrigger from "../modals/notification/notification-popover";
import SettingPopoverTrigger from "./setting-popover";
import { useScheduleContext } from "../context/schedule-context";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/inputField";
import { useScheduleParams } from "../hooks/useScheduleParams";
import { useTeams } from "@/module/team/hooks/useTeams";
import { useMemo } from "react";
import useAuthStore from "@/store/auth-store";
import DownloadDropdown from "../modals/download-dropdown";
import { SCHEDULE_DOWNLOAD_MODAL_TYPE } from "../modals/enum";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import BuilderCommunicationTrigger from "./builder-communication-trigger";

const HeaderToolbar = () => {
	const { accessLevel, search, setSearch } = useScheduleContext();
	const { getParams, setParams } = useScheduleParams();
	const { teamId, pdf, pdfType } = getParams();
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const team = useTeams();
	const { user } = useAuthStore((state) => state);

	const teamOptions = useMemo(() => {
		return [
			{
				value: "",
				label: "All",
			},
			...(team.data?.map((team) => ({
				value: team.id,
				label: team.name,
			})) || []),
		];
	}, [team.data]);

	return (
		<div className="flex flex-col gap-4 bg-brand-bgLightgrey50">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-6">
					<SectionHeader
						title={
							pdf
								? `${pdfType === SCHEDULE_DOWNLOAD_MODAL_TYPE.SCHEDULE ? "Schedule" : "Payroll Schedule"} View`
								: tSchedule.scheduleGenerator
						}
						hideSidebarToggle={pdf}
					/>
					{<DatePickModal />}
				</div>

				{!pdf && (
					<div className="no-scrollbar overflow-x-auto">
						<div className="flex min-w-max items-center gap-2">
							{user?.modules?.builderCommunications !== undefined && <BuilderCommunicationTrigger />}

							{accessLevel === ACCESS_LEVEL.WRITE && <RerunModalButton />}

							{accessLevel === ACCESS_LEVEL.WRITE && <SettingPopoverTrigger />}

							{user?.role?.canSendNotification && <SendAlertModalTrigger />}

							<TaskFiltersModalTrigger />

							<LegendModalTrigger />

							<DownloadDropdown />

							{accessLevel === ACCESS_LEVEL.WRITE && <NotificationPopoverTrigger />}
						</div>
					</div>
				)}
			</div>
			{!pdf && (
				<div className="no-scrollbar overflow-x-auto pb-2">
					<div className="flex min-w-max items-center justify-between gap-6">
						{/* Left side filters */}
						<div className="flex items-center gap-3">
							{teamOptions?.map((team) => (
								<Button
									variant={teamId === team.value ? "filled" : "outline"}
									key={team.value}
									onClick={() => setParams({ teamId: team.value })}
									className="!h-10 shrink-0"
								>
									{team.label}
								</Button>
							))}
						</div>

						{/* Right side buttons */}
						<div className="mb-1 flex shrink-0 items-center gap-3">
							<InputField
								placeholder={tSchedule.searchJob}
								className="w-65 border-none outline-none active:outline-none"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
								}}
							/>
							{accessLevel === ACCESS_LEVEL.WRITE && <ValidateScheduleModalTrigger />}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default HeaderToolbar;
