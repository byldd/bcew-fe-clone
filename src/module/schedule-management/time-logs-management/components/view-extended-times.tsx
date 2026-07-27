"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IExtendedRequest, IExtendedTime } from "@/module/job/types";
import { calculateExtendedHours } from "@/module/job/utils";
import { extendedTimeType } from "@/module/job/utils/enums";
import { useModal } from "@/hooks/useModal";
import AcceptETRModal from "./accept-etr-modal";
import { extendedReasonMap } from "@/module/job/utils/constants";
import { IRoster } from "../../roster-time-configuration/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const ViewExtendedTimes = ({
	employeeExtendedRequests,
	rosterTimes,
}: {
	employeeExtendedRequests: IExtendedRequest;
	rosterTimes: IRoster;
}) => {
	const [open, setOpen] = useState(false);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const { openModal, closeModal, Modal } = useModal();
	if (!employeeExtendedRequests?.extendedRequestTimes?.length) {
		return null;
	}

	const { dayStartTime, dayEndTime } = rosterTimes || {};
	const { extendedRequestTimes } = employeeExtendedRequests;
	const hasPendingRequest = extendedRequestTimes.some(
		(request) => request.isApproved !== true && request.isApproved !== false
	);

	const openETRModal = (extendedTimeId: string) => {
		openModal({
			modalTitle: tEmployee.extendedTimeRequest,
			modalView: <AcceptETRModal onClose={closeModal} extendedTimeId={extendedTimeId} />,
		});
	};

	return (
		<div>
			<Popover open={open}>
				<PopoverTrigger asChild onClick={() => setOpen((open) => !open)}>
					<Button className={hasPendingRequest ? "text-yellow-500" : ""} variant="link" size="sm">
						View Extended Times
					</Button>
				</PopoverTrigger>

				<PopoverContent className="max-h-[500px] w-[min(280px,calc(100vw-2rem))] overflow-y-auto px-3">
					{extendedRequestTimes.map((request: IExtendedTime, idx: number) => {
						const { startTime, endTime, extendedType, extendedReason, isApproved } = request;

						return (
							<div
								key={request.id}
								className="my-2 cursor-pointer space-y-2 border-b last:border-none"
								onClick={() => openETRModal(request.id)}
							>
								<div className="mb-2 flex justify-between gap-2">
									<p className="text-sm font-medium text-brand-dark">
										{tEmployee.request} #{idx + 1}
									</p>
									<div>
										{isApproved ? (
											<p className="text-sm font-medium text-green-600">{tEmployee.approved}</p>
										) : isApproved === false ? (
											<p className="text-sm font-medium text-red-600">{tEmployee.declined}</p>
										) : (
											<p className="text-sm font-medium text-yellow-500">{tEmployee.pending}</p>
										)}
									</div>
								</div>

								{extendedType !== extendedTimeType.LATE_RELEASE && (
									<p className="text-sm font-normal text-brand-grey">
										{tEmployee.earlyExtended}:{" "}
										<span className="text-xs font-medium text-brand-dark">
											{calculateExtendedHours(startTime, dayStartTime, extendedTimeType.EARLY_START)}
										</span>
									</p>
								)}

								{extendedType !== extendedTimeType.EARLY_START && (
									<p className="text-sm font-normal text-brand-grey">
										{tEmployee.lateExtended}:{" "}
										<span className="text-xs font-medium text-brand-dark">
											{calculateExtendedHours(endTime, dayEndTime, extendedTimeType.LATE_RELEASE)}
										</span>
									</p>
								)}

								<p className="mb-2 text-sm font-normal text-brand-grey">
									{tEmployee.addReason}:{" "}
									<span className="text-xs font-medium text-brand-dark">{extendedReasonMap[extendedReason]}</span>
								</p>
							</div>
						);
					})}
				</PopoverContent>
			</Popover>
			<Modal />
		</div>
	);
};
