import React from "react";

const Skeleton = ({ className }: { className: string }) => (
	<div className={`animate-pulse rounded bg-gray-300 ${className}`} />
);

const TravelPayRequestSkeleton = () => {
	return (
		<div className="p-4">
			{/* Top small lines */}
			<div className="mb-4 space-y-2">
				<Skeleton className="h-3 w-28" />
				<Skeleton className="h-3 w-48" />
				<Skeleton className="h-3 w-32" />
				<Skeleton className="h-3 w-56" />
			</div>

			{/* Eligibility card */}
			<div className="mb-4 space-y-3 rounded-xl bg-gray-100 p-3">
				<Skeleton className="h-3 w-40" />
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-full" />
			</div>

			{/* Bottom button */}
			<Skeleton className="h-10 w-full rounded-lg" />
		</div>
	);
};

export default TravelPayRequestSkeleton;
