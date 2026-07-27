"use client";
import MyRecordsTemplate from "@/module/employee-safety/templates/my-records-template";
import React, { Suspense } from "react";

export default function MyRecordsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<MyRecordsTemplate />
		</Suspense>
	);
}
