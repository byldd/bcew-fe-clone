"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/common/back-button";

interface ScreenHeaderProps {
	title: string;
	onBack?: () => void;
}

export default function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
	return (
		<div className="flex items-center gap-2 px-4 py-4">
			{onBack ? (
				<Button type="button" variant="ghost" size="icon" onClick={onBack} className="size-8">
					<ChevronLeft className="!size-6" />
				</Button>
			) : (
				<BackButton />
			)}
			<h1 className="text-base font-semibold text-gray-900">{title}</h1>
		</div>
	);
}
