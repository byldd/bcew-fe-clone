import { isSameDate, getTodayDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import { INoScheduleCardProps } from "@/module/schedule-management/weekly-schedule-management/types/card-props";
import { holidayTypes } from "@/module/schedule-management/weekly-schedule-management/utils/enums";
import { getCardColorClass } from "@/module/schedule-management/weekly-schedule-management/utils/job-card";
import useAuthStore from "@/store/auth-store";
import React from "react";
import { LuCalendarOff } from "react-icons/lu";
import { useModal } from "@/hooks/useModal";
import { openErrorToast } from "@/components/toast";
import { CreateSubContractorDailyJobModal } from "../modal/create-sub-contractor-daily-job-modal";

const NoScheduleCard = ({
	dayType,
	subContractorForecastDate,
	date,
	bcewJob,
}: Pick<INoScheduleCardProps, "date" | "subContractorForecastDate" | "dayType" | "bcewJob">) => {
	const { user } = useAuthStore((state) => state);
	const { openModal, closeModal, Modal } = useModal();

	const isSubContractorForecastDate = subContractorForecastDate
		? isSameDate(new Date(date), new Date(subContractorForecastDate))
		: false;

	const actrec = bcewJob?.schlin?.actrec || bcewJob?.srvinv?.actrec;

	const cardColorClass = isSubContractorForecastDate ? getCardColorClass([legends.subContractorJob]) : "";

	const isPastDate = new Date(date) < getTodayDate();

	const handleCreateDailyJob = () => {
		if (!user?.id) {
			openErrorToast({ message: "User not found" });
			return;
		}

		if (isPastDate) {
			openErrorToast({ message: "Jobs cannot be created for past dates." });
			return;
		}

		openModal({
			modalTitle: (
				<p className="text-sm font-semibold text-brand-dark">
					{`${actrec?.jobnme} (${bcewJob?.schlin ? bcewJob?.schlin?.tsknme : bcewJob?.srvinv?.ordnum})`}
				</p>
			),
			modalView: <CreateSubContractorDailyJobModal bcewJob={bcewJob} date={date} closeModal={closeModal} />,
			variant: "medium",
		});
	};

	return dayType === holidayTypes.HOLIDAY ? (
		<div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-300 bg-white p-3 text-brand-dark30">
			<div className="flex h-full w-full items-center justify-center">Holiday</div>
		</div>
	) : (
		<>
			<div
				className={cn(
					"flex h-full flex-col overflow-hidden rounded-lg border border-gray-300 bg-white p-3",
					cardColorClass
				)}
			>
				<div className="flex h-full w-full flex-col">
					<div className="flex w-full items-center justify-between"></div>

					<div className="mb-3 flex h-full w-full items-center justify-center">
						{isSubContractorForecastDate ? (
							<p className="text-sm font-semibold text-brand-dark30">Job ends here</p>
						) : (
							<LuCalendarOff
								size={14}
								className="cursor-pointer text-[20px] text-brand-dark30"
								onClick={handleCreateDailyJob}
							/>
						)}
					</div>
				</div>
			</div>

			{/* Modal mount */}
			<Modal />
		</>
	);
};

export default NoScheduleCard;
