import React, { useState } from "react";
import { ITravelPayRequestModalProps } from "../../types";
import {
	useCheckTravelPayEligibility,
	useCreateEmployeeTravelPayRequests,
	useGetEmployeeTravelPayRequests,
} from "@/module/employee-travel-pay/hooks/useEmployeeTravelPay";

import { Button } from "@/components/ui/button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import {
	dateToUTCString,
	getBcewWeekRange,
	getTodayDate,
	toFormattedDate,
	toMidnightDateString,
} from "@/lib/utils/date";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import TravelPayRequestSkeleton from "./travel-pay-request-skeleton";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { DatePicker } from "@/components/ui/date-picker";
import { travelPayChecks } from "@/module/employee-travel-pay/constant/travel-pay";
import { TRAVEL_PAY_VALIDATION_TYPE } from "@/module/employee-travel-pay/types";
import { TextareaField } from "@/components/ui/textareaField";
import { useEmployeeTodayRoster } from "@/module/job/hooks/useEmployeeSchedule";
import { DATE_FORMAT } from "@/types/date";

const CreateTravelPayRequestModal = ({ onClose, date }: ITravelPayRequestModalProps) => {
	const [selectedDate, setSelectedDate] = useState(date || dateToUTCString(getTodayDate()));
	const [note, setNote] = useState("");

	const { data: eligibilityData, isFetching } = useCheckTravelPayEligibility({ date: selectedDate });
	const { mutateAsync: createTravelPayRequest, isPending } = useCreateEmployeeTravelPayRequests();
	const { data: travelPayRequests } = useGetEmployeeTravelPayRequests({
		startDate: toMidnightDateString(selectedDate),
		endDate: toMidnightDateString(selectedDate),
	});

	const { data: rosterTime } = useEmployeeTodayRoster({ date: dateToUTCString(selectedDate) });
	const rosterStart = rosterTime?.extendedApprovedStartTime || rosterTime?.dayStartTime;
	const rosterEnd = rosterTime?.extendedApprovedEndTime || rosterTime?.dayEndTime;

	const { weekStart } = getBcewWeekRange(getTodayDate());

	const router = useRouter();
	const tTravelPay = useTypedTranslations(NAMESPACE.TRAVEL_PAY);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const onSeeAllRequests = () => {
		router.push(routes.employee.travelPay);
	};
	const firstStopDistance = eligibilityData?.requestData?.firstStopDistance;
	const lastStopDistance = eligibilityData?.requestData?.lastStopDistance;

	const isRequestAlreadySent = travelPayRequests?.[0];

	const firstStopName = eligibilityData?.requestData?.firstStop;
	const lastStopName = eligibilityData?.requestData?.lastStop;

	const allEiligibilityMet = Object.values(eligibilityData?.validation || {}).every((validation) => validation.isValid);

	const canSendRequest =
		Object.entries(eligibilityData?.validation || {}).every(([key, value]) => {
			if (key === TRAVEL_PAY_VALIDATION_TYPE.DISTANCE || key === TRAVEL_PAY_VALIDATION_TYPE.LATE) return true;
			return value.isValid;
		}) && Object.entries(eligibilityData?.validation || {})?.length > 0;

	const isNoteRequired = canSendRequest && !allEiligibilityMet;

	const onSendRequest = () => {
		if (isNoteRequired && !note) {
			openErrorToast({ message: "Please add a comment" });
			return;
		}
		createTravelPayRequest(
			{ date: toMidnightDateString(selectedDate), note },
			{
				onSuccess: (data) => {
					if (Object.values(data.validation || {}).every((validation) => validation.isValid)) {
						openSuccessToast(tTravelPay.travelPayRequestSentSuccessfully);
						onClose();
					} else {
						const invalidChecks = Object.entries(data.validation || {}).find(
							([_, value]) => !value.isValid && value.message
						);
						openErrorToast({
							message: invalidChecks?.[1]?.message || tTravelPay.travelPayRequestCannotBeSent,
						});
					}
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="space-y-4">
			<div className="mt-3 space-y-1">
				<p className="text-xs text-brand-grey">Date</p>
				<DatePicker
					value={selectedDate}
					onChange={(value) => setSelectedDate(dateToUTCString(value))}
					placeholder={"Select a date"}
					className="w-full"
					disabledDate={{ after: getTodayDate(), before: weekStart }}
				/>
				<p className="text-[10px] text-brand-grey">
					Travel pay can only be requested for past dates within the current week.
				</p>
			</div>

			{isFetching ? (
				<div className="backdrop-blur-sm">
					<TravelPayRequestSkeleton />
				</div>
			) : isRequestAlreadySent ? (
				<div className="flex flex-col items-center gap-2">
					<p className="text-center text-xs text-red-500">{tTravelPay.requestAlreadySentForToday}</p>
					<p className="text-center text-sm underline" onClick={onSeeAllRequests}>
						{tTravelPay.seeAllRequests}
					</p>
				</div>
			) : (
				<>
					<div className="space-y-1">
						<p className="text-xs text-brand-grey">
							Roster Time{" "}
							{rosterStart && rosterEnd && (
								<span className="text-sm text-brand-dark">
									{toFormattedDate(rosterStart, DATE_FORMAT.HH_MM_AA_PM)} -{" "}
									{toFormattedDate(rosterEnd, DATE_FORMAT.HH_MM_AA_PM)}
								</span>
							)}
						</p>
					</div>
					<div className="flex flex-col gap-4">
						<div className="space-y-1">
							<p className="text-xs text-brand-grey">{tTravelPay.firstStop}</p>
							<p className="text-sm text-brand-dark">
								{firstStopName || "--"} {`${firstStopDistance ? `(${firstStopDistance} miles)` : ""} `}
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-xs text-brand-grey">{tTravelPay.lastStop}</p>
							<p className="text-sm text-brand-dark">
								{lastStopName || "--"} {`${lastStopDistance ? `(${lastStopDistance} miles)` : ""} `}
							</p>
						</div>
					</div>
					<div className="space-y-1">
						<p className="text-xs text-brand-grey">Eligibility Criteria</p>

						<ul className="list-disc flex-col space-y-2 rounded-xl bg-brand-bgLightgrey px-4 py-2 text-xs">
							{travelPayChecks.map((value) => {
								return (
									<li key={value} className="my-2 ml-4">
										<p>{value}</p>
									</li>
								);
							})}
						</ul>
					</div>

					{!allEiligibilityMet ? (
						<div className="space-y-1">
							<div className="flex flex-col gap-1">
								{Object.entries(eligibilityData?.validation || {}).map(([key, value]) => {
									return (
										<div key={key} className="flex items-center gap-2 text-sm">
											<p className="text-brand-red">{value.message}</p>
										</div>
									);
								})}
							</div>
						</div>
					) : (
						<p className="text-xs text-brand-greenAccent">All eligibility criteria are met.</p>
					)}

					{isNoteRequired && (
						<div>
							<p className="mb-2 text-xs text-brand-grey">
								You are currently ineligible for travel pay based on the system rules. If you believe this request
								should still be approved, please submit it with a comment explaining why.
							</p>
							<div className="px-0.5">
								<TextareaField value={note} onChange={(e) => setNote(e.target.value)} placeholder="Enter comment" />
							</div>
						</div>
					)}

					{canSendRequest && (
						<Button
							variant="filled"
							className="mt-4 w-full"
							onClick={onSendRequest}
							disabled={isPending}
							loading={isPending}
						>
							{tEmployee.sendRequest}
						</Button>
					)}
				</>
			)}
		</div>
	);
};

export default CreateTravelPayRequestModal;
