"use client"

import Input from "@/Components/input";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const Auth = () => {
    const router = useRouter();
    const [name , setName] = useState('');
    const [email , setEmail] = useState('');
    const [password , setPassword] = useState('');

    const [variant , setVariant] = useState('login');

    const toggleVariant = useCallback(() => {
        setVariant((currentVariant) => currentVariant === 'login' ? 'register' : 'login')
    } , [])

    const register = useCallback(async () => {
        try{
            await axios.post('/api/register' , {
                email,
                name,
                password
            });
            login();
        }catch(e){
            console.log(e);
        }
    } , [email , name , password]);

    const login = useCallback(async () => {
        try{
            await signIn("credentials" , {
                email,
                password,
                redirect: false,
                callbackUrl : ''
            })

            router.push('/');
        }catch(e){
            console.log(e);
        }
    } , [email , password , router])

    return(
        <div className="relative bg-slate-50 h-[100vh] w-[100vw]">
            <div className="bg-slate-600 lg:opacity-55 w-full h-full">
                <nav className="px-12 py-14">
                    <div className="h-12">NAV</div>
                </nav>

                <div className="flex justify-center">
                    <div className="bg-white bg-opacity-100 px-16 py-16 self-center mt-2 lg:w-2/5 lg:max-w-md rounded-md w-full">
                        <h1 className="text-black text-center">
                            {variant == 'login' ? 'Login' : 'Register'}
                        </h1>
                        <div className="flex flex-col gap-4">
                            {variant === 'register' && (
                                <Input 
                                    label="name"
                                    onChange={(e : any) => setName(e.target.value)}
                                    id="name"
                                    value={name}
                                />
                            )}
                                <Input 
                                    label="Email"
                                    onChange={(e : any) => setEmail(e.target.value)}
                                    id="Email"
                                    value={email}
                                />
                                <Input 
                                    label="Password"
                                    onChange={(e : any) => setPassword(e.target.value)}
                                    id="Password"
                                    value={password}
                                />
                        </div>
                        <button onClick={variant === 'login' ? login : register} className="bg-blue-600 py-3 text-white rounded-md w-full mt-10 hover:bg-red-700 transition">
                            {variant === 'login' ? 'Login' : 'Sign up'}
                        </button>
                        <button className="bg-green-500" onClick={toggleVariant}>Toggle</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth;