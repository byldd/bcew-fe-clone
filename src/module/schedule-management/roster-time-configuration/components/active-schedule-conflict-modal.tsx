import React from "react";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { getTodayDate, toDate, toFormattedDate } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";

interface ActiveScheduleConflictModalProps {
	message: string;
	onClose: () => void;
	employeeName?: string;
	date?: string; // optional if you want to use it later
}

const ActiveScheduleConflictModal: React.FC<ActiveScheduleConflictModalProps> = ({
	message,
	onClose,
	employeeName,
	date,
}) => {
	const router = useRouter();

	const handleRedirect = () => {
		router.push(
			`${routes.admin.weeklySchedule}?employeeName=${employeeName}&startDate=${date ? toDate(date) : getTodayDate()}`
		);
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Header Info */}
			<div className="flex gap-20">
				<div>
					<p className="text-xs text-brand-dark60">Date</p>
					<p className="text-sm font-medium text-brand-dark">{date ? toFormattedDate(date) : "--"}</p>
				</div>

				{employeeName && (
					<div className="text-right">
						<p className="text-xs text-brand-dark60">Employee Name</p>
						<p className="text-sm font-medium text-brand-dark">{employeeName}</p>
					</div>
				)}
			</div>

			{/* Error Box */}
			<div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3">
				<p className="text-xs font-medium text-red-600">{message}</p>
			</div>

			{/* Buttons */}
			<div className="flex justify-between gap-3 pt-2">
				<Button onClick={onClose} variant="outline" className="w-full">
					Cancel
				</Button>

				<Button onClick={handleRedirect} variant="filled" className="w-full">
					View Assigned Job
				</Button>
			</div>
		</div>
	);
};

export default ActiveScheduleConflictModal;
