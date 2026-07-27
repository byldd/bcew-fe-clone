"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface LockJobModalProps {
	onClose: () => void;
}

const LockJobModal: React.FC<LockJobModalProps> = ({ onClose }) => {
	const onConfirm = () => {
		onClose();
	};

	return (
		<>
			<div className="p-1">
				<p className="mb-6 text-sm text-gray-600">
					Do you want to lock this job and prevent it from overriding while re-run?
				</p>

				<div className="flex justify-end gap-3">
					<Button variant={"outline"} onClick={onClose} className="w-full">
						Cancel
					</Button>
					<Button variant={"filled"} onClick={onConfirm} className="w-full">
						Lock
					</Button>
				</div>
			</div>
		</>
	);
};

export default LockJobModal;
