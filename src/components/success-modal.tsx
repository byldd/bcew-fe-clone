import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface SuccessModalProps {
	closeModal: () => void;
	description?: string | ReactNode;
	subDescription?: string;
	leftDescription?: string;
	buttonText: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
	closeModal,
	description,
	subDescription,
	leftDescription,
	buttonText,
}) => {
	return (
		<div>
			{description && (
				<p className="text-lg text-brand-dark60">
					{description} {subDescription && <span className="font-semibold text-brand-dark">`{subDescription}`</span>}{" "}
					{leftDescription && leftDescription}
				</p>
			)}

			<div className="mt-6 px-0.5">
				<Button variant={"filled"} onClick={closeModal} className="w-full">
					{buttonText}
				</Button>
			</div>
		</div>
	);
};

export default SuccessModal;
