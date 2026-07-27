"use client";

import { useState } from "react";
import React from "react";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { IPermissions } from "@/module/employee/types";
import {
	ACCESS_LEVEL_COMBINED_LABEL,
	LOCKED_MODULES,
	MODULE_HEADING_WITH_DISPLAY_ORDER,
	MODULE_LABELS,
} from "../constants";
import { SKIP_HEADINGS } from "../enums";
import { getModuleAccessLevel } from "../utils";

interface CurrentPermissionTableProps {
	permissions?: IPermissions[];
}

export default function CurrentPermissionTable({ permissions }: CurrentPermissionTableProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="border-b border-brand-dark10 pb-3">
			<button
				type="button"
				onClick={() => setIsExpanded((prev) => !prev)}
				className="flex w-full items-center justify-between"
			>
				<span className="text-sm font-semibold text-brand-dark">Current Permission</span>
				{isExpanded ? (
					<ChevronUp className="h-4 w-4 text-brand-dark50" />
				) : (
					<ChevronDown className="h-4 w-4 text-brand-dark50" />
				)}
			</button>

			{isExpanded && (
				<div className="mt-3">
					<Table>
						<TableHeader>
							<TableRow className="text-brand-dark50">
								<TableHead>Module</TableHead>
								<TableHead className="text-right">Access</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Object.entries(MODULE_HEADING_WITH_DISPLAY_ORDER).map(([heading, modules]) => (
								<React.Fragment key={heading}>
									{!Object.values(SKIP_HEADINGS)?.includes(heading as SKIP_HEADINGS) && (
										<TableRow>
											<TableCell className="font-bold text-brand-dark" colSpan={2}>
												{heading}
											</TableCell>
										</TableRow>
									)}

									{modules.map((moduleKey) => {
										const level = getModuleAccessLevel(permissions, moduleKey);
										const isLocked = LOCKED_MODULES.includes(moduleKey);

										return (
											<TableRow key={moduleKey}>
												<TableCell className="pl-6 font-medium">{MODULE_LABELS[moduleKey] ?? moduleKey}</TableCell>
												<TableCell className="text-right">
													{isLocked ? (
														<Lock className="ml-auto h-4 w-4 text-gray-400" />
													) : (
														ACCESS_LEVEL_COMBINED_LABEL[level ?? ACCESS_LEVEL.NONE]
													)}
												</TableCell>
											</TableRow>
										);
									})}
								</React.Fragment>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
