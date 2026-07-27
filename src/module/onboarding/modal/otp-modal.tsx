import { Modal } from "@/components/shared/modal";
import React from "react";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

const OTPModal = () => {
	return (
		<Modal
			modalId="otp-modal"
			className="bg-gray-100"
			width="max-w-[548px]"
			title="Check Mail"
			titleClassName="text-center"
		>
			<div className="mb-8">
				<p className="text-center font-tahoma text-sm text-grey-600">Please type the code we sent you on your email</p>
			</div>
			<form className="flex flex-col items-center justify-center">
				<div className="flex flex-col gap-10">
					<InputOTP maxLength={6}>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
						</InputOTPGroup>
						<InputOTPSeparator />
						<InputOTPGroup>
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
						</InputOTPGroup>
						<InputOTPSeparator />
						<InputOTPGroup>
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
					<Button className="h-11">Verify</Button>
				</div>
				<div>
					<div className="flex items-center justify-center">
						<span>32:06</span>
						<Button variant="link" className="px-2">
							Resend OTP
						</Button>
					</div>
					<div className="flex items-center justify-center">
						<span className="font-tahoma">Can&apos;t access to your email?</span>
						<Button variant="link" className="px-2">
							Contact support
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
};

export default OTPModal;
