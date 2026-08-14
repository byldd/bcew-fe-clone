import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { toFormattedDate } from "@/lib/utils/date";
import { IRole } from "@/module/employee/types";
import { DATE_FORMAT } from "@/types/date";

type IRoleDetailsCardProps = {
	roleDetails: IRole;
};

const RoleDetailsCard = ({ roleDetails }: IRoleDetailsCardProps) => {
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	return (
		<Card className="rounded-3xl border border-brand-dark10 bg-white !p-4">
			<CardHeader className="mb-4 p-0">
				<CardTitle className="flex items-center justify-between text-xl font-semibold">
					{tPmanagement.otherInformation}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<div className="grid grid-cols-2 gap-6 text-xs sm:grid-cols-3 lg:grid-cols-6">
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPmanagement.roleName}</p>
						<p className="text-xs font-semibold text-brand-dark">{roleDetails?.name}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPmanagement.creationDate}</p>
						<p className="text-wrap text-xs font-semibold text-brand-dark">
							{roleDetails?.createdDate ? toFormattedDate(roleDetails.createdDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-"}
						</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPmanagement.createdBy}</p>
						<p className="text-xs font-semibold text-brand-dark">
							{roleDetails?.createdBy && roleDetails?.createdByRole
								? `${roleDetails?.createdBy} (${roleDetails?.createdByRole})`
								: "System Created"}
						</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPmanagement.lastEdited}</p>
						<p className="text-xs font-semibold text-brand-dark">
							{roleDetails?.updatedDate ? toFormattedDate(roleDetails.updatedDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-"}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default RoleDetailsCard;
