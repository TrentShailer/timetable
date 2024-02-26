import { Button, Icon, useToast } from "@chakra-ui/react";
import { useGoogleLogin } from "@react-oauth/google";
import { HiOutlineArrowRight } from "react-icons/hi";
import axios from "axios";
import { User } from "../../utils/types";
import { useLocation } from "wouter";
import { useAtom } from "jotai";
import { userAtom } from "../../utils/state";
import { useState } from "react";
import { get_error_description } from "../../utils/errors";

export default function Login() {
	const toast = useToast();
	const [, setLocation] = useLocation();
	const [, setUser] = useAtom(userAtom);
	const [loading, setLoading] = useState(false);

	const onSuccess = async (code: string) => {
		try {
			const response = await axios.post<User>("/auth/google", {
				code,
			});

			setUser(response.data);
			setLocation("/home");
		} catch (error) {
			console.error(error);
			const toast_description = get_error_description(error);
			toast({
				title: "Failed to authenticate with server",
				description: toast_description,
				status: "error",
				duration: 5000,
			});
		} finally {
			setLoading(false);
		}
	};

	const login = useGoogleLogin({
		onSuccess: async ({ code }) => {
			onSuccess(code);
		},
		onError: async () => {
			setLoading(false);
		},
		onNonOAuthError: async () => {
			setLoading(false);
		},
		flow: "auth-code",
	});

	return (
		<Button
			isLoading={loading}
			w="100%"
			rightIcon={<Icon boxSize="5" as={HiOutlineArrowRight} />}
			colorScheme="purple"
			onClick={() => {
				setLoading(true);
				login();
			}}
		>
			Get Started
		</Button>
	);
}
