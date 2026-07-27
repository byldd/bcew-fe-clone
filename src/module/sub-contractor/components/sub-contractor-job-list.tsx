"use client";

import { ISubContractorDailyJobSchedule } from "@/module/sub-contractor/types";
import { routes } from "@/config/routes";

import { useEmployeeScheduleParams } from "@/module/job/hooks/useEmployeeScheduleParams";
import { useSubContractorSchedules } from "@/module/sub-contractor/hooks/useSubContractorJobSchedule";
import { SubContractorJobCard } from "@/module/sub-contractor/components/sub-contractor-job-card";
import useAuthStore from "@/store/auth-store";
import { useMemo } from "react";
import { dateToUTCString } from "@/lib/utils/date";
import { useModal } from "@/hooks/useModal";
import { legends } from "@/module/employee-dashboard/constants/legend-items";
import JobNewStartModal from "@/module/employee-dashboard/components/new-start-modal/job-new-start-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useRouter } from "next/navigation";

export function SubContractorJobList() {
	const { user, subcontractorCrew } = useAuthStore((state) => state);

	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const { getParams } = useEmployeeScheduleParams();
	const { startDate } = getParams();

	const { openModal, closeModal, Modal } = useModal();

	const router = useRouter();

	const { data } = useSubContractorSchedules(user, subcontractorCrew, {
		startDate: startDate ? dateToUTCString(startDate) : startDate,
	});

	const handleClose = (id?: string) => {
		if (id) {
			router.push(user ? routes.subContractor.adminJob(id) : routes.subContractor.crewLeaderJob(id));
		}
		closeModal();
	};

	const handleJobClick = (job: ISubContractorDailyJobSchedule) => {
		if (!user && !subcontractorCrew) return;
		if (subcontractorCrew) {
			const isCrewLeaderOwnJob =
				subcontractorCrew && subcontractorCrew?.id === job?.subcontractorCrew?.id ? true : false;

			if (!isCrewLeaderOwnJob) {
				router.push(routes.subContractor.crewLeaderJob(job?.id));
				return;
			}
		}
		const labels = job?.jobLabelAssignments;
		const isApproved = job?.notReadyUpdate?.isApproved;
		const jobNewStart =
			!labels?.some((label) => label.labelId === legends.jobNotReady) &&
			labels?.some((label) => label.labelId === legends.newStart || label.labelId === legends.warrantyJob);

		if (!isApproved && jobNewStart) {
			openModal({
				variant: "medium",
				modalTitle: (
					<div className="text-start">
						<div>
							{tEmployee.job}#{job?.actrec?.recnum}
							<span className="ml-2">{`(${job?.actrec?.jobnme})`}</span>
							<span className="ml-4 inline-block h-3 w-3 rounded-full bg-brand-greenAccent"></span>
						</div>
						<div>
							<span className="text-sm font-semibold text-brand-dark50">{tEmployee.newStartJob}</span>
						</div>
					</div>
				),
				subHeader: tEmployee.updateCrewFieldsNotification,

				modalView: <JobNewStartModal onClose={handleClose} dailyJob={job} />,
			});
		} else {
			router.push(user ? routes.subContractor.adminJob(job.id) : routes.subContractor.crewLeaderJob(job.id));
		}
	};

	const crewLeaderId = subcontractorCrew?.id;
	const isAdmin = Boolean(user?.id);

	const { myJobs, otherJobs } = useMemo(() => {
		if (!data || !crewLeaderId) return { myJobs: [], otherJobs: [] };
		const myJobs: ISubContractorDailyJobSchedule[] = [];
		const otherJobs: ISubContractorDailyJobSchedule[] = [];
		data.forEach((job) => {
			if (job.subcontractorCrew?.id === crewLeaderId) myJobs.push(job);
			else otherJobs.push(job);
		});
		return { myJobs, otherJobs };
	}, [data, crewLeaderId]);

	return (
		<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
			{isAdmin && data?.length ? (
				// admin → show all jobs
				data.map((job) => <SubContractorJobCard key={job.id} job={job} onClick={() => handleJobClick(job)} />)
			) : crewLeaderId && data?.length ? (
				<>
					{/* Your Jobs */}
					{myJobs.length > 0 && (
						<>
							<h1 className="col-span-full px-4 text-lg font-semibold">{tEmployee.yourJobs}</h1>
							{myJobs.map((job) => (
								<SubContractorJobCard key={job.id} job={job} onClick={() => handleJobClick(job)} />
							))}
						</>
					)}

					{/* Other Jobs */}
					{otherJobs.length > 0 && (
						<>
							<h1 className="col-span-full px-4 text-lg font-semibold">{tEmployee.otherJobs}</h1>
							{otherJobs.map((job) => (
								<SubContractorJobCard key={job.id} job={job} onClick={() => handleJobClick(job)} />
							))}
						</>
					)}
				</>
			) : (
				<div className="col-span-full flex min-h-[60vh] items-center justify-center text-lg font-medium text-brand-dark60">
					No schedule available.
				</div>
			)}
			<Modal />
		</div>
	);
}
