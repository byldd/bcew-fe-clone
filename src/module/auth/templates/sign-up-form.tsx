"use client";

import { routes } from "@/config/routes";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import type { NSignUpApiResponseType } from "@/types";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { isPasswordValid, setCookies } from "@/module/auth/utils/helpers";
import { useEffect } from "react";
import { redirectUser } from "@/module/auth/utils/helpers";
import { TokenProviderProps } from "@/module/auth/types";
import { InputField } from "@/components/ui/inputField";
import { Button } from "@/components/ui/button";

export default function SignUpForm() {
	const router = useRouter();
	const { useAcceptInvite, useGetEmailsFromTokenMutation } = useAuthAPI();
	const { mutate: getEmailsFromToken } = useGetEmailsFromTokenMutation;
	const { useRegisterMutation } = useAuthAPI();
	const [token, setToken] = useState<string | null>(null);
	const [error] = useState("");
	// TODO:
	// const [setError] = useState(""); // This state is not used in the original code, consider removing it
	const [userData, setUserData] = useState({
		name: {
			first: "",
			last: "",
		},
		email: "",
		password: "",
		confirmPassword: "",
	});
	// const [showPassword, setShowPassword] = useState(false);

	// TODO:
	// const handlePasswordVisibility = () => setShowPassword(!showPassword);

	// const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// TODO:
	// const handleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
	const [, setIsTokenExpiredError] = useState(false);

	const isButtonDisabled = !userData.name.first || !userData.name.last || !Object.values(userData).every(Boolean);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		if (name === "first" || name === "last") {
			setUserData({
				...userData,
				name: {
					...userData.name,
					[name]: value,
				},
			});
		} else {
			setUserData({
				...userData,
				[name]: value,
			});
		}
	};

	useEffect(() => {
		if (token) {
			getEmailsFromToken(
				{ inviteToken: token },
				{
					onSuccess: (data) => {
						setUserData((prevUserData) => ({
							...prevUserData,
							email: data.data,
						}));
					},
					onError: () => {
						setIsTokenExpiredError(true);
						toast.error(<p>Your token has expired. Please request a new invitation.</p>, { duration: 4000 });
					},
				}
			);
		}
	}, [token, getEmailsFromToken]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (userData.password !== userData.confirmPassword) {
			toast.error(<p>Passwords do not match.</p>, {
				duration: 2000,
			});
			return;
		}

		if (!isPasswordValid(userData.password)) {
			toast.error(<p>Password must be at least 8 characters and include letters, numbers, and special characters.</p>, {
				duration: 2000,
			});
			return;
		}

		if (token) {
			const updatedUserData = { ...userData, inviteToken: token };
			setUserData(updatedUserData);
			useAcceptInvite.mutate(updatedUserData, {
				onSuccess: (data) => {
					const {
						user: { roles, companyRef },
					} = data;
					setCookies({ user: { roles, companyRef } });
					toast.success(<p>Registration completed for invited user.</p>, {
						duration: 1000,
					});

					const redirectRoute = redirectUser(data.user.roles);
					router.replace(redirectRoute);
				},
				onError: (err) => {
					const axiosError = err as AxiosError<NSignUpApiResponseType>;
					toast.error(<p>{axiosError?.response?.data?.message}</p>, {
						duration: 2000,
					});
				},
			});
		} else {
			useRegisterMutation.mutate(userData, {
				onSuccess: (data) => {
					const {
						user: { roles, companyRef },
					} = data;
					setCookies({ user: { roles, companyRef } });
					toast.success(<p>Registration successful.</p>, {
						duration: 2000,
					});
					const redirectRoute = redirectUser(data.user.roles);
					router.replace(redirectRoute);
				},
				onError(error) {
					const axiosError = error as AxiosError<NSignUpApiResponseType>;
					if (axiosError.response && axiosError.response?.data && axiosError.response.data.message) {
						toast.error(<p>{axiosError.response.data.message}</p>, {
							duration: 2000,
						});
					} else {
						toast.error(<p>An unexpected error occurred.</p>, {
							duration: 2000,
						});
					}
				},
			});
		}
	};

	return (
		<>
			<Suspense fallback={null}>
				<TokenProvider setToken={setToken} />
			</Suspense>

			<form onSubmit={(e) => handleSubmit(e)}>
				<div className="grid gap-5">
					<div className="grid grid-cols-2 gap-2">
						<div className="col-span-1">
							<InputField
								id="first-name"
								label="First Name"
								name="first"
								type="text"
								value={userData.name.first}
								onChange={handleInputChange}
								placeholder="first name"
								error={error}
							/>
						</div>
						<div className="col-span-1">
							<InputField
								id="last-name"
								label="Last Name"
								name="last"
								type="text"
								value={userData.name.last}
								onChange={handleInputChange}
								placeholder="last name"
								error={error}
							/>
						</div>
					</div>
					<div className="grid gap-2">
						<InputField
							id="email"
							label="Email"
							name="email"
							type="email"
							value={userData.email}
							onChange={handleInputChange}
							placeholder="email"
							error={error}
						/>
					</div>
					<div className="grid gap-2">
						<InputField
							id="password"
							label="Password"
							name="password"
							type="password"
							value={userData.password}
							onChange={handleInputChange}
							placeholder="password"
							error={error}
						/>
					</div>
					<div className="grid gap-2">
						<InputField
							label="Confirm Password"
							name="confirmPassword"
							id="confirm-password"
							type="password"
							placeholder="confirm password"
							value={userData.confirmPassword}
							onChange={handleInputChange}
							error={error}
						/>
					</div>
					<Button type="submit" variant="filled" className="w-full" disabled={isButtonDisabled}>
						Get Started
					</Button>
				</div>
				<div className="mt-6 text-center text-sm">
					Have an account?{" "}
					<Link href={routes.signIn} className="underline underline-offset-4">
						{" "}
						Sign In
					</Link>
				</div>
			</form>
		</>
	);
}

function TokenProvider({ setToken }: TokenProviderProps) {
	const searchParams = useSearchParams();
	const token = searchParams.get("inviteToken");

	useEffect(() => {
		setToken(token);
	}, [token, setToken]);

	return null;
}
