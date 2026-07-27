import { ColumnDef } from "@tanstack/react-table";
import { ISubContractorCrew } from "../types";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const useSubContractorColumns = () => {
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const columns: ColumnDef<ISubContractorCrew>[] = [
		{
			accessorKey: "name",
			header: tPeople.crewName,
		},
		{
			accessorKey: "crewLeaderName",
			header: tPeople.crewLeader,
		},
		{
			accessorKey: "phoneNumber",
			header: tPeople.phoneNumber,
		},
		{
			accessorKey: "email",
			header: tPeople.emailId,
			size: 150,
			cell: ({ row }) => {
				const email = row.original.email;
				return (
					<a
						href={`mailto:${email}`}
						className="block max-w-[160px] truncate text-center text-blue-600 hover:underline"
						title={email}
					>
						{email}
					</a>
				);
			},
		},

		{
			accessorKey: "createdAt",
			header: tPeople.creationDate,
			cell: ({ row }) => {
				const raw = row.original?.createdAt;
				const date = new Date(raw);
				if (isNaN(date.getTime())) return raw;

				return toFormattedDate(date, DATE_FORMAT.MM_SLASH_DD_YYYY);
			},
		},
	];
	return columns;
};
