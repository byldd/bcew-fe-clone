"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { loginFormSchema, type UserLoginType } from "@/module/auth/types";
import { ROLES } from "@/types";
import { clearCookies, redirectUser, setLoginCookies } from "@/module/auth/utils/helpers";
import Image from "next/image";
import { openErrorToast, openSuccessToast } from "@/components/toast";

export default function EmployeeSignInForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const router = useRouter();
	const formSchema = loginFormSchema();
	const form = useForm<UserLoginType>({
		resolver: zodResolver(formSchema),
		mode: "onChange",
	});
	const { register, handleSubmit, formState } = form;
	const { errors, isValid } = formState;
	const { useLoginMutation } = useAuthAPI();
	const { mutate: loginMutation, isPending } = useLoginMutation;
	const onSubmit = (data: UserLoginType) => {
		clearCookies();
		loginMutation(
			{ ...data, userType: ROLES.TECHNICIAN_EMPLOYEE },
			{
				onSuccess: (res) => {
					const { token } = res;
					setLoginCookies({ token, userType: ROLES.TECHNICIAN_EMPLOYEE });
					openSuccessToast("Logged in successfully");
					const redirectRoute = redirectUser(ROLES.TECHNICIAN_EMPLOYEE);
					router.replace(redirectRoute);
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};
	return (
		<div
			className="relative flex min-h-[95vh] flex-col items-center bg-cover bg-center"
			style={{ backgroundImage: "url('/assets/png/signin-bg.png')" }}
		>
			<div className="absolute inset-0 bg-black/70 bg-opacity-70"></div>
			{/* Logo  */}
			<div className="relative z-10 my-12">
				<Image src="/assets/png/logo.png" alt="Company Logo" width={170} height={170} />
			</div>
			{/* Middle content */}
			<div className="relative z-10 flex w-full max-w-md flex-col px-6 py-6">
				<div className="my-6 text-center">
					<p className="my-2 text-[20px] font-normal text-white">Login to your workspace</p>
					<p className="text-xs font-normal text-white/80">Only @companyname.com emails are allowed.</p>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
					<div className="space-y-1">
						<Label htmlFor="username" className="font-inter text-xs font-normal text-white">
							Username
						</Label>
						<Input
							id="username"
							type="text"
							placeholder="Enter username here"
							{...register("username")}
							className="w-full rounded-[10px] bg-white"
						/>
						{errors.username && <p className="pt-1 text-xs text-red-500">{errors.username.message}</p>}
					</div>
					<div className="relative space-y-1">
						<Label htmlFor="password" className="font-inter text-xs font-normal text-white">
							Password
						</Label>
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="Enter password"
							{...register("password")}
							className="w-full rounded-[10px] bg-white"
						/>
						{errors.password && <p className="pt-1 text-xs text-red-500">{errors.password.message}</p>}
						<Button
							type="button"
							size="icon"
							className="absolute right-2 top-11 -translate-y-1/2 transform text-brand-dark"
							onClick={() => setShowPassword((prev) => !prev)}
							tabIndex={-1}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{showPassword ? (
								<Eye size={20} className="text-brand-lightgrey" />
							) : (
								<EyeOff size={20} className="text-brand-lightgrey" />
							)}
						</Button>
					</div>
					<div className="flex items-center justify-between !font-inter text-xs font-normal text-white">
						<Label className="flex cursor-pointer items-center gap-2 text-xs text-white">
							<Checkbox
								checked={rememberMe}
								onCheckedChange={(val) => setRememberMe(val === true)}
								className="h-4 w-4 rounded-[2px] border-2 border-white text-white"
								id="remember-me"
							/>
							Remember me
						</Label>
					</div>
					{/* Submit Button */}
					<div className="pt-4">
						<Button type="submit" className="w-full bg-white" disabled={!isValid || isPending}>
							{isPending ? "Logging in..." : "Sign In"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
