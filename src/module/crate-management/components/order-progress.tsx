import { ICrateOrderProgress } from "../types";

interface OrderProgressProps {
	deliveryNum: string;
	orderProgress: ICrateOrderProgress;
}

export default function OrderProgress({ deliveryNum, orderProgress }: OrderProgressProps) {
	const { totalCrates, receivedCrates } = orderProgress;
	const percentage = totalCrates > 0 ? Math.min(100, Math.round((receivedCrates / totalCrates) * 100)) : 0;
	const pendingCrates = Math.max(totalCrates - receivedCrates, 0);

	return (
		<div className="rounded-xl border border-gray-100 bg-white p-3">
			<div className="flex items-center justify-between">
				<p className="text-xs font-medium text-gray-500">Order Progress</p>
				<p className="text-xs text-gray-400">
					{receivedCrates} of {totalCrates} CRATES
				</p>
			</div>
			<div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
				<div className="h-1.5 rounded-full bg-gray-900" style={{ width: `${percentage}%` }} />
			</div>
			<p className="mt-1.5 text-[11px] italic text-gray-400">
				Order {deliveryNum}
				{pendingCrates > 0 ? ` · ${pendingCrates} crate${pendingCrates === 1 ? "" : "s"} still pending` : " · complete"}
			</p>
		</div>
	);
}
