import { RoleFormValues } from "@/module/employee/utils/role-form-schema";
import { Switch } from "@/components/ui/switch";
import { useFormContext } from "react-hook-form";

const RoleMapZoneTabPermissions = ({ disabled }: { disabled?: boolean }) => {
	const formContext = useFormContext<RoleFormValues>();
	const { roleMapZoneTabPermissions } = formContext.watch();

	return (
		<div className="space-y-2 pt-4">
			<p className="text-sm font-semibold text-brand-dark">Map Tabs Access</p>
			<div className="flex flex-wrap gap-2">
				{(roleMapZoneTabPermissions ?? []).map((tab, index) => (
					<div key={tab.mapZoneTabId} className="flex items-center gap-2 rounded-lg py-1.5 pl-3 pr-2">
						<span className="text-sm font-medium text-brand-dark">{tab.mapZoneTabName}</span>
						<Switch
							disabled={disabled}
							checked={tab.isVisible}
							onCheckedChange={(checked) =>
								formContext.setValue(`roleMapZoneTabPermissions.${index}.isVisible`, checked)
							}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default RoleMapZoneTabPermissions;
