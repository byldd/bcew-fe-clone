"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { OtpFormSchema, type OtpFormType } from "@/module/auth/types";
import { clearCookies, redirectUser, setLoginCookies } from "@/module/auth/utils/helpers";
import Image from "next/image";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { ROLES } from "@/types";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { PhoneCountrySelect } from "@/components/ui/select";
import { routes } from "@/config/routes";
import { FaArrowRight } from "react-icons/fa";

export default function SubContractorCrewLeaderSignInForm() {
	const router = useRouter();
	const [otpSent, setOtpSent] = useState(false);

	const formSchema = OtpFormSchema(otpSent);
	const form = useForm<OtpFormType>({
		resolver: zodResolver(formSchema),
		mode: "onChange",
	});

	const { register, handleSubmit, formState, control } = form;
	const { errors } = formState;

	const { useSendOTPMutation, useVerifyOTPMutation } = useAuthAPI();
	const { mutate: sendOtpMutation, isPending: isSendingOtp } = useSendOTPMutation;
	const { mutate: verifyOTPMutation, isPending: isVerifyingOtp } = useVerifyOTPMutation;

	const handleSendOTP = async (data: OtpFormType) => {
		clearCookies();
		sendOtpMutation(data, {
			onSuccess: () => {
				openSuccessToast("OTP sent successfully");
				setOtpSent(true);
			},
			onError: (error) => openErrorToast({ error }),
		});
	};

	const verifyOTP = async (data: OtpFormType) => {
		verifyOTPMutation(data, {
			onSuccess: (res) => {
				const { token } = res;
				setLoginCookies({ token, userType: ROLES.SUB_CONTRACTOR_CREW_LEADER });

				const redirectRoute = redirectUser(ROLES.SUB_CONTRACTOR_CREW_LEADER);
				router.replace(redirectRoute);

				openSuccessToast("Logged in successfully");
			},
			onError: (error) => openErrorToast({ error }),
		});
	};

	return (
		<div
			className="relative flex min-h-[95vh] flex-col items-center bg-cover bg-center"
			style={{ backgroundImage: "url('/assets/png/signin-bg.png')" }}
		>
			<div className="absolute inset-0 bg-black/70" />

			<div className="relative z-10 my-12">
				<Image src="/assets/png/logo.png" alt="Company Logo" width={170} height={170} />
			</div>

			<div className="relative z-10 flex w-full max-w-md flex-col px-4 py-6">
				<div className="my-8 text-center">
					<p className="text-[20px] font-normal text-white">Sub-Contractor</p>
					<p className="text-[20px] font-normal text-white">Crew Leader Login</p>
				</div>
				<form className="flex flex-col space-y-4" onSubmit={handleSubmit(handleSendOTP)}>
					{/* PHONE NUMBER */}
					<Controller
						name="phoneNumber"
						control={control}
						render={({ field, fieldState }) => (
							<div className="space-y-1">
								<Label className="block font-inter text-sm font-normal text-white">Phone Number</Label>

								<PhoneInput
									{...field}
									defaultCountry="US"
									international
									countryCallingCodeEditable={false}
									countrySelectComponent={PhoneCountrySelect}
									className="w-full rounded-[10px] bg-white p-2"
									placeholder="Enter phone number"
								/>

								{fieldState.error && <p className="mt-1 text-xs text-red-500">{fieldState.error.message}</p>}
							</div>
						)}
					/>

					{/* OTP FIELD (VISIBLE ONLY AFTER SENT) */}
					{otpSent && (
						<div className="space-y-1">
							<Label htmlFor="otp" className="font-inter text-xs font-normal text-white">
								OTP
							</Label>
							<Input
								id="otp"
								type="text"
								placeholder="Enter OTP"
								{...register("otp")}
								className="w-full rounded-[10px] bg-white"
							/>
							{errors.otp && <p className="pt-1 text-xs text-red-500">{errors.otp.message}</p>}
						</div>
					)}

					<p className="font-inter text-xs font-normal text-white/80">
						You will receive the OTP only if you are a Crew Leader
					</p>
					<div className="flex justify-end">
						<Button
							type="button"
							className="flex items-center gap-2 rounded-none px-0 font-inter text-sm font-normal text-white shadow-none hover:border-b hover:border-white hover:bg-none hover:pb-[1px]"
							onClick={() => {
								router.replace(routes.signIn);
							}}
						>
							Login as User
							<FaArrowRight className="mt-1" />
						</Button>
					</div>

					{/* BUTTONS (INSIDE THE FORM!) */}
					<div className="mt-8 w-full max-w-md">
						{!otpSent ? (
							<Button type="submit" className="w-full bg-white" disabled={!formState.isValid || isSendingOtp}>
								{isSendingOtp ? "Sending..." : "Send OTP"}
							</Button>
						) : (
							<>
								<Button
									type="button"
									className="w-full text-white"
									onClick={handleSubmit(handleSendOTP)}
									disabled={!formState.isValid || isSendingOtp || isVerifyingOtp}
								>
									{isSendingOtp ? "Resending..." : "Resend OTP"}
								</Button>

								<Button
									type="button"
									className="mb-5 w-full bg-white"
									onClick={handleSubmit(verifyOTP)}
									disabled={!formState.isValid || isVerifyingOtp || isSendingOtp}
								>
									{isVerifyingOtp ? "Verifying..." : "Sign In"}
								</Button>
							</>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
