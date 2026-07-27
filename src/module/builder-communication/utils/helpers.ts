import {
	BuilderCommsBuilder,
	BuilderCommsProject,
	BuilderCommsJob,
	BuilderCommsDailyRecord,
	BuilderCommsQcJob,
	BuilderCommsWorkOrder,
	BUILDER_COMMS_PHASE_TYPE,
} from "../types";

export function filterBuilderCommsTree(builders: BuilderCommsBuilder[], searchQuery: string): BuilderCommsBuilder[] {
	if (!searchQuery.trim()) return builders;

	const query = searchQuery.toLowerCase();

	return builders
		.map((builder) => {
			const filteredProjects: BuilderCommsProject[] = builder.projects
				.map((project) => {
					const filteredJobs: BuilderCommsJob[] = project.jobs
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
						.filter((job): job is BuilderCommsJob => job !== null);

					const projectMatches = project.projectName.toLowerCase().includes(query);

					if (projectMatches || filteredJobs.length) {
						return {
							...project,
							jobs: filteredJobs.length ? filteredJobs : project.jobs,
						};
					}

					return null;
				})
				.filter((project): project is BuilderCommsProject => project !== null);

			const builderMatches = builder.builderName.toLowerCase().includes(query);

			if (builderMatches || filteredProjects.length) {
				return {
					...builder,
					projects: filteredProjects.length ? filteredProjects : builder.projects,
				};
			}

			return null;
		})
		.filter((builder): builder is BuilderCommsBuilder => builder !== null);
}
export const hasAnyImagesInTab = (
	activeTab: string,
	records: BuilderCommsDailyRecord[],
	qc: BuilderCommsQcJob[],
	workOrders: BuilderCommsWorkOrder[]
): boolean => {
	// Work Order Tab
	if (activeTab === BUILDER_COMMS_PHASE_TYPE.WORK_ORDER) {
		return workOrders.some((wo) => wo.jobDailyRecords.some((r) => r.images?.length > 0));
	}

	// Phase Tab (records + qc)
	if (records.some((r) => r.images?.length > 0)) return true;

	if (qc.some((q) => q.jobDailyRecords.some((r) => r.images?.length > 0))) return true;

	return false;
};

export const hasAnyNotesInTab = (
	activeTab: string,
	records: BuilderCommsDailyRecord[],
	qc: BuilderCommsQcJob[],
	workOrders: BuilderCommsWorkOrder[]
): boolean => {
	const hasNotes = (r: BuilderCommsDailyRecord) =>
		r.jobUpdateReasons?.length > 0 || (r.notReadyUpdate && r.notReadyUpdate.note);

	// Work Order Tab
	if (activeTab === BUILDER_COMMS_PHASE_TYPE.WORK_ORDER) {
		return workOrders.some((wo) => wo.jobDailyRecords.some(hasNotes));
	}

	// Phase Tab
	if (records.some(hasNotes)) return true;

	if (qc.some((q) => q.jobDailyRecords.some(hasNotes))) return true;

	return false;
};
