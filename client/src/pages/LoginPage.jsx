import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { getAvatar } from "../utils/getAvatar";
import { getCookie } from "../utils/getCookie";
import { getEmail } from "../utils/getEmail";
import { isTokenExpired } from "../utils/isTokenExpired";


const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [remember_me, setRemember_me] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isTokenExpired(getCookie('token'))) navigate("/home");
    },[])


    const handleLogin = () => {
        setLoading(true);
        fetch('/api/login',{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username:username,
                    password:password,
                    avatar_url:username,
                    remember_me:remember_me
                })
        }).then(
            (response) => {
                console.log(response);
                return response.json();
            }
        ).then(
            (data) => {
                console.log(data);
                if (data.user_found === false){
                    toast.error("User not found");
                }else if(data.password_match === false||data.password_match == null){
                    toast.error("Incorrect Password")
                }else{
                    localStorage.setItem("avatar", getAvatar(getCookie('token')));
                    localStorage.setItem("email", getEmail(getCookie('token')));

                    navigate("/home");
                }
                setLoading(false);
            }
        ).catch(
            (err) =>{
                toast.error("Problem occurred with the server");
                setLoading(false);
                console.log(err);
            }
        )
        
    }   

    return (
        <div className="bg-gradient-to-b from-blue-900 to-purple-700">
            <div className="relative flex flex-col justify-center min-h-screen overflow-hidden mx-8">
                <div className="w-full p-6 m-auto bg-zinc-900 rounded-md shadow-md lg:max-w-xl">
                    <h1 className="text-3xl font-semibold text-center text-white">
                    Log in
                    </h1>
                    <br/>
                    <hr className="border-zinc-700"/>
                    <form className="mt-6">
                        <div className="mb-2">
                            <label className="block text-sm font-semibold text-gray-100">
                                Username
                            </label>
                            <input
                                type="text"
                                className="block w-full px-4 py-2 mt-2 
                                text-black bg-white border rounded-md focus:border-purple-600 
                                focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-sm font-semibold text-gray-100">
                                Password
                            </label>
                            <input
                                type="password"
                                className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-purple-600 focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        
                    
                        <Link to='/forgot-password' className="text-xs text-gray-300 hover:underline focus:text-purple-600">
                            Forget Password?
                        </Link>

                        <div className="block text-sm font-semibold text-gray-100">
                        <input type="checkbox" className="accent-purple-500"
                            onChange={(e) => {setRemember_me(e.target.checked); console.log(e.target.checked);}}
                        /> Remember Me

                        </div>
                        <div className="mt-6">
                        
                            {
                                !loading?
                                <button 
                                    className="w-full px-4 py-2 tracking-wide text-black transition-colors 
                                    duration-200 transform bg-gray-200 rounded-md hover:bg-gray-500 
                                    focus:outline-none focus:bg-purple-600 disabled:bg-zinc-500"
                                    onClick={handleLogin}
                                    type="button"
                                    disabled={username===''||password===''}
                                >
                                    Login
                                </button>:
                                <Spinner className='text-purple-600'/>
                                }
                        </div>
                    </form>

                    <p className="mt-8 text-xs font-light text-center text-white">
                        {" "}
                        Don&apos;t have an account? {" "}
                        <Link
                            to="/register"
                            className="font-medium text-black-600 hover:underline focus:text-purple-600"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
export default Login;