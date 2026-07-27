import { IEmergencyCallDirections, IEmergencyContact } from "../types";

const toTelHref = (phone: string) => `tel:+1${phone.replace(/\D/g, "")}`;

type EmergencyCallListProps = {
	contacts: IEmergencyContact[];
	directions: IEmergencyCallDirections;
};

const EmergencyCallList = ({ contacts, directions }: EmergencyCallListProps) => {
	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<p className="text-sm text-brand-dark">{directions.intro}</p>
				<ol className="list-decimal space-y-1 pl-5">
					{directions.steps.map((step) => (
						<li key={step} className="text-sm text-brand-dark">
							{step}
						</li>
					))}
				</ol>
				<p className="text-sm text-brand-dark">{directions.closing}</p>
			</div>
			<ol className="space-y-2">
				{contacts.map((contact, index) => (
					<li key={contact.phone} className="flex items-center justify-between gap-2 border-b pb-2 text-sm">
						<span className="text-brand-dark">
							{index + 1}. {contact.name}
						</span>
						<a href={toTelHref(contact.phone)} className="text-sm font-medium text-blue-600 underline">
							{contact.phone}
						</a>
					</li>
				))}
			</ol>
		</div>
	);
};

export default EmergencyCallList;
