"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { FaRegSquarePlus } from "react-icons/fa6";

import { StopType } from "../../enums/request-type";
import { JOB_OPTIONS, PROJECT_OPTIONS, SPECIAL_JOB_OPTIONS } from "../../constants/job-options";

type StopItem = {
	id: number;
};

type Props = {
	stopType: StopType;
};

export function AddNewStopBlock({ stopType }: Props) {
	const [stops, setStops] = useState<StopItem[]>([{ id: 1 }]);

	const addStop = () => {
		setStops((prev) => [...prev, { id: Date.now() }]);
	};

	const deleteStop = (id: number) => {
		setStops((prev) => prev.filter((s) => s.id !== id));
	};

	return (
		<div className="space-y-4 rounded-[20px] bg-white">
			{stops.map((stop, index) => (
				<div key={stop.id} className="space-y-3">
					{/* Header */}
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium text-brand-grey">{index === 0 ? "" : `Job ${index + 1}`}</p>

						{index > 0 && (
							<button onClick={() => deleteStop(stop.id)} className="text-red-500">
								<Trash2 size={16} />
							</button>
						)}
					</div>

					{/* PROJECT stop */}
					{stopType === StopType.PROJECT && (
						<>
							<div>
								<p className="mb-1 text-xs text-brand-dark60">Select Project</p>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Select Project" />
									</SelectTrigger>
									<SelectContent>
										{PROJECT_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<p className="mb-1 text-xs text-brand-dark60">Select Job</p>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Select Job" />
									</SelectTrigger>
									<SelectContent>
										{JOB_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<p className="mb-1 text-xs text-brand-dark60">Add note</p>
								<Textarea placeholder="Type here" className="rounded-[8px]" />
							</div>
						</>
					)}

					{/* SPECIAL stop */}
					{stopType === StopType.SPECIAL && (
						<>
							<div>
								<p className="mb-1 text-xs text-brand-dark60">Special Job</p>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Select Special Job" />
									</SelectTrigger>
									<SelectContent>
										{SPECIAL_JOB_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<p className="mb-1 text-xs text-brand-dark60">Add note</p>
								<Textarea placeholder="Type here" className="rounded-[8px]" />
							</div>
						</>
					)}

					{index !== stops.length - 1 && <div className="bg-brand-borderLight h-px" />}
				</div>
			))}

			<Button variant="filled" size="sm" className="w-fit text-xs" onClick={addStop}>
				<FaRegSquarePlus size={16} />
				Add New Stop
			</Button>
		</div>
	);
}
