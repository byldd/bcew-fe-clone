"use client";

import { Spinner } from "@/components/ui/spinner";

import { useBreakdownReportDetail } from "../hooks/useBreakdownReport";
import BreakdownReviewForm from "./breakdown-review-form";

const VehicleBreakdownReviewModal = ({ breakdownId, onClose }: { breakdownId: string; onClose: () => void }) => {
	const { data: detail, isLoading, isError } = useBreakdownReportDetail(breakdownId);

	if (isLoading) {
		return (
			<div className="flex h-40 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (isError || !detail) {
		return <p className="py-10 text-center text-sm text-brand-red">Unable to load the breakdown report.</p>;
	}

	return <BreakdownReviewForm detail={detail} onClose={onClose} />;
};

export default VehicleBreakdownReviewModal;
