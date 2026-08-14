"use client";

import { CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICrateReceiveScanSummary } from "../types";
import OrderProgress from "./order-progress";

interface ReceiveSuccessProps {
	summary: ICrateReceiveScanSummary;
	onScanNext: () => void;
	onDone: () => void;
}

export default function ReceiveSuccess({ summary, onScanNext, onDone }: ReceiveSuccessProps) {
	const sealBroken = summary.sealStatus === false;

	return (
		<div className="flex min-h-screen flex-col bg-brand-bgLightgrey px-6 pb-8 pt-16">
			<div className="flex flex-1 flex-col items-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
					<CheckCircle2 className="h-9 w-9 text-green-600" />
				</div>
				<p className="mt-4 text-lg font-semibold text-gray-900">Crate Received!</p>
				<p className="mt-1 text-center text-xs text-gray-400">Arrival logged and synced to admin dashboard.</p>

				<div className="mt-6 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-white p-3">
					<QrCode className="h-4 w-4 text-green-600" />
					<span className="text-sm font-medium text-gray-900">CRATE-{summary.assetId}</span>
				</div>

				<div className="mt-4 grid w-full max-w-xs grid-cols-2 gap-3">
					<div className="rounded-xl border border-gray-100 bg-white p-3">
						<p className="text-xs text-gray-400">Job Name</p>
						<p className="mt-0.5 text-sm font-medium text-gray-900">{summary.jobName ?? "—"}</p>
					</div>
					<div className="rounded-xl border border-gray-100 bg-white p-3">
						<p className="text-xs text-gray-400">No. of Items</p>
						<p className="mt-0.5 text-sm font-medium text-gray-900">{summary.itemsCount}</p>
					</div>
					<div className="rounded-xl border border-gray-100 bg-white p-3">
						<p className="text-xs text-gray-400">Assembler</p>
						<p className="mt-0.5 text-sm font-medium text-gray-900">{summary.assemblerName ?? "—"}</p>
					</div>
					<div className="rounded-xl border border-gray-100 bg-white p-3">
						<p className="text-xs text-gray-400">Status</p>
						<p className="mt-0.5 text-sm font-medium text-gray-900">Synced</p>
					</div>
				</div>

				{sealBroken && (
					<p className="mt-4 w-full max-w-xs rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
						Crate received with broken/missing seal
					</p>
				)}

				<div className="mt-4 w-full max-w-xs">
					<OrderProgress deliveryNum={summary.deliveryNum} orderProgress={summary.orderProgress} />
				</div>
			</div>

			<div className="flex gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={onScanNext}
					className="h-auto flex-1 rounded-2xl bg-white py-3 text-sm"
				>
					Scan Next Crate
				</Button>
				<Button type="button" variant="filled" onClick={onDone} className="h-auto flex-1 rounded-2xl py-3 text-sm">
					Done
				</Button>
			</div>
		</div>
	);
}
