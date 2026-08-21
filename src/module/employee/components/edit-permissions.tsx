import { Button } from "@/components/ui/button";
import { FiEdit } from "react-icons/fi";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";

interface Props {
	isEditing: boolean;
	isSaving?: boolean;

	onEdit(): void;
	onDiscard(): void;
	onSave(): void;
}

const EditPermissions = ({ isEditing, isSaving, onEdit, onDiscard, onSave }: Props) => {
	return (
		<WriteAccessWrapper>
			{!isEditing ? (
				<Button variant="ghost" size="icon" className="size-8" onClick={onEdit}>
					<FiEdit className="!size-5" />
				</Button>
			) : (
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={onDiscard} disabled={isSaving} className="h-9 rounded-[8px]">
						Discard
					</Button>

					<Button variant="filled" onClick={onSave} loading={isSaving} className="h-9 rounded-[8px]">
						Save Changes
					</Button>
				</div>
			)}
		</WriteAccessWrapper>
	);
};

export default EditPermissions;
