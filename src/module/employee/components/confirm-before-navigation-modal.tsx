import React from "react";
import { Button } from "@/components/ui/button";

interface ConfirmBeforeNavigationModalProps {
	onConfirm: () => void;
	onCancel: () => void;
	isSubmitting: boolean;
}

const ConfirmBeforeNavigationModal: React.FC<ConfirmBeforeNavigationModalProps> = ({
	onConfirm,
	onCancel,
	isSubmitting,
}) => {
	return (
		<div className="flex gap-2 p-2">
			<Button loading={isSubmitting} variant="outline" className="w-full" onClick={onCancel}>
				No
			</Button>
			<Button loading={isSubmitting} variant="filled" className="w-full" onClick={onConfirm}>
				Yes
			</Button>
		</div>
	);
};

export default ConfirmBeforeNavigationModal;
