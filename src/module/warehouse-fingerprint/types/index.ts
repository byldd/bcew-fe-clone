export interface IWarehouseEmployee {
	id: string;
	name: string;
	roleId: string | null;
	teamId: string | null;
	status: number;

	role: {
		id: string;
		name: string;
	} | null;

	team: {
		id: string;
		name: string;
	} | null;
}

export type IWarehouseEmployeeResponse = IWarehouseEmployee[];

export interface IWarehouseEmployeeSearchQuery {
	searchValue?: string;
	roleId?: string;
	status?: number;
}

export interface IEnrollFingerprintPayload {
	template: string;
	userId: string;
}
export interface IEnrolledFingerprint {
	id: string;
}

export interface IEnrolledStatus {
	userId: string;
	fingerprints: IEnrolledFingerprint[];
	count: number;
}

export const TOTAL_FINGERS = 2;

export interface Props {
	employees: IWarehouseEmployee[];

	selectedEmployee:
		| (IWarehouseEmployee & {
				fingerprints?: {
					id: string;
				}[];
		  })
		| null;

	onClose: () => void;

	onSuccess: () => void;
}

export const EMPTY_FINGERPRINTS: { id: string }[] = [];
