import { createContext, useContext } from "react";
import { IRolePagePermission } from "../types/sideb-bar-page";

interface IPageAccessContext {
	pageAccess: IRolePagePermission | null | undefined;
}

const PageAccessContext = createContext<IPageAccessContext>({
	pageAccess: null,
});

const useAdminPageAccessContext = () => {
	return useContext(PageAccessContext);
};

const AdminSidebBarProvider = ({
	children,
	pageAccess,
}: {
	children: React.ReactNode;
	pageAccess: IRolePagePermission | null | undefined;
}) => {
	return <PageAccessContext.Provider value={{ pageAccess }}>{children}</PageAccessContext.Provider>;
};

export { AdminSidebBarProvider, useAdminPageAccessContext };
