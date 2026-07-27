"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Shuffle } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormInputWrapper } from "@/components/common/form/form-input-wrapper";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import type { IOptions } from "@/components/common/form/types";
import { zoneTypeFormSchema, IZoneTypeFormSchema } from "../utils/zone-type-schema";
import { buildZoneTypeFields } from "../utils/zone-type-fields";
import { useGetAccessibleMapZoneTabs } from "../hooks/useMapZoneTabs";
import { useCreateMapZoneType, useUpdateMapZoneType } from "../hooks/useMapZoneTypes";
import { MAP_ZONE_TYPE } from "../utils/enums";
import { IMapZoneType } from "../types/zone";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiChevronDown } from "react-icons/fi";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils/utils";

interface ZoneTypeFormModalProps {
	type?: IMapZoneType;
	onClose: () => void;
}

const randomHexColor = () =>
	`#${Math.floor(Math.random() * 0xffffff)
		.toString(16)
		.padStart(6, "0")}`;

const isSystemTypeId = (id?: string) => id === MAP_ZONE_TYPE.EMPLOYEE || id === MAP_ZONE_TYPE.PROJECT;

// A quick, standalone way to add/edit a single zone type - editing a type's tab-membership as a
// batch (moving several types around) still happens through the owning tab's edit form
// (tab-form-modal.tsx).
const ZoneTypeFormModal = ({ type, onClose }: ZoneTypeFormModalProps) => {
	const queryClient = useQueryClient();
	const isEditing = Boolean(type);
	const isSystemType = isSystemTypeId(type?.id);

	const { data: tabs } = useGetAccessibleMapZoneTabs();
	const { mutate: createType, isPending: isCreating } = useCreateMapZoneType();
	const { mutate: updateType, isPending: isUpdating } = useUpdateMapZoneType();

	const form = useForm<IZoneTypeFormSchema>({
		resolver: zodResolver(zoneTypeFormSchema),
		defaultValues: {
			name: type?.name ?? "",
			mapZoneTabId: type?.mapZoneTabId ?? "",
			color: type?.color ?? randomHexColor(),
		},
	});

	const color = form.watch("color");

	const tabOptions: IOptions[] = useMemo(() => (tabs ?? []).map((tab) => ({ value: tab.id, label: tab.name })), [tabs]);

	const invalidate = () => {
		void queryClient.invalidateQueries({ queryKey: ["map-zone-tabs"] });
		void queryClient.invalidateQueries({ queryKey: ["map-zone-tabs-accessible"] });
		void queryClient.invalidateQueries({ queryKey: ["map-zone-types"] });
		void queryClient.invalidateQueries({ queryKey: ["map-zones"] });
	};

	const onSubmit = (values: IZoneTypeFormSchema) => {
		const onSuccess = () => {
			openSuccessToast(isEditing ? "Zone type updated successfully." : "Zone type created successfully.");
			invalidate();
			onClose();
		};
		const onError = (error: Error) => openErrorToast({ error });

		if (isEditing && type) {
			// System types can't be renamed or moved to another tab (§2.2) - only send color for them.
			const payload = isSystemType
				? { color: values.color }
				: { name: values.name, mapZoneTabId: values.mapZoneTabId, color: values.color };
			updateType({ typeId: type.id, ...payload }, { onSuccess, onError });
		} else {
			createType(values, { onSuccess, onError });
		}
	};

	const isSubmitting = isCreating || isUpdating;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{buildZoneTypeFields(tabOptions, isSystemType).map((fieldConfig) => (
					<FormInputWrapper key={fieldConfig.name} form={form} fieldConfig={fieldConfig} />
				))}

				<FormField
					name={"mapZoneTabId"}
					control={form.control}
					render={({ field, fieldState }) => (
						<FormItem data-invalid={fieldState.invalid} className={cn("gap-1.5")}>
							<div>
								<div className="space-y-0.5">
									<FormLabel htmlFor={field.name} className="font-inter text-sm font-normal text-brand-grey">
										{"Select Tab"}
									</FormLabel>
								</div>
								<FormControl>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant={"outline"} className="border-none bg-white shadow-sm">
												{field.value ? (
													<span className="font-normal text-brand-dark80">
														{tabOptions?.find((t) => t.value === field.value)?.label}
													</span>
												) : (
													<span className="font-normal text-brand-dark50">{"Select a tab"}</span>
												)}

												<FiChevronDown />
											</Button>
										</DropdownMenuTrigger>

										<DropdownMenuContent align="end" className="w-max">
											{tabOptions.map((tab) => {
												return (
													<DropdownMenuItem
														onClick={() => {
															field.onChange(tab.value);
														}}
														key={tab.value}
														className="flex items-center justify-between"
													>
														{tab.label}
													</DropdownMenuItem>
												);
											})}
										</DropdownMenuContent>
									</DropdownMenu>
								</FormControl>
							</div>

							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-1">
					<p className="text-sm font-medium text-brand-dark">Color</p>
					<div className="flex items-center gap-2">
						<span
							className="h-8 w-8 flex-shrink-0 rounded-full border border-brand-dark10"
							style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(color) ? color : undefined }}
						/>
						<Input
							value={color}
							onChange={(e) => form.setValue("color", e.target.value, { shouldValidate: true })}
							placeholder="#3B82F6"
							className="rounded-lg border-brand-gray text-sm"
						/>
						<button
							type="button"
							onClick={() => form.setValue("color", randomHexColor(), { shouldValidate: true })}
							aria-label="Randomize color"
							className="shrink-0 text-brand-grey hover:text-brand-dark"
						>
							<Shuffle size={16} />
						</button>
					</div>
					{form.formState.errors.color && <p className="text-xs text-red-500">{form.formState.errors.color.message}</p>}
				</div>

				<div className="flex w-full gap-2">
					<Button
						onClick={onClose}
						type="button"
						key="cancel"
						variant="outline"
						className="w-full"
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" variant="filled" className="w-full" disabled={isSubmitting}>
						{isEditing ? "Save changes" : "Create zone type"}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default ZoneTypeFormModal;
