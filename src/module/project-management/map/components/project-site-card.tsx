"use client";

import { cn } from "@/lib/utils/utils";
import { MapPin } from "lucide-react";
import { IMapProject } from "../types/zone";

const PROJECT_COLOR = "#62CD32";

interface ProjectSiteCardProps {
	project: IMapProject;
	isSelected: boolean;
	onClick: () => void;
}

const ProjectSiteCard = ({ project, isSelected, onClick }: ProjectSiteCardProps) => {
	return (
		<div
			onClick={onClick}
			className={cn(
				"flex cursor-pointer overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md",
				isSelected ? "border-brand-green shadow-md" : "border-grey-400"
			)}
		>
			{/* Left colored strip */}
			<div
				className="flex w-28 flex-shrink-0 flex-col justify-end p-3"
				style={{ backgroundColor: PROJECT_COLOR + "CC" }}
			>
				<span className="line-clamp-4 text-sm font-bold leading-tight text-white drop-shadow">{project.clnnme}</span>
			</div>

			{/* Right content */}
			<div className="flex flex-1 flex-col justify-between p-4">
				<div className="space-y-1">
					<div className="flex items-center gap-1.5">
						<div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: PROJECT_COLOR }} />
						<span className="text-xs font-medium text-brand-grey">Job Site</span>
					</div>
					<h3 className="line-clamp-1 text-sm font-semibold text-brand-black">{project.clnnme}</h3>
					{project.clnnme && <p className="line-clamp-1 text-xs text-brand-lightgrey">{project.clnnme}</p>}
					{project.zone?.Name && <p className="line-clamp-1 text-xs text-brand-lightgrey">Zone: {project.zone.Name}</p>}
				</div>

				<div className="mt-3 flex items-center justify-end">
					<button
						className={cn(
							"flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
							isSelected
								? "bg-brand-green text-white"
								: "bg-grey-100 text-brand-grey hover:bg-brand-green hover:text-white"
						)}
					>
						<MapPin size={11} />
						{isSelected ? "Focused" : "Focus"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProjectSiteCard;
