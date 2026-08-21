import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoGridProps {
	photos: File[];
	onRemove?: (index: number) => void;
}

export default function PhotoGrid({ photos, onRemove }: PhotoGridProps) {
	return (
		<div className="flex flex-wrap gap-2 rounded-xl border border-gray-100 p-2">
			{photos.map((photo, index) => (
				<div
					key={`${photo.name}-${index}`}
					className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100"
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={URL.createObjectURL(photo)}
						alt={`Crate photo ${index + 1}`}
						className="h-full w-full rounded-xl object-cover"
					/>
					{onRemove && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => onRemove(index)}
							className="absolute right-1 top-1 h-5 w-5 rounded-full bg-black/60 text-white hover:bg-black/80"
						>
							<X className="h-3 w-3" />
						</Button>
					)}
				</div>
			))}
		</div>
	);
}
