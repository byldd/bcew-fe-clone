"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/common/back-button";
import { CRATE_QUICK_ACTIONS } from "../utils/constants";
import { useRecentCrateScansInfinite } from "../hooks/useCrateManagement";
import RecentScansList from "../components/recent-scans-list";

export default function CrateManagementHome() {
	const router = useRouter();
	const observerTarget = useRef<HTMLDivElement>(null);

	const {
		data,
		isLoading: isRecentScansLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useRecentCrateScansInfinite({ pageSize: 10 });

	const recentScans = data?.pages.flatMap((page) => page.items) ?? [];

	useEffect(() => {
		const currentTarget = observerTarget.current;
		if (!currentTarget) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(currentTarget);

		return () => {
			observer.unobserve(currentTarget);
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<div className="min-h-screen bg-white px-4 py-4">
			<div className="mb-4 flex items-center gap-2">
				<BackButton />
				<h1 className="text-base font-semibold text-gray-900">Crate Management</h1>
			</div>

			<section>
				<h2 className="mb-3 text-sm font-medium text-gray-500">Quick Actions</h2>
				<div className="grid grid-cols-2 gap-3">
					{CRATE_QUICK_ACTIONS.map((action) => {
						const Icon = action.icon;
						return (
							<Card key={action.key} className="rounded-xl border border-gray-100 shadow-sm">
								<Button
									type="button"
									variant="ghost"
									onClick={() => action.href && router.push(action.href)}
									disabled={!action.href}
									className="h-auto w-full flex-col items-start gap-3 whitespace-normal rounded-xl p-4 text-left"
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
										<Icon className="h-5 w-5 text-gray-700" />
									</div>
									<div>
										<p className="text-sm font-medium text-gray-900">{action.label}</p>
										<p className="mt-0.5 text-xs font-normal text-gray-400">{action.subtitle}</p>
									</div>
								</Button>
							</Card>
						);
					})}
				</div>
			</section>

			<section className="mt-6">
				<h2 className="mb-1 text-sm font-medium text-gray-500">Recent Scans</h2>
				{isRecentScansLoading ? (
					<p className="py-6 text-center text-sm text-gray-400">Loading...</p>
				) : (
					<>
						<RecentScansList scans={recentScans} />
						{recentScans.length > 0 && (
							<div ref={observerTarget} className="h-10 w-full">
								{isFetchingNextPage && (
									<div className="flex items-center justify-center py-4">
										<Spinner />
									</div>
								)}
							</div>
						)}
					</>
				)}
			</section>
		</div>
	);
}
