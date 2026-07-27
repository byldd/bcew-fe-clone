import React from "react";
import { IValidationErrors } from "../../types/schedule-interface";
import { Button } from "@/components/ui/button";
import { useSheet } from "@/hooks/useSheet";
import ValidationSheet from "../../components/validation-sheet";

const PublishSuccess = ({ errors, onClose }: { errors: IValidationErrors[]; onClose: () => void }) => {
	const { openSheet, Sheet, closeSheet } = useSheet();

	const handleClose = () => {
		onClose();
		closeSheet();
	};

	const handleCheckErrors = () => {
		openSheet({
			sheetView: <ValidationSheet errors={errors} onClose={handleClose} />,
			showDefaultClose: false,
		});
	};
	return (
		<div>
			<Sheet />
			<p className="text-sm text-brand-dark60">Schedule published successfully.</p>
			{errors?.length > 0 && (
				<p className="text-sm text-brand-dark60">
					Errors found: <span className="font-semibold text-brand-dark">{errors.length}</span>
					{"  "}{" "}
					<span
						onClick={handleCheckErrors}
						className="cursor-pointer font-semibold text-brand-dark underline underline-offset-4"
					>
						Check Errors
					</span>
				</p>
			)}
			<div className="mt-4">
				<Button variant={"outline"} onClick={onClose} className="w-full">
					Close
				</Button>
			</div>
		</div>
	);
};

export default PublishSuccess;
