import { FaArrowRightLong } from "react-icons/fa6";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JobLevelDetailsSidebarProps } from "../utils/types";

export default function JobLevelDetailsSidebar({
	categoryGroups,
	openCategories,
	onOpenCategoriesChange,
	selectedItem,
	onSelectJob,
	getVisibleJobs,
	onLoadMoreJobs,
}: JobLevelDetailsSidebarProps) {
	return (
		<div className="max-h-[320px] overflow-y-auto rounded-lg border bg-white p-2 lg:max-h-none">
			<h1 className="ml-2 py-2 text-sm font-medium text-brand-dark50">All Jobs</h1>

			<Accordion type="multiple" value={openCategories} onValueChange={onOpenCategoriesChange}>
				{categoryGroups.map((group) => {
					const visibleJobs = group.jobs.slice(0, getVisibleJobs(group.projectName));

					return (
						<AccordionItem key={group.projectName} value={group.projectName}>
							<AccordionTrigger className="px-3 font-inter text-sm font-medium text-brand-dark80">
								{group.projectName}
							</AccordionTrigger>

							<AccordionContent>
								<div className="space-y-1">
									{visibleJobs.map((job) => {
										const isSelected = selectedItem?.jobId === job.jobId;

										return (
											<button
												type="button"
												key={job.jobId}
												onClick={() => onSelectJob(job)}
												className={`ml-2 flex w-[calc(100%-8px)] items-center justify-between rounded-[8px] px-2 py-2 text-left hover:bg-brand-dark10 ${
													isSelected ? "bg-brand-dark10" : ""
												}`}
											>
												<div>
													<p className="font-inter text-sm font-medium text-brand-dark">{job.jobName}</p>
													<p className="text-xs text-brand-dark50">#{job.jobId}</p>
												</div>
												<FaArrowRightLong className="text-brand-grey" />
											</button>
										);
									})}

									{group.jobs.length > getVisibleJobs(group.projectName) && (
										<button
											type="button"
											onClick={() => onLoadMoreJobs(group.projectName)}
											className="ml-2 w-[calc(100%-8px)] cursor-pointer px-2 py-1 text-left text-sm text-black hover:underline"
										>
											See more jobs
										</button>
									)}
								</div>
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>
		</div>
	);
}
