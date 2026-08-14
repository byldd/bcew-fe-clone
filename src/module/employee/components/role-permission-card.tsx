import { IPermissions } from "@/module/employee/types";
import { ACCESS_LEVEL, DISABLED_HEADINGS, HAS_ACCESS, SKIP_HEADINGS } from "@/module/employee/enums";
import { LOCKED_MODULES, MODULE_HEADING_WITH_DISPLAY_ORDER, MODULE_LABELS } from "@/module/employee/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PiInfo } from "react-icons/pi";
import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { MODULE } from "@/utils/enums";

type IRolePermissionCardProps = {
	rolePermissions: IPermissions[];
	children?: React.ReactNode;
};

const RolePermissionCard = ({ rolePermissions, children }: IRolePermissionCardProps) => {
	const getAccessLevel = (module: string): ACCESS_LEVEL => {
		const match = rolePermissions?.find((p) => p.module === module);
		return (match?.accessLevel as ACCESS_LEVEL) ?? ACCESS_LEVEL.NONE;
	};

	const renderBadge = (level: ACCESS_LEVEL | undefined, check: ACCESS_LEVEL.READ | ACCESS_LEVEL.WRITE) => {
		const hasRead = level === ACCESS_LEVEL.READ || level === ACCESS_LEVEL.WRITE;
		const hasWrite = level === ACCESS_LEVEL.WRITE;

		const show = check === ACCESS_LEVEL.READ ? hasRead : hasWrite;
		return (
			<span className={`text-sm font-medium ${show ? "text-green-600" : "text-red-600"}`}>
				{show ? HAS_ACCESS.YES : HAS_ACCESS.NO}
			</span>
		);
	};
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	return (
		<Card className="rounded-3xl border border-brand-dark10 bg-white !p-4">
			<CardHeader className="mb-4 p-0">
				<CardTitle className="mb-4 flex items-center justify-between text-xl font-semibold">
					{tPmanagement.rolesAndPermission}
					{children}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<div className="space-y-4">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="text-gray-500">
									<TableHead className="w-1/3">{tPmanagement.moduleAccess}</TableHead>
									<TableHead className="text-center">
										<div className="flex items-center justify-center gap-1">
											<PiInfo className="h-4 w-4" />
											{tPmanagement.readOnlyAccess}
										</div>
									</TableHead>
									<TableHead className="text-center">
										<div className="flex items-center justify-center gap-1">
											<PiInfo className="h-4 w-4" />
											{tPmanagement.writeEditAccess}
										</div>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{Object.entries(MODULE_HEADING_WITH_DISPLAY_ORDER).map(([heading, moduleKeys]) => (
									<React.Fragment key={heading}>
										{!Object.values(SKIP_HEADINGS)?.includes(heading as SKIP_HEADINGS) && (
											<TableRow>
												<TableCell
													colSpan={3}
													className={`${heading === DISABLED_HEADINGS.READINESS_AND_QUALITY ? "text-gray-400" : "text-gray-700"} py-2 text-sm font-semibold`}
												>
													{heading}
												</TableCell>
											</TableRow>
										)}

										{moduleKeys.map((mod) => {
											const accessLevel = getAccessLevel(mod);
											const isLock = LOCKED_MODULES.includes(mod);

											return (
												<TableRow key={mod}>
													<TableCell
														className={`text-sm ${isLock ? "text-gray-400" : "text-gray-800"} ${
															mod !== MODULE.DASHBOARD &&
															mod !== MODULE.REPORTS_AND_EXPORTS &&
															mod !== MODULE.BUILDER_COMMUNICATIONS &&
															"pl-6"
														}`}
													>
														{MODULE_LABELS[mod] ?? mod}
													</TableCell>
													<TableCell className="text-center">
														{isLock ? (
															<Lock className="mx-auto h-4 w-4 text-gray-400" />
														) : (
															renderBadge(accessLevel, ACCESS_LEVEL.READ)
														)}
													</TableCell>
													<TableCell className="text-center">
														{isLock ? (
															<Lock className="mx-auto h-4 w-4 text-gray-400" />
														) : (
															renderBadge(accessLevel, ACCESS_LEVEL.WRITE)
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
				</div>
			</CardContent>
		</Card>
	);
};

export default RolePermissionCard;
