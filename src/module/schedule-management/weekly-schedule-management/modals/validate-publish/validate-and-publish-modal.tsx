"use client";

import {
	IPublishScheduleModalProps,
	IValidateScheduleModalProps,
	IValidationErrors,
} from "../../types/schedule-interface";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import { AppTooltip } from "@/components/ui/tooltip";
import { useScheduleParams } from "../../hooks/useScheduleParams";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { usePublishWeekSchedule } from "../../hooks/useSchedule";
import { getTodayDate, isSameDate, toFormattedDate, toMidnightDateString } from "@/lib/utils/date";
import { openErrorToast } from "@/components/toast";
import { useScheduleContext } from "../../context/schedule-context";
import PublishSuccess from "./publish-success";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { getActiveWeekendDates } from "@/module/schedule-management/schedule-configuration/utils/weekend-config-form";
import { WEEK_DAY_NUMBERS } from "@/utils/enums";
import { useGetWeekendWorks } from "@/module/schedule-management/schedule-configuration/hooks/useScheduleConfig";
import { Spinner } from "@/components/ui/spinner";

const PublishScheduleModal = ({ onClose, onSuccess }: IPublishScheduleModalProps) => {
	const { mutate: publishSchedule, isPending } = usePublishWeekSchedule();

	const { saturday, sunday } = getActiveWeekendDates(getTodayDate());

	const { data: weekendWorks, isFetching } = useGetWeekendWorks({
		startDate: toMidnightDateString(saturday),
		endDate: toMidnightDateString(sunday),
	});

	const isDayToDisablePublish = getTodayDate().getDay() >= WEEK_DAY_NUMBERS.TUESDAY;

	const isSaturdayConfigCompleted = weekendWorks?.some((work) => isSameDate(work.date, saturday));

	const { getParams } = useScheduleParams();
	const { startDate: startDateParam, endDate: endDateParam, teamId } = getParams();
	const [startDate, setStartDate] = useState(startDateParam);
	const [endDate, setEndDate] = useState(endDateParam);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const onPublishSchedule = () => {
		publishSchedule(
			{ startDate: toMidnightDateString(startDate), endDate: toMidnightDateString(endDate), teamId },
			{
				onSuccess: (data) => {
					onSuccess(data);
				},
				onError: (error) => {
					onClose();
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div>
			<div className="mb-4 flex gap-4">
				<div className="w-1/2">
					<Label htmlFor="startDate" className="text-sm font-medium text-brand-dark60">
						{tCommon.startDate}
					</Label>
					<DatePicker value={startDate} onChange={setStartDate} />
				</div>
				<div className="w-1/2">
					<Label htmlFor="endDate" className="text-sm font-medium text-brand-dark60">
						{tCommon.endDate}
					</Label>
					<DatePicker value={endDate} onChange={setEndDate} />
				</div>
			</div>

			{isFetching ? (
				<div className="my-2 flex justify-start gap-2">
					<p className="text-xs text-brand-dark60">Checking Weekend Configuration</p>
					<Spinner className="h-4" />
				</div>
			) : (
				<>
					{isDayToDisablePublish && !isSaturdayConfigCompleted && (
						<div className="my-3 text-sm text-brand-dark60">
							To publish schedule, weekend configuration must be completed. Please configure weekend works for{" "}
							{!isSaturdayConfigCompleted && `Saturday ${toFormattedDate(saturday)}`}
						</div>
					)}
				</>
			)}

			<Button
				onClick={() => {
					onPublishSchedule();
				}}
				variant={"filled"}
				className="w-full max-w-full"
				disabled={isFetching || isPending || (isDayToDisablePublish && !isSaturdayConfigCompleted)}
				loading={isPending}
			>
				{tschedule.confirm}
			</Button>
		</div>
	);
};

const ValidateScheduleModal = ({ onClose }: IValidateScheduleModalProps) => {
	const { onValidateSchedule, isValidatePending } = useScheduleContext();

	const { getParams } = useScheduleParams();
	const { endDate: endDateParam } = getParams();
	const today = getTodayDate();

	const [startDate, setStartDate] = useState(today);
	const [endDate, setEndDate] = useState(endDateParam);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	return (
		<div>
			<div className="mb-4 flex gap-4">
				<div className="w-1/2">
					<Label htmlFor="startDate" className="text-sm font-medium text-brand-dark60">
						{tCommon.startDate}
					</Label>
					<DatePicker value={startDate} onChange={setStartDate} />
				</div>
				<div className="w-1/2">
					<Label htmlFor="endDate" className="text-sm font-medium text-brand-dark60">
						{tCommon.endDate}
					</Label>
					<DatePicker value={endDate} onChange={setEndDate} />
				</div>
			</div>
			<Button
				onClick={() => {
					onValidateSchedule({ closeModal: onClose, startDate, endDate });
				}}
				variant={"filled"}
				className="w-full max-w-full"
				disabled={isValidatePending}
				loading={isValidatePending}
			>
				{tschedule.confirm}
			</Button>
		</div>
	);
};

const ValidateScheduleModalTrigger = () => {
	const { openModal, Modal, closeModal } = useModal();
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	const onSuccess = (data: IValidationErrors[]) => {
		openModal({
			variant: "default",
			modalView: <PublishSuccess errors={data} onClose={closeModal} />,
			modalTitle: tjobCards.publishScheduleSuccess,
		});
	};

	return (
		<div className="flex items-center gap-3">
			<AppTooltip
				trigger={
					<Button
						variant={"outline"}
						className="h-10 w-[100px] 3xl:min-w-[220px]"
						onClick={() =>
							openModal({
								variant: "medium",
								modalView: <ValidateScheduleModal onClose={closeModal} />,
								modalTitle: tSchedule.validateSchedule,
								subHeader: tSchedule.validateScheduleDescription,
							})
						}
					>
						{tSchedule.validate}
					</Button>
				}
				text={<p>{tSchedule.validate}</p>}
			/>

			<AppTooltip
				trigger={
					<Button
						variant={"filled"}
						className="h-10 w-[128px] 3xl:min-w-[288px]"
						onClick={() =>
							openModal({
								variant: "medium",
								modalView: <PublishScheduleModal onClose={closeModal} onSuccess={onSuccess} />,
								modalTitle: tSchedule.publishSchedule,
								subHeader: tSchedule.publishScheduleDescription,
							})
						}
					>
						{tSchedule.publish}
					</Button>
				}
				text={<p>{tSchedule.publish}</p>}
			/>

			<Modal />
		</div>
	);
};

export default ValidateScheduleModalTrigger;
