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
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { clearCookies, redirectUser, setEmulatedRoleCookie, setLoginCookies } from "@/module/auth/utils/helpers";
import Image from "next/image";
import { LOGIN_MODE } from "@/utils/enums";
import { loginParamKey } from "@/utils/constants";
import { FaArrowRight } from "react-icons/fa";
import { useModal } from "@/hooks/useModal";
import RoleEmulationModal from "../components/role-emulation-modal";
import { ROLES } from "@/types";

export default function LoginPage() {
	const { openModal, closeModal, Modal } = useModal();
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const router = useRouter();
	const formSchema = loginFormSchema();
	const form = useForm<UserLoginType>({
		resolver: zodResolver(formSchema),
		mode: "onChange",
	});
	const { register, handleSubmit, formState } = form;
	const { useLoginMutation, useImpersonateUserMutation } = useAuthAPI();

	const { mutate: loginMutation, isPending } = useLoginMutation;

	const { mutate: impersonateUserMutation } = useImpersonateUserMutation;

	const onSubmit = (data: UserLoginType) => {
		clearCookies();
		loginMutation(data, {
			onSuccess: (res) => {
				const { token, user } = res;

				const userType = user?.userType;

				setLoginCookies({ token, userType });
				openSuccessToast("Logged in successfully");

				const redirectRoute = redirectUser(userType);

				if (!user?.isEmulationAllowed) {
					router.replace(redirectRoute);
					return;
				}

				// Staging/Production → role emulation modal
				openModal({
					modalTitle: "View as Role",
					showDefaultClose: false, // hide X button
					closeOnOutsideClick: false, // already default, but explicit
					modalView: (
						<RoleEmulationModal
							currentRole={user.role}
							onContinue={() => {
								closeModal();
								router.replace(redirectUser(userType));
							}}
							onSelectRole={(roleId) => {
								setEmulatedRoleCookie(roleId);

								closeModal();

								router.replace(redirectUser(userType));
							}}
							onSelectUser={(userId) => {
								handleImpersonateUser(userId, userType);
							}}
						/>
					),
				});
			},

			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	const handleImpersonateUser = (userId: string, userType: ROLES) => {
		impersonateUserMutation(userId, {
			onSuccess: ({ token }) => {
				setLoginCookies({
					token,
					userType,
				});

				closeModal();

				router.replace(redirectUser(userType));
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	return (
		<div className="flex h-screen w-full flex-col lg:flex-row">
			<Modal />
			{/* Left Side Image */}
			<div className="h-full w-full min-w-[440px]"></div>
			{/* Right Side Form */}
			<div className="flex w-full items-center justify-center bg-white px-2 py-6 lg:w-1/2 lg:py-0">
				<div className="min-w-md w-full space-y-6 text-center lg:pl-4">
					<div>
						<h1 className="font-inter text-[24px] font-medium text-brand-dark md:text-[36px]">
							Login to your workspace
						</h1>
						<p className="mt-1 font-inter text-sm font-normal text-gray-500">
							Only @companyname.com emails are allowed.
						</p>
					</div>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
						<div className="space-y-1">
							<Label htmlFor="username" className="font-inter text-xs font-normal text-brand-grey">
								Username
							</Label>

							<Input
								id="username"
								type="text"
								placeholder="Enter username here"
								{...register("username")}
								className="h-10 w-full rounded-[10px] border-none bg-brand-bgLightgrey text-sm placeholder:text-gray-300 focus:border-brand-grey focus:ring-0"
							/>
						</div>
						<div className="relative space-y-1">
							<Label htmlFor="password" className="font-inter text-xs font-normal text-brand-grey">
								Password
							</Label>
							<Input
								id="password"
								placeholder="Enter password"
								type={showPassword ? "text" : "password"}
								{...register("password")}
								className="h-10 w-full rounded-[10px] border-none bg-brand-bgLightgrey text-sm placeholder:text-gray-300 focus:border-brand-grey focus:ring-0"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-9 -translate-y-1/2 self-center text-gray-500 sm:top-10"
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
							</button>
						</div>

						<div className="flex items-center justify-between gap-1">
							{/* Left: Remember Me */}
							<div className="flex items-center space-x-2">
								<Checkbox
									id="remember"
									checked={rememberMe}
									onCheckedChange={(v) => setRememberMe(v === true)}
									className="h-4 w-4 rounded-[2px] border-2 border-brand-dark"
								/>
								<Label
									htmlFor="remember"
									className="items-center font-inter text-[10px] font-normal text-brand-grey sm:text-sm"
								>
									Remember me
								</Label>
							</div>

							{/* Right: Subcontractor Link */}
							<Button
								type="button"
								onClick={() => {
									const params = new URLSearchParams(window.location.search);
									params.set(loginParamKey, LOGIN_MODE.SUB_CONTRACTOR_CREW_LEADER);
									router.replace(`?${params.toString()}`);
								}}
								className="flex items-center gap-2 rounded-none px-0 font-inter text-[10px] font-normal text-brand-grey shadow-none hover:border-b hover:border-brand-grey hover:bg-none hover:pb-[1px] sm:text-sm"
							>
								Login as Sub-Contractor Crew Leader
								<FaArrowRight />
							</Button>
						</div>

						<div className="mt-10 py-8">
							<Button
								type="submit"
								className="w-full rounded-[10px] bg-black font-inter text-sm font-semibold text-white hover:bg-black/80"
								disabled={!formState.isValid || isPending}
							>
								{isPending ? "Logging in..." : "Login"}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
