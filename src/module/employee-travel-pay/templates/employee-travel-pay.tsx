"use client";
import React from "react";
import { useGetEmployeeTravelPayRequests } from "../hooks/useEmployeeTravelPay";
import { useTravelPayParams } from "@/module/schedule-management/travel-pay/hooks/useTravelPayParams";
import { getBcewWeekRange, toDate, toMidnightDateString } from "@/lib/utils/date";
import ListCard from "../components/list-card";
import BackButton from "@/components/common/back-button";
import DateRangePickModal from "@/components/common/date-range-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import CreateTravelPayRequestModal from "@/module/employee-dashboard/components/travel-pay/create-travel-pay-request-modal";
import { BsInfoCircle } from "react-icons/bs";
import RuleModal from "../components/rule-modal";
import useAuthStore from "@/store/auth-store";
import { isEligibleForTravelPay } from "../utils/employee-travel-pay";

const EmployeeTravelPay = () => {
	const { getParams, setParams } = useTravelPayParams();
	const { date } = getParams();
	const { weekStart, weekEnd } = getBcewWeekRange(date);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const { user } = useAuthStore();

	const canSendTravelPayRequest = isEligibleForTravelPay({ user });

	const { openModal, closeModal, Modal } = useModal();

	const { data } = useGetEmployeeTravelPayRequests({
		startDate: toMidnightDateString(weekStart),
		endDate: toMidnightDateString(weekEnd),
	});

	const onSendNewRequest = () => {
		openModal({
			modalView: <CreateTravelPayRequestModal onClose={closeModal} />,
			modalTitle: "Request Travel Pay",
		});
	};

	const onSeeRules = () => {
		openModal({
			modalView: <RuleModal />,
			modalTitle: "Eligibility Rules",
		});
	};

	return (
		<div className="p-4">
			<Modal />
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<BackButton />
					<p className="text-xl font-semibold text-brand-dark">{tEmployee.travelPay}</p>
					<BsInfoCircle onClick={onSeeRules} size={18} className="cursor-pointer" />
				</div>
				<div className="flex items-center gap-2">
					<DateRangePickModal
						startDate={weekStart}
						endDate={weekEnd}
						onChange={(startDate) => {
							setParams({ date: startDate ? toDate(startDate) : undefined });
						}}
						onMoveBack={(startDate) => {
							setParams({ date: startDate });
						}}
						onMoveForward={(startDate, endDate) => {
							setParams({ date: endDate });
						}}
						dayRange={6}
					/>

					{canSendTravelPayRequest && (
						<Button onClick={onSendNewRequest} variant={"filled"} className="h-9">
							New Request
						</Button>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-3">
				{data?.map((item) => (
					<ListCard key={item.id} travelPayRequest={item} />
				))}
			</div>
		</div>
	);
};

export default EmployeeTravelPay;
