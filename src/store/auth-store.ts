import { IAuthStore, UserType } from "@/module/profile/types";
import { create } from "zustand";

const useAuthStore = create<IAuthStore>((set) => ({
	user: null,
	subcontractorCrew: null,
	setUser: (user: UserType["data"]["user"]) => set({ user }),
	setSubcontractorCrew: (subcontractorCrew: UserType["data"]["subContractorCrew"]) => set({ subcontractorCrew }),
}));

export default useAuthStore;
