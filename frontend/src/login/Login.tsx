import { Link, useNavigate } from "react-router-dom";
import endpoint from "@/endpoints.json";

import googleIcon from "@/image/google.svg";
import fortytwoIcon from "@/image/42.svg";
import passwordIcon from "@/image/password.svg";
import userIcon from "@/image/user.svg";
import { z } from "zod";
import { toast, Toaster } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import api from "@/api/api";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types/types";



interface InputProps {
    type: string;
    icon?: string;
    label: string;
    name: string;
    placeholder: string;

}
interface IUserLoginInfo {
    username: string;
    password: string;
}
const Logo = ({ source }: { source: string }) => {
    return (
        <div className="border  border-gray-200 rounded-xl w-[40%] h-[70%] text-center">
            <img src={source} alt="logo" className="w-full h-full" />
        </div>
    );
}

const Input = ({ type, label, name, placeholder }: InputProps) => {

    return (

        <div className="flex flex-col items-center justify-center h-[30%] w-full " >
            <label className="w-[82%] mb-1 font-bold"> {name}</label>
            <input
                type={type}
                className="border  w-[82%] h-[60%] rounded bg-gray-100 border-gray-200 p-4"
                placeholder={placeholder}
                id={label}
                name={label}
                required
            />
        </div >
    )
}
const validateLogin = (data: IUserLoginInfo): boolean => {

    const userSchema = z.object({
        username: z
            .string()
            .min(3, 'Username must be at least 3 characters long')
            .max(16, 'Username cannot exceed 16 characters')
            .regex(/^\S+$/, 'Username cannot contain whitespace'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters long')
            .max(24, 'Password cannot exceed 24 characters')
            .regex(/^\S+$/, 'Password cannot contain whitespace'),
    });

    const result = userSchema.safeParse(data);
    if (result.success) {
        return true;
    }

    for (const issue of result.error.issues) {
        toast.error(
            issue.message, {
            duration: 5000,
            position: "top-right",
            style: {
                width: "300px",
            },
        });
    }
    return false;
}

export default function Login() {

    const { isAuthenticated, isLoading, setAuth } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate("/home");
        }
    }, [isAuthenticated, navigate, isLoading]);

    if (isLoading) {
        return null
    }


    const { mutate: Login, isPending } = useMutation({
        mutationFn: async (userData: IUserLoginInfo) => {
            const response = await api.post(endpoint.auth.login, userData);
            return response.data;
        },
        onSuccess: async (response: { message: string, user: User }) => {
            toast.success(response.message);
            setAuth(true);
            // login(response.user);
        },
        onError: async (error: any) => {
            toast.error(error.response?.data?.message || "Internal Server Error");
        },
    });

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        const userData: IUserLoginInfo = {
            username: data["username"] as string,
            password: data["password"] as string,
        };

        if (validateLogin(userData)) {
            Login(userData);
            if (isPending) {
                toast.loading("Loading...");
            }
        }
    }
    return (
        <>
            <div>
                <Toaster
                    toastOptions={{
                        duration: 5000,
                        position: "top-right",
                        style: {
                            width: "300px",
                        },
                    }}
                />
            </div>

            <div className=" flex flex-col items-center justify-center h-screen w-screen bg-gray-100 m-0 p-0">
                <form onSubmit={submitForm} className="flex flex-col items-center bg-white rounded-2xl gap-4 shadow-md h-155 w-120  border border-gray-200">
                    <div className="gap-4 w-full text-center mt-8">
                        <p className="m-2 font-extrabold text-2xl"> Welcome back</p>
                        <p className=" text-balance text-muted-foreground">
                            Login to your account
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center h-[50%] w-full border-b" >
                        <Input type={"text"} icon={userIcon} label="username" name="Username" placeholder="Enter your username" />
                        <Input type={"password"} icon={passwordIcon} label="password" name="Password" placeholder="Enter your Password" />

                        <button
                            type="submit"
                            className="border w-[85%] mt-8 text-white font-bold rounded m-0 h-[13%] bg-gray-900 hover:bg-gray-800"
                        >
                            Login
                        </button >
                    </div>
                    <p className="font-bold"> Don't have an account? <Link to="/" className="text-blue-500 hover:underline">Sign Up</Link></p>

                    <div className="flex flex-col items-center w-full h-[20%]">
                        <p className="text-gray-400 font-bold"> Or login with</p>
                        <div className="flex flex-row gap-8 justify-center items-center w-full h-[60%]">
                            <Logo source={googleIcon} />
                            <Logo source={fortytwoIcon} />
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
