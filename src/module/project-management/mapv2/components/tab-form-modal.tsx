"use client";

import { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Info, Lock, Plus, X } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppTooltip } from "@/components/ui/tooltip";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { FIELD_VARIANT } from "@/components/common/form/types";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { tabFormSchema, ITabFormSchema } from "../utils/tab-schema";
import { IMapZoneTab } from "../types/zone";
import { MAP_ZONE_TYPE } from "../utils/enums";
import { useGetMapZoneTabs, useCreateMapZoneTab, useUpdateMapZoneTab } from "../hooks/useMapZoneTabs";
import { useGetMapZoneTypes } from "../hooks/useMapZoneTypes";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiChevronDown } from "react-icons/fi";
interface TabFormModalProps {
	tab?: IMapZoneTab;
	onClose: () => void;
}

const isSystemType = (id?: string) => id === MAP_ZONE_TYPE.EMPLOYEE || id === MAP_ZONE_TYPE.PROJECT;

const TabFormModal = ({ tab, onClose }: TabFormModalProps) => {
	const queryClient = useQueryClient();
	const isEditing = Boolean(tab);

	const form = useForm<ITabFormSchema>({
		resolver: zodResolver(tabFormSchema),
		defaultValues: {
			name: tab?.name ?? "",
			types: (tab?.mapZoneTypes ?? []).map((type) => ({ mapZoneTypeId: type.id, name: type.name })),
		},
	});

	const { fields, append, remove } = useFieldArray({ control: form.control, name: "types" });
	const [moveTypeId, setMoveTypeId] = useState("");

	const { data: allTabs } = useGetMapZoneTabs();
	const { data: allTypes } = useGetMapZoneTypes();

	// Snapshot of every zone type (not just this tab's) as it was when the modal opened - used both
	// to diff submitted rows (renamed? moved to this tab from another?) and to offer types that
	// belong to OTHER tabs as "move here" candidates.
	const typeById = useMemo(() => new Map((allTypes ?? []).map((type) => [type.id, type])), [allTypes]);
	const tabNameById = useMemo(() => new Map((allTabs ?? []).map((t) => [t.id, t.name])), [allTabs]);
	// Types this tab already owned when the modal opened - anything else with a `mapZoneTypeId` was
	// added via "move an existing type here" and can only be moved, not renamed in the same submit
	// (the backend applies moves as a tab reassignment only, see AdminZoneHelper.syncTabTypes).
	const ownTypeIds = useMemo(() => new Set((tab?.mapZoneTypes ?? []).map((type) => type.id)), [tab]);

	const addedTypeIds = new Set(fields.map((field) => field.mapZoneTypeId).filter(Boolean));
	const availableToMove = (allTypes ?? []).filter((type) => !isSystemType(type.id) && !addedTypeIds.has(type.id));

	const { mutateAsync: createTab, isPending: isCreatePending } = useCreateMapZoneTab();
	const { mutateAsync: updateTab, isPending: isUpdatePending } = useUpdateMapZoneTab();

	const invalidate = () => {
		void queryClient.invalidateQueries({ queryKey: ["map-zone-tabs"] });
		void queryClient.invalidateQueries({ queryKey: ["map-zone-tabs-accessible"] });
		void queryClient.invalidateQueries({ queryKey: ["map-zone-types"] });
	};

	const onSubmit = async (values: ITabFormSchema) => {
		try {
			if (isEditing && tab) {
				await updateTab({ tabId: tab.id, ...values });
			} else {
				await createTab(values);
			}

			openSuccessToast(isEditing ? "Tab updated successfully." : "Tab created successfully.");
			invalidate();
			onClose();
		} catch (error) {
			openErrorToast({ error: error as Error });
			invalidate();
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormInputWrapper
					form={form}
					fieldConfig={{
						name: "name",
						fieldVariant: FIELD_VARIANT.INPUT,
						label: "Tab Name",
						placeholder: "Enter tab name",
					}}
				/>

				<div className="space-y-2">
					<p className="text-sm font-medium text-brand-dark">Zone types in this tab</p>

					<div className="flex flex-col gap-2">
						{fields.map((field, index) => {
							const original = field.mapZoneTypeId ? typeById.get(field.mapZoneTypeId) : undefined;
							const isOwnType = Boolean(field.mapZoneTypeId) && ownTypeIds.has(field.mapZoneTypeId!);
							const isMovedIn = Boolean(field.mapZoneTypeId) && !isOwnType;
							const nameLocked = isMovedIn;
							// A type this tab already owns can only be removed via zone type management, not
							// from here - the backend never deletes a type as a side effect of editing a tab.
							const removeDisabled = isOwnType;
							const removeDisabledReason = isOwnType
								? "This type already belongs to this tab and can't be removed here - move it to another tab, or delete the type itself from zone type management."
								: undefined;
							const movingFrom =
								original && tab && original.mapZoneTabId !== tab.id
									? tabNameById.get(original.mapZoneTabId)
									: undefined;

							return (
								<div key={field.id} className="flex flex-col gap-1">
									<div className="flex items-center gap-2">
										<Input
											{...form.register(`types.${index}.name` as const)}
											disabled={nameLocked}
											placeholder="Zone type name"
											className="rounded-lg border-brand-gray text-sm"
										/>
										{nameLocked && (
											<Lock
												size={14}
												className="shrink-0 text-brand-grey"
												aria-label={"Moved zone types cannot be renamed here"}
											/>
										)}
										<button
											type="button"
											onClick={() => remove(index)}
											disabled={removeDisabled}
											aria-label="Remove zone type"
											className="shrink-0 text-brand-grey disabled:cursor-not-allowed disabled:opacity-40"
										>
											<X size={16} />
										</button>
										{removeDisabledReason && (
											<AppTooltip
												trigger={<Info size={14} className="shrink-0 cursor-help text-brand-grey" />}
												text={removeDisabledReason}
											/>
										)}
									</div>
									{movingFrom && (
										<p className="pl-1 text-xs text-brand-grey">Moving here from &quot;{movingFrom}&quot;</p>
									)}
								</div>
							);
						})}
					</div>

					{(form.formState.errors.types?.root?.message || form.formState.errors.types?.message) && (
						<p className="text-xs text-red-500">
							{form.formState.errors.types?.root?.message || form.formState.errors.types?.message}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => append({ mapZoneTypeId: undefined, name: "" })}
						>
							<Plus size={14} className="mr-1" />
							Add zone type
						</Button>

						{availableToMove.length > 0 && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant={"outline"} className="border-none bg-white shadow-sm">
										<span className="font-normal text-brand-dark50">{"Move an existing zone type here…"}</span>
										<FiChevronDown />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent align="end" className="w-max">
									{availableToMove.map((type) => {
										return (
											<DropdownMenuItem
												onClick={() => {
													if (!type) return;
													append({ mapZoneTypeId: type.id, name: type.name });
													setMoveTypeId("");
												}}
												key={type.id}
												className="flex items-center justify-between"
											>
												{type.name} — currently in {tabNameById.get(type.mapZoneTabId) ?? "—"}
											</DropdownMenuItem>
										);
									})}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>

				<div className="flex w-full gap-2">
					<Button
						onClick={onClose}
						type="button"
						variant="outline"
						className="w-full"
						disabled={isCreatePending || isUpdatePending}
					>
						Cancel
					</Button>
					<Button type="submit" variant="filled" className="w-full" disabled={isCreatePending || isUpdatePending}>
						{isEditing ? "Save changes" : "Create Tab"}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default TabFormModal;
