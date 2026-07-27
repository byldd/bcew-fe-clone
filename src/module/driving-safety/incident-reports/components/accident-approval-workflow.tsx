"use client";

import { Button } from "@/components/ui/button";

import { ReviewCard } from "./review-card";

const AccidentApprovalWorkflow = ({
	isClosed,
	isApproving,
	onClose,
}: {
	isClosed: boolean;
	isApproving: boolean;
	onClose: () => void;
}) => (
	<ReviewCard title="Approval Workflow">
		{isClosed ? (
			<>
				<p className="mb-3 text-sm text-brand-dark50">Points applied, record closed.</p>
				<Button type="button" variant="outline" className="w-full" onClick={onClose}>
					Close record
				</Button>
			</>
		) : (
			<>
				<p className="mb-3 text-sm text-brand-dark50">First-level approver reviews and marks the report ready.</p>
				<div className="space-y-2">
					{/* Second-level review lands in a follow-up. */}
					<Button type="button" variant="filled" className="w-full" disabled>
						Mark for Kevin&apos;s Review
					</Button>
					<Button type="submit" variant="outline" className="w-full" loading={isApproving}>
						Approve Internally (minor)
					</Button>
				</div>
			</>
		)}
	</ReviewCard>
);

export default AccidentApprovalWorkflow;
