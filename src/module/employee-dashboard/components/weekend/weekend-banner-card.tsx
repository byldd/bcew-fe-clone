import { useModal } from "@/hooks/useModal";
import React from "react";
import WeekendWorkModal from "./weekend-work-modal";
import { toFormattedDate } from "@/lib/utils/date";

import {
	E_WEEKEND_WORK_ADMIN_STATUS,
	E_WEEKEND_WORK_USER_STATUS,
} from "@/module/schedule-management/schedule-configuration/types/schedule-config";
import CapacityReached from "./capacity-reached";
import { getWeekendStatusLabel } from "../../utils";
import { E_WEEKEND_WORKING_MODE } from "@/module/schedule-management/weekly-schedule-management/types/schedule-configuration";
import { IGetUserWeekendWorkResponse } from "../../types/weekend-work";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { DATE_FORMAT } from "@/types/date";
import { IoIosArrowForward } from "react-icons/io";

const WeekendBannerCard = ({ weekendWork }: { weekendWork: IGetUserWeekendWorkResponse[number] | undefined }) => {
	const { openModal, closeModal, Modal } = useModal();

	const date = weekendWork?.date;

	const handleOpenModal = () => {
		if (weekendWork?.userWeekendWork?.mode != E_WEEKEND_WORKING_MODE.VOLUNTARY) {
			return;
		}

		if (
			weekendWork.isCapacityReached &&
			(weekendWork.userWeekendWork?.userStatus != E_WEEKEND_WORK_USER_STATUS.APPROVED ||
				weekendWork.userWeekendWork?.adminStatus != E_WEEKEND_WORK_ADMIN_STATUS.APPROVED)
		) {
			openModal({
				modalView: <CapacityReached onClose={closeModal} />,
			});
			return;
		}

		openModal({
			modalView: <WeekendWorkModal weekendWork={weekendWork} onClose={closeModal} />,
			modalTitle: "Weekend Work Available",
			subHeader: "Please let us know if you'd like to work.",
		});
	};

	if (!weekendWork?.id || !date) {
		return null;
	}

	const { label } = getWeekendStatusLabel(weekendWork);

	return (
		<>
			<div className="flex cursor-pointer items-center justify-between gap-1 px-2 py-1">
				<span className="whitespace-nowrap text-xs font-medium text-brand-yellow800">
					{toFormattedDate(date, DATE_FORMAT.FULL_WEEK_DAY)} Work Status -{" "}
					{formatSnakeCase(weekendWork?.userWeekendWork?.mode)}
				</span>
				<div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[10px] font-medium text-brand-yellow800">
					{weekendWork?.date && <span>{toFormattedDate(weekendWork?.date)}</span>}
					{label && (
						<span>
							<span>• </span>
							{label}
						</span>
					)}
					<IoIosArrowForward className="cursor-pointer" onClick={handleOpenModal} />
				</div>
			</div>
			<Modal />
		</>
	);
};

export default WeekendBannerCard;
