"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import SectionHeader from "@/components/shared/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import JobSiteInjuryRecordForm from "../components/job-site-injury-record-form";
import JobSiteSafetyViolationForm from "../components/job-site-safety-violation-form";
import { ADD_RECORD_TAB } from "../enums";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";

const TAB_TRIGGER_CLASS =
	"flex flex-col items-start gap-0.5 rounded-[10px] border px-4 py-2 text-left transition-colors data-[state=active]:border-brand-dark data-[state=inactive]:border-brand-dark10";

const AddNewRecordTemplate = () => {
	const searchParams = useSearchParams();
	const initialTab = searchParams.get("tab");
	// An existing record is opened through one of these ids — the record type is
	// already decided, so the other tab is hidden rather than left switchable.
	const isEditingInjury = Boolean(searchParams.get("draftId"));
	const isEditingViolation = Boolean(searchParams.get("violationId"));
	const isEditing = isEditingInjury || isEditingViolation;

	const [tab, setTab] = useState<ADD_RECORD_TAB>(
		Object.values(ADD_RECORD_TAB).includes(initialTab as ADD_RECORD_TAB)
			? (initialTab as ADD_RECORD_TAB)
			: ADD_RECORD_TAB.JOB_SITE_INJURY
	);
	const { pageAccess } = useAdminPageAccessContext();

	if (pageAccess?.accessLevel !== ACCESS_LEVEL.WRITE) {
		return (
			<div className="flex h-screen w-full items-center justify-center text-red-500">
				You don&apos;t have permission to add new record
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<SectionHeader title={isEditing ? "Edit Record" : "Add New Record"} />

			<Tabs value={tab} onValueChange={(value) => setTab(value as ADD_RECORD_TAB)}>
				<TabsList className="inline-flex h-auto w-full items-center justify-start gap-2 rounded-md bg-transparent p-0">
					{!isEditingViolation && (
						<TabsTrigger className={TAB_TRIGGER_CLASS} value={ADD_RECORD_TAB.JOB_SITE_INJURY}>
							<span className="text-sm font-medium text-brand-dark">Job Site Injury</span>
							<span className="text-xs text-brand-grey">Full injury report</span>
						</TabsTrigger>
					)}
					{!isEditingInjury && (
						<TabsTrigger className={TAB_TRIGGER_CLASS} value={ADD_RECORD_TAB.JOB_SITE_SAFETY_VIOLATION}>
							<span className="text-sm font-medium text-brand-dark">Job Site Safety Violation</span>
							<span className="text-xs text-brand-grey">Full violation report</span>
						</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value={ADD_RECORD_TAB.JOB_SITE_INJURY}>
					<JobSiteInjuryRecordForm />
				</TabsContent>

				<TabsContent value={ADD_RECORD_TAB.JOB_SITE_SAFETY_VIOLATION}>
					<JobSiteSafetyViolationForm />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default AddNewRecordTemplate;
