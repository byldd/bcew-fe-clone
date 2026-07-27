import { Button } from "@/components/ui/button";

import React from "react";
import { RequestSuccessViewProps } from "../utils/types";
import { FaCircleCheck } from "react-icons/fa6";

const RequestSuccessView: React.FC<RequestSuccessViewProps> = ({
	requestResult,
	closeSuccessModal,
	topActions = false,
}) => {
	const requestMoreButton = (
		<Button
			variant="outline"
			className={topActions ? "h-10 shrink-0 rounded-[12px] px-4 text-sm" : "h-10 min-w-0 flex-1 px-2 text-xs"}
			onClick={closeSuccessModal}
		>
			Request More Material
		</Button>
	);

	const goToJobButton = (
		<Button
			variant="filled"
			className={topActions ? "h-10 shrink-0 rounded-[12px] px-4 text-sm" : "h-10 min-w-0 flex-1 px-2 text-xs"}
			onClick={() => {
				closeSuccessModal();
				window.history.back();
			}}
		>
			Go To Job Dashboard
		</Button>
	);

	return (
		<section>
			{topActions && (
				<div className="flex items-center justify-end gap-2 pt-1">
					{requestMoreButton}
					{goToJobButton}
				</div>
			)}
			<div className="my-6 space-y-8">
				<div className="space-y-2">
					<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
						<FaCircleCheck className="h-14 w-14 text-[#22C55E]" />
					</div>
					<h3 className="text-center text-2xl font-bold text-brand-dark">Request Submitted Successfully</h3>
					<p className="mx-auto max-w-[320px] text-center text-sm text-brand-dark60">
						Your material request has been sent for approval. You will be notified once the status is updated.
					</p>
				</div>

				<div className="space-y-2 rounded-[12px] border border-brand-dark10 p-3 text-sm">
					<div className="flex items-center justify-between border-b-2 py-2">
						<span className="text-brand-dark50">Request ID</span>
						<span className="font-semibold text-brand-dark">
							{requestResult?.requestId ? `REQ-${requestResult.requestId}` : "--"}
						</span>
					</div>
					<div className="flex items-center justify-between py-1">
						<span className="text-brand-dark50">Items Requested</span>
						<span className="font-semibold text-brand-dark">{requestResult?.itemsRequested ?? 0} Units</span>
					</div>
				</div>

				{!topActions && (
					<div className="fixed bottom-0 left-0 right-0 flex items-center gap-2 bg-brand-bgLightgrey px-4 pb-6 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
						{requestMoreButton}
						{goToJobButton}
					</div>
				)}
			</div>
		</section>
	);
};

export default RequestSuccessView;
