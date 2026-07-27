"use client";
import React from "react";
import { TRAVEL_PAY_REQUEST_STATUS } from "../types";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddTravelPayStatus, useGetTravelPayRequest } from "../hooks/useTravelPay";
import { SelectField } from "@/components/ui/selectField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ITravelPayStatusFormSchema, travelPayStatusFormSchema } from "../utils/travel-pay-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { toFormattedDate } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { Spinner } from "@/components/ui/spinner";
import { TRAVEL_PAY_VALIDATION_TYPE } from "@/module/employee-travel-pay/types";

const EditTravelPayModal = ({ id, onClose }: { id: string; onClose: () => void }) => {
	const { data: travelPayRequest, isLoading } = useGetTravelPayRequest(id);

	const form = useForm<ITravelPayStatusFormSchema>({
		resolver: zodResolver(travelPayStatusFormSchema),
	});

	const { mutate, isPending } = useAddTravelPayStatus();
	const tTravelPay = useTypedTranslations(NAMESPACE.TRAVEL_PAY);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const queryClient = useQueryClient();

	const { status } = form.watch();

	const handleSubmit = async (data: ITravelPayStatusFormSchema) => {
		if (!travelPayRequest) return;
		mutate(
			{
				travelPayRequestId: travelPayRequest.id,
				status: data.status,
				note: data.note,
			},
			{
				onSuccess: () => {
					openSuccessToast(tTravelPay.statusAddedSuccessfully);

					queryClient.invalidateQueries({
						queryKey: ["travel-pay-requests"],
					});
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};
	const getStatusStyles = (status?: string) => {
		switch (status) {
			case TRAVEL_PAY_REQUEST_STATUS.APPROVED:
				return "text-[#20C55F]";

			case TRAVEL_PAY_REQUEST_STATUS.PENDING:
				return "text-[#F59E0B]";

			case TRAVEL_PAY_REQUEST_STATUS.REJECTED:
				return "text-[#EF4448]";

			default:
				return "text-brand-grey";
		}
	};

	const latestStatus = travelPayRequest?.traevlPayRequestStatuses?.[0];
	const initialStatus = travelPayRequest?.traevlPayRequestStatuses?.at(-1);

	const ineligibility = Object.entries(travelPayRequest?.ineligibility || {}).filter(([key]) => {
		return key === TRAVEL_PAY_VALIDATION_TYPE.DISTANCE || key === TRAVEL_PAY_VALIDATION_TYPE.LATE;
	});

	const wasInProgressInitially = initialStatus?.status === TRAVEL_PAY_REQUEST_STATUS.PENDING;

	const allEiligibilityMet = ineligibility.every(([, value]) => {
		return !!value?.isValid;
	});

	if (isLoading) {
		return (
			<div className="flex justify-center py-2">
				<Spinner />
			</div>
		);
	}

	if (!travelPayRequest) {
		return (
			<div className="flex justify-center py-2">
				<p>Travel pay request not found.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 rounded-xl bg-white px-1" onClick={(e) => e.stopPropagation()}>
			{/* Travel Summary */}
			<div className="bg-brand-light10 flex flex-col gap-3 rounded-lg text-sm sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<p className="text-gray-500">
						{tTravelPay.home} → {travelPayRequest.firstStop}
					</p>
					<p className="font-medium">
						{travelPayRequest.firstStopDistance} {tTravelPay.miles}
					</p>
				</div>

				<div className="space-y-1">
					<p className="text-gray-500">
						{travelPayRequest.lastStop} → {tTravelPay.home}
					</p>
					<p className="font-medium">
						{travelPayRequest.lastStopDistance} {tTravelPay.miles}
					</p>
				</div>

				<div className="space-y-1">
					<p className="text-gray-500">{tTravelPay.status}</p>
					{latestStatus && (
						<span className={`rounded-md px-3 py-1 text-xs font-medium ${getStatusStyles(latestStatus.status)}`}>
							{formatSnakeCase(latestStatus.status)}
						</span>
					)}
				</div>
			</div>

			{/* Update Status */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="font-inter text-sm font-normal text-brand-grey">
									{tTravelPay.updateStatus}
								</FormLabel>
								<FormControl>
									<SelectField
										placeholder={tTravelPay.select}
										options={[
											{ label: tEmployee.approved, value: TRAVEL_PAY_REQUEST_STATUS.APPROVED },
											{ label: tTravelPay.rejected, value: TRAVEL_PAY_REQUEST_STATUS.REJECTED },
										]}
										value={field.value}
										onValueChange={(value) => {
											field.onChange(value);
											if (value === TRAVEL_PAY_REQUEST_STATUS.APPROVED) {
												form.clearErrors("note");
											}
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="note"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="font-inter text-sm font-normal text-brand-grey">
									{tTravelPay.reason}{" "}
									{status === TRAVEL_PAY_REQUEST_STATUS.REJECTED && <span className="text-red-600">*</span>}
								</FormLabel>
								<FormControl>
									<Textarea placeholder={tEmployee.typeHere} rows={3} disabled={isPending} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Status History */}
					<div className="space-y-1">
						<h3 className="font-inter text-sm font-normal text-brand-grey">{tTravelPay.statusUpdateHistory}</h3>
						<div className="overflow-x-auto rounded-[10px] bg-brand-bgLightgrey">
							<div className="min-w-[400px] space-y-3 p-4">
								<div className="grid grid-cols-4 gap-4 border-b pb-2 text-center text-sm font-semibold text-brand-dark50">
									<span className="text-left">{tTravelPay.date}</span>
									<span>{tTravelPay.approvedName}</span>
									<span>{tTravelPay.statusChange}</span>
									<span>{tTravelPay.reason}</span>
								</div>

								{travelPayRequest.traevlPayRequestStatuses
									.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
									.map((status) => (
										<div
											key={status.id}
											className="grid grid-cols-4 gap-4 text-center text-sm font-medium text-brand-dark"
										>
											<span className="text-left">{new Date(status.createdAt).toLocaleDateString()}</span>
											<span>{status?.addedByUser?.name ?? "System"}</span>
											<span>{formatSnakeCase(status.status)}</span>
											<span className="whitespace-normal break-words">{status.note ?? "--"}</span>
										</div>
									))}
							</div>
						</div>
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<h3 className="font-inter text-sm font-normal text-brand-grey">{tTravelPay.notesAddedByEmployee}</h3>

						<div className="mt-1 space-y-2">
							{travelPayRequest.notes.map((note) => (
								<div key={note.id} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
									<p className="text-sm font-medium">{note.note}</p>
									<p className="shrink-0 text-xs text-gray-500">
										{tEmployee.addedOn} {toFormattedDate(note.createdAt)}
									</p>
								</div>
							))}
						</div>
					</div>

					{/*  */}
					{wasInProgressInitially && !allEiligibilityMet && ineligibility && (
						<div>
							<p className="font-inter text-sm font-normal text-brand-grey">Ineligibility reasons:</p>
							<div className="space-y-1">
								<div className="flex flex-col gap-1">
									{ineligibility.map(([key, value]) => {
										return (
											<div key={key} className="flex items-center gap-2 text-sm">
												<p className="text-brand-red">
													{value.message?.replace("You", "They").replace("Your", "Their")}
												</p>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{/* Footer */}
					<div className="sticky bottom-0 z-10 bg-white pt-3">
						<div className="flex gap-3 pt-4">
							<Button type="button" variant="outline" className="flex-1" onClick={onClose}>
								{tEmployee.cancel}
							</Button>
							<Button type="submit" variant="filled" className="flex-1" loading={isPending}>
								{tEmployee.save}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default EditTravelPayModal;
