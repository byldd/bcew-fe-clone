import { create } from "zustand";

type ModalState = {
	[key: string]: boolean;
};

interface ModalPayload {
	header?: string;
	text?: string;
}

type ModalStore = {
	modals: ModalState;
	modalData: Record<string, ModalPayload | undefined>;
	openModal: (modalId: string, data?: ModalPayload) => void;
	closeModal: (modalId: string) => void;
	isOpen: (modalId: string) => boolean;
};

export const useModalStore = create<ModalStore>((set, get) => ({
	modals: {},
	modalData: {},
	openModal: (modalId: string, data?: ModalPayload) =>
		set((state) => ({
			modals: { ...state.modals, [modalId]: true },
			modalData: data ? { ...state.modalData, [modalId]: data } : state.modalData,
		})),
	closeModal: (modalId: string) =>
		set((state) => ({
			modals: { ...state.modals, [modalId]: false },
			modalData: { ...state.modalData, [modalId]: undefined },
		})),
	isOpen: (modalId: string) => get().modals[modalId] || false,
}));
