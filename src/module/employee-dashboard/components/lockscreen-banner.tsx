import React from "react";
import { IEmployeeLockStatus } from "@/module/job/types";

export default function LockScreenBanner({ pendingLogs }: { pendingLogs: IEmployeeLockStatus | undefined }) {
	const { isTimeLogPending, lockStatuses } = pendingLogs || {};

	if (!isTimeLogPending || !lockStatuses?.length) {
		return null;
	}

	return (
		<div className="w-full rounded-[8px] bg-brand-red800/10 py-2 text-center font-inter text-xs font-medium text-brand-red800">
			<div className="m-auto w-auto px-4 text-start">
				<p>Please complete your time log to continue access</p>
				<ul>
					{lockStatuses?.map((status, index) => {
						return <li key={index}>{status}</li>;
					})}
				</ul>
			</div>
		</div>
	);
}
