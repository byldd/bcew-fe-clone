import { useDebounce } from "@/hooks/useDebounce";
import React, { useMemo, useState } from "react";
import { useGetGeoTabZones, useGetZones } from "../hooks/useScheduleConfig";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { SelectField } from "@/components/ui/selectField";

const ZoneSelect = ({
	selected,
	onChange,
}: {
	selected: { geoTabId: string; name: string; address: string; isCurrent?: boolean; defaultValue: string }[];
	onChange: (selected: { geoTabId: string; name: string; address: string; isCurrent?: boolean }[]) => void;
}) => {
	const [search, setSearch] = useState("");
	const debounceSearch = useDebounce(search);

	const { data: zones, isFetching } = useGetGeoTabZones({ page: 1, pageSize: 10, searchValue: debounceSearch });
	const { data: bylddZones } = useGetZones();

	const bylddZonesMap = new Map(
		bylddZones?.map((zone) => {
			return [zone.geoTabId, zone];
		})
	);

	const zoneOptions = useMemo(() => {
		return (
			zones?.items?.map((zone) => ({
				value: zone.GeotabId,
				label: zone.Name,
			})) || []
		);
	}, [zones]);

	return (
		<>
			<div className="space-y-3">
				<SelectField
					label="Select Default Zone"
					placeholder="Default Zone"
					options={selected?.map((item) => ({
						value: item.geoTabId,
						label: item.name,
					}))}
					value={selected?.find((item) => item?.isCurrent)?.geoTabId}
					onValueChange={(value) => {
						onChange(
							selected.map((zone) =>
								zone.geoTabId === value ? { ...zone, isCurrent: true } : { ...zone, isCurrent: false }
							)
						);
					}}
				/>

				<MultiSelect
					label={"Select Zones"}
					placeholder={"Select Zones"}
					options={zoneOptions.map((item) => ({
						id: item.value,
						name: item.label,
					}))}
					selected={
						selected?.map((item) => ({
							id: item.geoTabId,
							name: item.name,
						})) || []
					}
					onChange={(val) =>
						onChange(
							val.map((item) => ({
								geoTabId: item.id,
								name: item.name,
								address: bylddZonesMap.get(item.id)?.address || "",
							})) || []
						)
					}
					onSearch={(value) => setSearch(value)}
					showSelected={false}
					fallbackText={"Zone not found. Please ask admin to add zone."}
					loading={isFetching}
				/>
			</div>

			<div>
				{selected?.map((item) => {
					return (
						<div
							key={item.geoTabId}
							className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_24px] items-center gap-1 rounded-[8px] px-3 py-1 text-sm"
						>
							<p className="truncate">{item.name}</p>
							<Input
								className="items-center border-none"
								placeholder="Address"
								value={item.address || undefined}
								onChange={(e) =>
									onChange(
										selected.map((zone) =>
											zone.geoTabId === item.geoTabId ? { ...zone, address: e.target.value } : zone
										)
									)
								}
							/>
							<Trash
								size={16}
								className="cursor-pointer text-brand-red"
								onClick={() => onChange(selected.filter((zone) => zone.geoTabId !== item.geoTabId))}
							/>
						</div>
					);
				})}
			</div>
		</>
	);
};

export default ZoneSelect;
