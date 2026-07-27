import { format } from "date-fns";

import { routes } from "@/config/routes";

import { IFleetInsurance } from "../types";
import DocumentDetailRow from "./document-detail-row";
import DocumentPdfLink from "./document-pdf-link";
import { FALLBACK } from "@/module/job-level-details/constants";

const FleetInsuranceCard = ({ insurance }: { insurance: IFleetInsurance | null }) => (
	<section className="rounded-xl bg-white p-4 shadow-sm">
		<p className="text-sm font-medium text-brand-dark">Insurance</p>

		{insurance ? (
			<div className="mt-2">
				<DocumentDetailRow label="Carrier" value={insurance.carrier} />
				<DocumentDetailRow label="Policy number" value={insurance.policyNumber} />
				<DocumentDetailRow
					label="Effective"
					value={`${format(new Date(insurance.effectiveFrom), "MM/dd/yyyy")} – ${format(new Date(insurance.effectiveTo), "MM/dd/yyyy")}`}
				/>
				<DocumentDetailRow
					label="Claims phone"
					value={insurance.agencyPhone ?? FALLBACK}
					href={insurance.agencyPhone ? `tel:${insurance.agencyPhone.replace(/[^\d+]/g, "")}` : undefined}
				/>
			</div>
		) : (
			<p className="mt-2 text-xs text-brand-grey">
				Insurance details are unavailable right now. Use the ID card PDF below.
			</p>
		)}

		<DocumentPdfLink fileName="Insurance ID Card.pdf" href={routes.bcew.fleetInsurancePdf} />
	</section>
);

export default FleetInsuranceCard;
