"use client";

import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { jobSiteInjuryPrimaryContacts } from "@/module/employee-safety/constants";
import { useForemanContacts } from "@/module/employee-safety/hooks/useJobSiteInjury";
import { useRouter } from "next/navigation";

export default function ReportJobSiteInjuryTemplate() {
	const router = useRouter();
	const { data: foremen = [] } = useForemanContacts();

	return (
		<div className="flex h-screen flex-col">
			<div className="flex h-full w-full flex-col bg-white">
				<div className="shrink-0 space-y-2 px-4 py-3">
					<div className="flex items-center gap-2">
						<BackButton />
						<h1 className="text-xl font-semibold text-brand-dark">Report Job Site Injury</h1>
					</div>
				</div>

				<div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
					<Card className="rounded-[10px] border">
						<CardContent className="space-y-4 p-4">
							<h2 className="font-semibold text-brand-dark">Step 1 — Please call in the order listed below</h2>

							<ol className="space-y-2">
								{jobSiteInjuryPrimaryContacts.map((contact, index) => (
									<li key={contact.name} className="flex items-center justify-between border-b pb-2 text-sm">
										<span className="text-brand-dark">
											{index + 1}. {contact.name}
										</span>
										<a href={`tel:${contact.phone}`} className="font-medium text-blue-600 underline">
											{contact.phone}
										</a>
									</li>
								))}
							</ol>

							<p className="text-sm font-medium text-brand-dark">
								If the above authorized persons are unavailable, please contact the foreman in charge of the job site
								where the injury occurred.
							</p>

							<ol className="space-y-3">
								{foremen.map((foreman, index) => (
									<li key={foreman.id} className="flex items-center justify-between border-b pb-2 text-sm">
										<div className="text-brand-dark">
											<p>
												{index + 1}. {foreman.name}
											</p>
										</div>
										{foreman.cellPhone && (
											<a href={`tel:${foreman.cellPhone}`} className="font-medium text-blue-600 underline">
												{foreman.cellPhone}
											</a>
										)}
									</li>
								))}
							</ol>

							<p className="text-xs text-brand-red800">
								If the person does not pick up, send a text, wait 5 minutes. If no response, move on to the next person.
								Repeat this process until someone picks up.
							</p>
						</CardContent>
					</Card>

					<Card className="border border-gray-100 shadow-sm">
						<CardContent className="p-4">
							<h2 className="font-semibold text-brand-dark">Step 2 — Fill out Job Site Injury Report</h2>
						</CardContent>
					</Card>
				</div>

				<div className="flex shrink-0 gap-3 p-4">
					<Button variant={"outline"} className="flex-1" onClick={() => router.back()}>
						Cancel
					</Button>
					<Button
						variant={"filled"}
						className="flex-1"
						onClick={() => router.push(routes.employee.newJobSiteInjuryReport)}
					>
						Report Job Site Injury
					</Button>
				</div>
			</div>
		</div>
	);
}
