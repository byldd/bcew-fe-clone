"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function MaterialStatusPhotos({
	photos,
	onOpenImagePreview,
}: {
	photos: string[];
	onOpenImagePreview: (url: string) => void;
}) {
	const [isOpen, setIsOpen] = useState(false);

	if (!photos.length) return null;

	return (
		<div className="space-y-2">
			<Button
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex items-center gap-1 text-xs font-normal text-[#64748B]"
			>
				{photos.length} {photos.length === 1 ? "Photo" : "Photos"}
				<FiChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
			</Button>

			{isOpen ? (
				<div className="flex flex-wrap gap-2">
					{photos.map((url, index) => (
						<Button
							key={`${url}-${index}`}
							onClick={() => onOpenImagePreview(url)}
							className="relative h-24 w-24 overflow-hidden rounded-[12px] border p-0"
						>
							<Image src={url} width={96} height={96} alt="material-status" className="h-full w-full object-cover" />
						</Button>
					))}
				</div>
			) : null}
		</div>
	);
}
