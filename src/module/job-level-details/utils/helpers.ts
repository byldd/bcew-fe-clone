import { JobLevelCommsJob, JobLevelDetailsProject } from "./types";

export function filterJobLevelDetailsTree(
	projects: JobLevelDetailsProject[],
	searchQuery: string
): JobLevelDetailsProject[] {
	if (!searchQuery.trim()) return projects;

	const query = searchQuery.toLowerCase();

	return projects
		.map((project) => {
			const filteredJobs: JobLevelCommsJob[] = project.jobs
				.map((job) => {
					const jobMatches = job.jobName.toLowerCase().includes(query);

					const filteredPhases = job.phases.filter((phase) => {
						if (phase.tsknme.toLowerCase().includes(query)) return true;

						return phase.qcJobs.some((qc) => `${phase.tsknme} ${qc.type}`.toLowerCase().includes(query));
					});

					const filteredWorkOrders = job.workOrders.filter((wo) => wo.ordnum.toLowerCase().includes(query));

					if (jobMatches || filteredPhases.length || filteredWorkOrders.length) {
						return {
							...job,
							phases: filteredPhases.length ? filteredPhases : job.phases,
							workOrders: filteredWorkOrders.length ? filteredWorkOrders : job.workOrders,
						};
					}

					return null;
				})
				.filter((job): job is JobLevelCommsJob => job !== null);

			const projectMatches = project.projectName.toLowerCase().includes(query);

			if (projectMatches || filteredJobs.length) {
				return {
					...project,
					jobs: filteredJobs.length ? filteredJobs : project.jobs,
				};
			}

			return null;
		})
		.filter((project): project is JobLevelDetailsProject => project !== null);
}
