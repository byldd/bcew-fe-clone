"use client";

import { useParams } from "next/navigation";
import BackButton from "@/components/common/back-button";
import MaterialPullListDisplay from "../components/material-pull-list-display";

export default function PullListTemplate() {
	const { id: assignmentId } = useParams<{ id?: string }>();

	return (
		<div className="min-h-screen bg-brand-bgLightgrey">
			<div className="space-y-4 px-4 py-6">
				<div className="flex items-center gap-2">
					<BackButton />
					<h1 className="font-inter text-xl font-semibold text-brand-dark">Pull List</h1>
				</div>

				<MaterialPullListDisplay assignmentId={assignmentId} />
			</div>
		</div>
	);
}
