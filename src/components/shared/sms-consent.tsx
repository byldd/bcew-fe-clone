import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateUserSMSConsent } from "@/module/profile/hooks/useProfile";
import useAuthStore from "@/store/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { openErrorToast, openSuccessToast } from "../toast";
import { routes } from "@/config/routes";
import Image from "next/image";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useUpdateCrewSmsConsent } from "@/module/sub-crew-leader/profile/hooks/useSubCrewLeader";

interface SmsConsentProps {
	onClose: () => void;
	isSubCrew?: boolean;
	showCloseButton?: boolean;
}

const SmsConsent = ({ onClose, isSubCrew = false, showCloseButton = true }: SmsConsentProps) => {
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);
	const { user, subcontractorCrew } = useAuthStore((store) => store);
	const { mutate: updateUserSMSConsent, isPending } = useUpdateUserSMSConsent();
	const { mutate: updateCrewSmsConsent, isPending: isCrewUpdatePending } = useUpdateCrewSmsConsent();

	const queryClient = useQueryClient();
	const [smsConsent, setSmsConsent] = useState(user?.smsConsent || subcontractorCrew?.smsConsent || false);
	const [acceptTerms, setAcceptTerms] = useState(user?.acceptTerms || subcontractorCrew?.acceptTerms || false);
	const [promotionalSmsConsent, setPromotionalSmsConsent] = useState(
		user?.promotionalSmsConsent || subcontractorCrew?.promotionalSmsConsent || false
	);

	const handleUpdateUser = () => {
		if (isSubCrew) {
			updateCrewSmsConsent(
				{ payload: { smsConsent, promotionalSmsConsent, acceptTerms } },
				{
					onSuccess: () => {
						openSuccessToast(tAdmin.updateSuccess);
						queryClient.invalidateQueries({ queryKey: ["userData"] });
						onClose();
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
			return;
		}

		updateUserSMSConsent(
			{ payload: { smsConsent, promotionalSmsConsent, acceptTerms } },
			{
				onSuccess: () => {
					openSuccessToast(tAdmin.updateSuccess);
					queryClient.invalidateQueries({ queryKey: ["userData"] });
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const fullName = user?.name || user?.bcewUser?.EmployeeName || subcontractorCrew?.crewLeaderName || "";
	const email = user?.bcewUser?.e_mail || subcontractorCrew?.email || "";
	const phone = user?.phone || user?.bcewUser?.CellNumber || subcontractorCrew?.phoneNumber || "";

	return (
		<div className="flex w-full flex-col gap-2 px-2">
			<div className="relative h-[46px] w-[162px]">
				<Image src="/assets/svg/bcew-logo.svg" alt="bcew-logo" fill className="object-contain" priority />
			</div>

			<h2 className="text-lg font-medium">{tAdmin.provideDetails}</h2>

			<div className="space-y-4">
				<div className="grid gap-0 space-y-1">
					<Label className="text-sm text-brand-grey">{tAdmin.name}</Label>
					<Input value={fullName} readOnly className="w-full" />
				</div>

				<div className="grid gap-0 space-y-1">
					<Label className="text-sm text-brand-grey">{tAdmin.email}</Label>
					<Input value={email} readOnly className="w-full" />
				</div>

				<div className="grid gap-0 space-y-1">
					<Label className="text-sm text-brand-grey">{tAdmin.phoneNumber}</Label>
					<div className="flex w-full rounded-[10px] border border-gray-300 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
						+1{phone.replace(/\s/g, "").replace(/-/g, "").replace(/\(/g, "").replace(/\)/g, "")}
					</div>
				</div>
			</div>

			<div className="mt-2 flex flex-col gap-4">
				<div className="flex flex-row items-start space-x-3 space-y-0">
					<Checkbox
						id="sms-consent"
						checked={smsConsent}
						onCheckedChange={(checked) => setSmsConsent(Boolean(checked))}
						className="mt-1"
					/>
					<div className="grid gap-1.5 leading-none">
						<Label htmlFor="sms-consent" className="text-sm text-brand-grey">
							{tAdmin.informational}
						</Label>
					</div>
				</div>

				<div className="flex flex-row items-start space-x-3 space-y-0">
					<Checkbox
						id="sms-consent"
						checked={promotionalSmsConsent}
						onCheckedChange={(checked) => setPromotionalSmsConsent(Boolean(checked))}
						className="mt-1"
					/>
					<div className="grid gap-1.5 leading-none">
						<Label htmlFor="sms-consent" className="text-sm text-brand-grey">
							{tAdmin.promotional}
						</Label>
					</div>
				</div>

				<div className="flex items-center space-x-3 space-y-0">
					<Checkbox
						id="terms-consent"
						checked={acceptTerms}
						onCheckedChange={(checked) => setAcceptTerms(Boolean(checked))}
					/>
					<div className="grid items-center gap-1.5">
						<Label htmlFor="terms-consent" className="text-sm text-brand-grey">
							{tAdmin.acceptText}{" "}
							<a href={routes.terms} className="text-[#6366f1] underline hover:text-primary">
								{tAdmin.termsOfService}
							</a>{" "}
							&{" "}
							<a href={routes.privacyPolicy} className="text-[#6366f1] underline hover:text-primary">
								{tAdmin.privacyPolicy}
							</a>
						</Label>
					</div>
				</div>
			</div>

			<div className="mt-8 flex flex-row gap-2">
				{showCloseButton && (
					<Button className="w-full" variant={"outline"} onClick={onClose} disabled={isPending || isCrewUpdatePending}>
						{tAdmin.close}
					</Button>
				)}
				<Button
					className="w-full"
					variant={"filled"}
					onClick={handleUpdateUser}
					disabled={isPending || isCrewUpdatePending}
				>
					{tAdmin.save}
				</Button>
			</div>
		</div>
	);
};

export default SmsConsent;
