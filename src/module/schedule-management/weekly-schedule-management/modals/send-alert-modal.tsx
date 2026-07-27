"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ISendAlertModalProps } from "../types/schedule-interface";
import { useModal } from "@/hooks/useModal";
import { TextareaField } from "@/components/ui/textareaField";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSendAlertsToAllUsers } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import useAuthStore from "@/store/auth-store";
import { SelectField } from "@/components/ui/selectField";
import { E_ALERT_RECIPIENT } from "../types/alert";
import { MultiSelect } from "@/components/ui/multi-select";
import { useScheduleContext } from "../context/schedule-context";
import { ISendAlertFormSchema, sendAlertFormSchema } from "../utils/send-alert-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const SendAlertModal: React.FC<ISendAlertModalProps> = ({ onClose }) => {
	const form = useForm<ISendAlertFormSchema>({
		resolver: zodResolver(sendAlertFormSchema),
		defaultValues: {
			recipient: E_ALERT_RECIPIENT.ALL,
			teamIds: [],
			userIds: [],
			crewIds: [],
			subContractorIds: [],
		},
	});

	const { recipient, message } = form.watch();

	const { crews, employees, teams, subcontractors } = useScheduleContext();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const crewOptions = useMemo(() => {
		return crews.map((crew) => ({ id: crew.id, name: crew.name }));
	}, [crews]);

	const subsOptions = useMemo(() => {
		return subcontractors.map((sub) => ({ id: sub.id, name: sub?.user?.name }));
	}, [subcontractors]);

	const individualOptions = useMemo(() => {
		return employees.map((employee) => ({ id: employee.user?.id || "", name: employee.user?.name || "" }));
	}, [employees]);

	const teamOptions = useMemo(() => {
		return teams.map((team) => ({ id: team.id, name: team.name }));
	}, [teams]);

	const [sendSms, setSendSms] = useState(false);
	const { mutate: sendAlertToAllUsers, isPending: isSendingAlertToAllUsers } = useSendAlertsToAllUsers();
	const { user } = useAuthStore((state) => state);

	const handleSendAlert = (data: ISendAlertFormSchema) => {
		sendAlertToAllUsers(
			{
				...data,
				sendSms,
				userIds: data.recipient === E_ALERT_RECIPIENT.INDIVIDUAL ? data.userIds : undefined,
				teamIds: data.recipient === E_ALERT_RECIPIENT.TEAM ? data.teamIds : undefined,
				crewIds: data.recipient === E_ALERT_RECIPIENT.CREW ? data.crewIds : undefined,
				subContractorIds: data.recipient === E_ALERT_RECIPIENT.SUB_CONTRACTOR ? data.subContractorIds : undefined,
			},
			{
				onSuccess: () => {
					openSuccessToast(tschedule.alertsSentSuccessfully);
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="space-y-4">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSendAlert)}>
					<FormField
						control={form.control}
						name="recipient"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel className="text-sm font-normal text-brand-grey">{tschedule.selectRecipient}</FormLabel>
								<SelectField
									options={Object.values(E_ALERT_RECIPIENT).map((recipient) => ({
										label: formatSnakeCase(recipient),
										value: recipient,
									}))}
									value={field.value}
									onValueChange={(value) => field.onChange(value as E_ALERT_RECIPIENT)}
								/>
							</FormItem>
						)}
					/>
					{recipient === E_ALERT_RECIPIENT.TEAM && (
						<FormField
							control={form.control}
							name="teamIds"
							render={({ field }) => (
								<FormItem>
									<MultiSelect
										label={tschedule.selectTeams}
										options={teamOptions}
										onChange={(selected) => field.onChange(selected.map((item) => item.id))}
										selected={
											field.value?.map((item) => ({
												id: item,
												name: teamOptions.find((option) => option.id === item)?.name || "",
											})) || []
										}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
					{recipient === E_ALERT_RECIPIENT.INDIVIDUAL && (
						<FormField
							control={form.control}
							name="userIds"
							render={({ field }) => (
								<FormItem>
									<MultiSelect
										label={tschedule.selectIndividual}
										options={individualOptions}
										onChange={(selected) => field.onChange(selected.map((item) => item.id))}
										selected={
											field.value?.map((item) => ({
												id: item,
												name: individualOptions.find((option) => option.id === item)?.name || "",
											})) || []
										}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
					{recipient === E_ALERT_RECIPIENT.CREW && (
						<FormField
							control={form.control}
							name="crewIds"
							render={({ field }) => (
								<FormItem>
									<MultiSelect
										label={tschedule.selectCrew}
										options={crewOptions}
										onChange={(selected) => field.onChange(selected.map((item) => item.id))}
										selected={
											field.value?.map((item) => ({
												id: item,
												name: crewOptions.find((option) => option.id === item)?.name || "",
											})) || []
										}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					{recipient === E_ALERT_RECIPIENT.SUB_CONTRACTOR && (
						<FormField
							control={form.control}
							name="subContractorIds"
							render={({ field }) => (
								<FormItem>
									<MultiSelect
										label={tschedule.selectSubContractor}
										options={subsOptions}
										onChange={(selected) => field.onChange(selected.map((item) => item.id))}
										selected={
											field.value?.map((item) => ({
												id: item,
												name: subsOptions.find((option) => option.id === item)?.name || "",
											})) || []
										}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					<FormField
						control={form.control}
						name="message"
						render={({ field }) => (
							<FormItem className="mt-4">
								<FormLabel className="text-sm font-normal text-brand-grey">{tschedule.addMessage}</FormLabel>

								<TextareaField
									placeholder={tCommon.typeHere}
									value={field.value}
									onChange={(e) => field.onChange(e.target.value)}
									className="max-h-[300px] rounded-md border border-black bg-gray-100"
								/>
								<FormMessage />
							</FormItem>
						)}
					/>

					{user?.role?.canSendNotification && (
						<div className="my-4 flex items-center gap-2">
							<Checkbox checked={sendSms} onCheckedChange={(checked) => setSendSms(checked === true)} />
							<Label className="text-sm font-normal text-brand-grey md:text-sm">{tCommon.sendSmsNotification}</Label>
						</div>
					)}
					<div className="flex items-center justify-end gap-2 pt-4">
						<Button key="cancel-send-alerts" type="button" variant={"outline"} onClick={onClose} className="w-full">
							{tCommon.cancel}
						</Button>
						<Button
							key="send-alerts"
							type="submit"
							disabled={isSendingAlertToAllUsers || !message}
							variant={"filled"}
							className="w-full"
						>
							{tCommon.send}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};

const SendAlertModalTrigger = () => {
	const { openModal, Modal, closeModal } = useModal();
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={"outline"}
						className="h-10 rounded-[10px] border border-brand-dark10 bg-white text-sm hover:bg-white 3xl:h-[80px] 3xl:w-[212px] 3xl:text-2xl"
						onClick={() =>
							openModal({
								modalView: <SendAlertModal onClose={closeModal} />,
								modalTitle: tCommon.sendAlerts,
								subHeader: tschedule.alertSentToAllBcewEmployees,
							})
						}
					>
						{tCommon.sendAlerts}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{tCommon.sendAlerts}</p>
				</TooltipContent>
			</Tooltip>
			<Modal />
		</>
	);
};

export default SendAlertModalTrigger;
