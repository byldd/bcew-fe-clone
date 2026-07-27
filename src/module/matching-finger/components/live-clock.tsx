"use client";

import { useEffect, useState } from "react";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

export function LiveClock() {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	return (
		<p className="mt-1 text-sm text-gray-500">{toFormattedDate(currentTime, DATE_FORMAT.DATE_AND_TIME_SECONDS)}</p>
	);
}
