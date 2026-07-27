"use client";
import { Card, CardContent } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/utils";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { IMiddayStopRequest } from "@/module/schedule-management/time-requests/utils/types";
import { requestTypeLabel } from "@/module/midday-stops/utils/constants";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { useDeleteMiddayStopRequest } from "@/module/midday-stops/hooks/useEmployeeMiddayStop";
import { useModal } from "@/hooks/useModal";
import { useQueryClient } from "@tanstack/react-query";
import { AiOutlineDelete } from "react-icons/ai";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { isBoolean } from "@/module/job/utils";
import { MIDDAY_STOP_REQUEST_TYPE } from "@/module/midday-stops/utils/enums";

export function MDTRequestsCard({ request }: { request: IMiddayStopRequest }) {
	const cardColorClass = "border border-gray-200";
	const { mutateAsync: deleteMiddayStopRequest } = useDeleteMiddayStopRequest();
	const { openModal, closeModal, Modal } = useModal();
	const queryClient = useQueryClient();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	if (request.isApproved === true) {
		return null;
	}

	const handleCardClick = () => {
		openModal({
			modalTitle: `${request.isApproved === false ? tEmployee.requestRejected : tEmployee.requestPending}`,
			subHeader: `The new job request for ${
				request.requestType === MIDDAY_STOP_REQUEST_TYPE.ADD_NEW_STOP
					? request.project
					: requestTypeLabel[request.requestType]
			}  ${request.isApproved === false ? tEmployee.rejectedByAdmin : tEmployee.pending}`,
			modalView: (
				<div className="flex flex-col space-y-1 pt-4">
					<div>
						{request.note && (
							<p className="text-xs font-medium">
								{" "}
								Technician Note: <span className="text-brand-dark60">{request.note}</span>
							</p>
						)}
					</div>
					<div>
						{request.adminNote && (
							<p className="text-xs font-medium">
								Admin Note:<span className="text-brand-dark60">{request.adminNote}</span>
							</p>
						)}
					</div>
				</div>
			),
		});
	};

	const handleClickDeleteRequest = () => {
		openModal({
			modalTitle: tEmployee.deleteRequest,
			subHeader: tEmployee.confirmDeleteNewJobRequest,
			modalView: (
				<div className="flex flex-col gap-4">
					<div className="flex gap-2">
						<Button variant="outline" className="w-full" onClick={closeModal}>
							{tEmployee.cancel}
						</Button>
						<Button variant="filled" className="w-full" onClick={handleMDTRDelete}>
							{tEmployee.deleteRequest}
						</Button>
					</div>
				</div>
			),
		});
	};

	const handleMDTRDelete = () => {
		deleteMiddayStopRequest(request.id, {
			onSuccess: () => {
				openSuccessToast(tEmployee.newJobRequestDeletedSuccessfully);
				queryClient.invalidateQueries({ queryKey: ["employee-midday-stops"] });
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	return (
		<div className="relative flex cursor-pointer flex-row items-center px-2">
			<div className="mr-2 flex min-w-[45px] flex-col items-center text-center leading-tight">
				<span className="text-xs font-medium text-brand-dark50">{tEmployee.new}</span>
				<span className="text-xs font-medium text-brand-dark50">{tEmployee.job}</span>

				<span className="text-xs font-medium text-brand-dark50">{tEmployee.request}</span>
			</div>
			<div className="absolute left-12 top-1/2 w-3 border-t-[1px] border-brand-lightgrey"></div>
			<Card className={cn("w-[350px] !border-l-4", cardColorClass)}>
				<CardContent className="w-full px-4 py-2">
					<div className="flex-1 space-y-1.5">
						<div onClick={handleCardClick}>
							<div className="mb-2 flex items-center justify-between gap-8">
								<div>
									{request.actrec && (
										<h3 className="font-inter text-xs font-semibold capitalize text-brand-dark">
											{tEmployee.job} #{request.actrec + " "}
										</h3>
									)}
									<h4 className="font-inter text-xs font-semibold capitalize text-brand-dark">
										{request.requestType === MIDDAY_STOP_REQUEST_TYPE.ADD_NEW_STOP && request.project
											? request.project
											: (requestTypeLabel[request.requestType] ?? "--")}
									</h4>
								</div>
								<div>
									{request.employee?.user?.name && (
										<div className="flex items-center space-x-1 text-[10px] text-brand-dark">
											<Avatar className="h-4 w-4">
												<AvatarImage src="/assets/png/profile.png" alt="Crew Leader" />
												<AvatarFallback className="border text-[0.5rem]">CL</AvatarFallback>
											</Avatar>
											<span className="font-inter text-[10px] font-medium text-brand-dark">
												{request.employee?.user?.name}
											</span>
										</div>
									)}
								</div>
							</div>
							{request.startTime && request.endTime && (
								<div className="flex items-center justify-between">
									<span className="text-[10px] font-medium text-brand-dark50">Requested Time:</span>
									<span className="font-inter text-[10px] font-semibold text-brand-dark">{` ${toFormattedDate(request.startTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(request.endTime, DATE_FORMAT.HH_MM_AA_PM)}`}</span>
								</div>
							)}
						</div>
						{request.isApproved === false ? (
							<div className="flex items-center justify-between text-[10px] font-medium text-brand-red">
								{tEmployee.requestRejected}
								{request.adminNote && (
									<span className="mt-2 text-brand-dark50" onClick={handleCardClick}>
										{tEmployee.viewNote}
									</span>
								)}
							</div>
						) : (
							!isBoolean(request.isApproved) && (
								<div className="flex items-center justify-between">
									<p className="text-[10px] font-medium text-brand-dark50">{tEmployee.waitingForConfirmation}</p>
									<Button onClick={handleClickDeleteRequest} className="h-4 w-4">
										<AiOutlineDelete />
									</Button>
								</div>
							)
						)}
					</div>
				</CardContent>
			</Card>
			<Modal />
		</div>
	);
}
