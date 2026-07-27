"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ISubContractorDailyJobSchedule, JobStatus } from "@/module/sub-contractor/types";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { routes } from "@/config/routes";
import Link from "next/link";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type ISubContractorJobCardProps = {
	job: ISubContractorDailyJobSchedule;
	onClick: (job: ISubContractorDailyJobSchedule) => void;
};

export function SubContractorJobCard({ job, onClick }: ISubContractorJobCardProps) {
	const showWaitingForConfirmation = !job.totalHours;
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	return (
		<div className="relative h-full w-full px-3">
			<Card onClick={() => onClick?.(job)} className="border border-l-[4px] border-blue-500 border-l-blue-500">
				<CardContent className="flex h-full flex-col px-4 py-3">
					<div className="flex-1">
						<div className="mb-2 flex items-center justify-between">
							<h3 className="font-inter text-xs font-semibold text-brand-dark">
								{tEmployee.job} #{job?.actrec?.recnum}{" "}
								<span className="font-inter text-xs font-semibold text-brand-dark50">
									{`(${job?.schlin?.tsknme || job?.qcJob?.schlin?.tsknme || `${job?.srvinv?.typnme?.split(" ")[0]} - ${job?.srvinv?.ordnum}`})`}
									{job?.qcJob ? `(${job?.qcJob?.type})` : ""}
								</span>
							</h3>
							<div className="mb-2 flex items-center gap-4">
								{job?.jobLabelAssignments?.map((label) => {
									const Icon = statusIcons[label.labelId as JobStatus];
									return (
										<div key={label.id} className="flex items-center gap-1">
											{Icon}
										</div>
									);
								})}
							</div>
						</div>

						<div className="mb-2 flex items-center justify-between gap-6">
							<div className="flex-wrap">
								<h4 className="font-inter text-xs font-semibold text-brand-dark">{job?.actrec?.jobnme}</h4>
							</div>
							<div>
								{job?.subcontractor?.user?.name && (
									<div className="items-center text-[10px] text-brand-dark">
										<span className="font-inter text-[10px] font-medium text-brand-dark">
											{job.subcontractor.user.name}
										</span>
									</div>
								)}
							</div>
						</div>

						{job?.totalHours && (
							<div className="flex items-center justify-between text-[10px] font-semibold text-brand-dark50">
								{showWaitingForConfirmation ? (
									<span>{tEmployee.waitingForConfirmation}</span>
								) : (
									job.totalHours && (
										<div className="flex items-center space-x-1">
											<span className="font-inter text-[10px] font-semibold text-brand-dark50">
												{tEmployee.assignedHours}
											</span>
										</div>
									)
								)}
								<div>
									<span className="font-inter text-[10px] font-semibold text-brand-dark">{job.totalHours}</span>
									<span className="ml-1 font-inter text-[10px] font-semibold text-brand-dark">{tEmployee.hrs}</span>
								</div>
							</div>
						)}
					</div>

					{/* Field Files Link */}
					{job?.actrec?.recnum && (
						<div className="mt-2">
							<Link
								href={routes.bcew.fieldFiles(job.actrec.recnum)}
								onClick={(e) => e.stopPropagation()}
								target="_blank"
								className="inline-flex w-auto text-[12px] font-semibold text-blue-600 underline hover:text-blue-800"
							>
								{tEmployee.fieldFiles}
							</Link>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
