import { Modal } from "@/components/shared/modal";
import React from "react";
import { Button } from "@/components/ui/button";

const UnregisterModal = () => {
	return (
		<Modal
			modalId="unregister-modal"
			className="bg-gray-100"
			width="max-w-[548px]"
			title="Unregistered Email"
			titleClassName="text-center"
		>
			<div className="mb-8">
				<p className="text-center font-tahoma text-sm text-grey-600">The following email address</p>
			</div>
			<div className="mx-auto max-w-[368px] space-y-10">
				<div className="space-y-2 text-center">
					<h2 className="text-2xl font-bold text-green-600">johndoe@example.com</h2>
					<p className="text-sm text-grey-600">isn’t registered for login</p>
				</div>
				<Button className="h-11 w-full">Try different email address</Button>
			</div>
			<div className="mt-10 flex items-center justify-center">
				<span className="font-tahoma">Can&apos;t access to your email?</span>
				<Button variant="link" className="px-2">
					Contact support
				</Button>
			</div>
		</Modal>
	);
};

export default UnregisterModal;
