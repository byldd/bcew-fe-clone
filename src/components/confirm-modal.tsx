import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ConfirmModalProps {
	description: string | ReactNode;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
	description,
	confirmText = "Confirm",
	cancelText = "Cancel",
	onConfirm,
	onCancel,
	isLoading = false,
}) => {
	return (
		<div>
			<p className="text-lg text-brand-dark60">{description}</p>

			<div className="mt-6 flex justify-between gap-2 px-0.5">
				<Button className="flex-1" disabled={isLoading} variant="outline" onClick={onCancel}>
					{cancelText}
				</Button>

				<Button className="flex-1" disabled={isLoading} variant="filled" onClick={onConfirm}>
					{confirmText}
				</Button>
			</div>
		</div>
	);
};

export default ConfirmModal;
