"use client";
import { Edit, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ExtremeWeatherForm from "./extreme-weather-form";
import { useDeleteHolidayConfiguration, useHolidayConfiguration } from "../../hooks/useScheduleConfig";
import { holidayTypes } from "../../utils/enums";

import { HOLIDAY_REASON_MAP } from "../../constants/week-schedule";
import { IHolidayConfiguration } from "../../types/schedule-configuration";
import { useModal } from "@/hooks/useModal";
import { openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const HolidayConfigModal: React.FC = () => {
	const [showAddForm, setShowAddForm] = useState(false);
	const { data: holidays } = useHolidayConfiguration();
	const [selectedHoliday, setSelectedHoliday] = useState<IHolidayConfiguration | null>(null);
	const { mutate: deleteHoliday } = useDeleteHolidayConfiguration();
	const { Modal, closeModal, openModal } = useModal();
	const queryClient = useQueryClient();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const handleDelete = (id: string) => {
		deleteHoliday(id, {
			onSuccess: () => {
				openSuccessToast("Holiday deleted successfully");
				queryClient.invalidateQueries({ queryKey: ["holiday-configuration"] });
				closeModal();
			},
		});
	};

	const handleDeleteIconClick = (id: string | undefined) => {
		if (id) {
			openModal({
				modalTitle: tschedule.deleteHolidayOrSpecialDay,
				modalView: (
					<div className="p-0">
						<p>{tschedule.confirmDeleteHolidayOrSpecialDay}</p>
						<div className="mt-6 flex w-full justify-end gap-4">
							<Button variant={"filled"} onClick={() => handleDelete(id)}>
								{tCommon.delete}
							</Button>
							<Button variant={"outline"} onClick={() => closeModal()}>
								{tCommon.cancel}
							</Button>
						</div>
					</div>
				),
			});
		}
	};

	return (
		<div>
			<div className="mt-4 space-y-6 pr-2 text-sm">
				<div>
					<p className="text-18-inter-dark-400">{tschedule.preConfiguredCompanyHolidays}</p>
					<ul className="mt-4 list-disc space-y-3 pl-5 text-brand-dark60">
						{holidays &&
							holidays
								.filter((holiday) => holiday.type === holidayTypes.HOLIDAY)
								.map((holiday, idx) => (
									<li key={idx}>
										<div className="flex justify-between">
											<span className="text-16-inter-grey-500">{holiday.name}</span>
											<span className="text-16-inter-dark-600">{holiday.displayName}</span>
										</div>
									</li>
								))}
					</ul>
				</div>

				<div className="space-y-4">
					<p className="text-18-inter-dark-400">{tschedule.extremeWeatherHandling}</p>
					<ul className="mt-4 list-disc space-y-3 pl-5 text-brand-dark60">
						{holidays &&
							holidays
								.filter((holiday) => holiday.type === holidayTypes.EXTREME_WEATHER)
								.map((holiday, idx) => (
									<li key={idx}>
										<div className="flex items-center justify-between gap-4">
											<span className="text-16-inter-grey-500">{HOLIDAY_REASON_MAP[holiday.name] || holiday.name}</span>
											<div className="flex items-center gap-4">
												<span className="text-16-inter-dark-600">
													{holiday?.date ? toFormattedDate(holiday.date, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-"}
												</span>

												<Edit
													className="cursor-pointer text-brand-dark"
													onClick={() => {
														setSelectedHoliday(holiday);
														setShowAddForm(true);
													}}
												/>
												<Trash
													className="cursor-pointer text-brand-dark"
													onClick={() => handleDeleteIconClick(holiday?.id)}
												/>
											</div>
										</div>
									</li>
								))}
					</ul>
					<p className="text-18-inter-dark-400">{tschedule.specialDay}</p>
					<ul className="mt-4 list-disc space-y-3 pl-5 text-brand-dark60">
						{holidays &&
							holidays
								.filter((holiday) => holiday.type === holidayTypes.SPECIAL_DAY)
								.map((holiday, idx) => (
									<li key={idx}>
										<div className="flex items-center justify-between gap-4">
											<span className="text-16-inter-grey-500">{holiday.displayName}</span>
											<div className="flex items-center gap-4">
												<span className="text-16-inter-dark-600">
													{holiday?.date ? toFormattedDate(holiday.date, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-"}
												</span>
												<Edit
													className="cursor-pointer text-brand-dark"
													onClick={() => {
														setSelectedHoliday(holiday);
														setShowAddForm(true);
													}}
												/>
												<Trash
													className="cursor-pointer text-brand-dark"
													onClick={() => handleDeleteIconClick(holiday?.id)}
												/>
											</div>
										</div>
									</li>
								))}
					</ul>

					<Button
						variant="filled"
						size="sm"
						className="mt-3 flex items-center gap-2"
						onClick={() => setShowAddForm(true)}
					>
						<span className="rounded-[5px] border-2">
							<Plus size={3} />
						</span>
						{tschedule.addNew}
					</Button>
					{showAddForm && (
						<ExtremeWeatherForm
							onCancel={() => {
								setShowAddForm(false);
								setSelectedHoliday(null);
							}}
							holidayData={selectedHoliday}
						/>
					)}
				</div>
			</div>
			<Modal />
		</div>
	);
};

export default HolidayConfigModal;
