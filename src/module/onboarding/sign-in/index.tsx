"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import OTPModal from "../modal/otp-modal";
import { useModalStore } from "@/store/use-modal-store";
import UnregisterModal from "../modal/unregister-modal";

const SignIn = () => {
	const { openModal } = useModalStore();
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<Label htmlFor="email">Email</Label>
				<Input id="email" placeholder="Enter your email" />
			</div>
			<Button className="h-11 w-full" onClick={() => openModal("otp-modal")}>
				Log In
			</Button>

			{/* Use OTP Modal */}
			<OTPModal />
			<UnregisterModal />
		</div>
	);
};

export default SignIn;
