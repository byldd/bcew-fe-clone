"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

const AttendanceRecordsButton = () => {
	const router = useRouter();

	return (
		<Button
			variant="outline"
			onClick={() => router.push(routes.admin.attendanceRecords)}
			className="relative h-10 min-w-[169px] rounded-[8px] font-medium text-brand-dark"
		>
			Attendance Records
		</Button>
	);
};

export default AttendanceRecordsButton;
