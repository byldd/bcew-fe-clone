import AuthWrapper from "@/module/auth/components/auth-wrapper";
import EmployeeSignInForm from "@/module/auth/templates/login-form";
export default function SignInPage() {
	return (
		<AuthWrapper title={""}>
			<EmployeeSignInForm />
		</AuthWrapper>
	);
}
