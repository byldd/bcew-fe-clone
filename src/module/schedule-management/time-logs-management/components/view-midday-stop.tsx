"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { toFormattedDate } from "@/lib/utils/date";
import { IMiddayStopRequest } from "../../time-requests/utils/types";
import { DATE_FORMAT } from "@/types/date";
import AcceptMDTRModal from "../../time-requests/components/accept-mdtr-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const ViewMiddayStop = ({ employeeMiddayRequests }: { employeeMiddayRequests: IMiddayStopRequest[] }) => {
	const [open, setOpen] = useState(false);
	const { openModal, closeModal, Modal } = useModal();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	if (!employeeMiddayRequests?.length) {
		return null;
	}
	const hasPendingRequest = employeeMiddayRequests.some(
		(request) => request.isApproved !== true && request.isApproved !== false
	);

	const openMDTRModal = (employeeMiddayRequest: IMiddayStopRequest) => {
		openModal({
			modalTitle: tEmployee.newJobRequest,
			modalView: <AcceptMDTRModal onClose={closeModal} middayStopId={employeeMiddayRequest.id} />,
		});
	};

	return (
		<div>
			<Popover open={open}>
				<PopoverTrigger asChild onClick={() => setOpen((open) => !open)}>
					<Button className={hasPendingRequest ? "text-yellow-500" : ""} variant="link" size="sm">
						{tEmployee.viewNewJobRequests}
					</Button>
				</PopoverTrigger>

				<PopoverContent className="max-h-[90vh] w-[min(260px,calc(100vw-2rem))] overflow-y-auto text-sm">
					{employeeMiddayRequests.map((request: IMiddayStopRequest, idx: number) => {
						const { startTime, endTime, isApproved, note } = request;

						return (
							<div
								key={request.id}
								className="cursor-pointer overflow-y-auto border-b last:mb-0 last:border-none"
								onClick={() => openMDTRModal(request)}
							>
								<p className="my-1 text-sm font-medium text-brand-grey">
									{tEmployee.request} #{idx + 1}
								</p>
								{isApproved ? (
									<p className="my-1 text-sm font-semibold text-green-600">{tEmployee.approved}</p>
								) : isApproved === false ? (
									<p className="my-1 text-sm font-semibold text-red-600">{tEmployee.declined}</p>
								) : (
									<p className="my-1 text-sm font-semibold text-yellow-400">{tEmployee.pending}</p>
								)}
								<p className="text-sm font-normal text-brand-grey">
									<span className="text-xs font-medium text-brand-dark">
										{tEmployee.time}:{" "}
										{`${toFormattedDate(startTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(endTime, DATE_FORMAT.HH_MM_AA_PM)}`}
									</span>
								</p>

								<p className="mb-2 text-xs font-normal text-brand-grey">
									{tEmployee.note}:{" "}
									<span className="block max-h-[60px] whitespace-pre-wrap break-all text-xs font-medium text-brand-dark">
										{note}
									</span>
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
