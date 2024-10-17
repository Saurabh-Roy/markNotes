import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [loading,setLoading] = useState(false);
    const navigate = useNavigate();
    const sendActivationEmail = async () => {
        setLoading(true);
        fetch('/api/activate-email',{
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username:username,
                email:email,
                password:password,
                avatar_url:':)'
            })
        }).then(
            (response) => {
                if(response.status === 409){
                    toast.error("Username or Email is taken");
                    setLoading(false);
                }else{
                    toast.dark("Sent Verification email");

                    navigate('/');
                }
            }
        ).catch(
            () => {
                toast.error("Error sending email");
            }
        );
    }
    return ( 
        <div className="bg-gradient-to-b from-blue-900 to-purple-700">
            <div className="relative flex flex-col justify-center min-h-screen overflow-hidden mx-8 ">
                <div className="w-full p-6 m-auto bg-zinc-900 rounded-md shadow-md lg:max-w-xl">
                    <h1 className="text-3xl font-semibold text-center text-white">
                        Sign up
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
                                className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-purple-600 
                                focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-sm font-semibold text-gray-100">
                                Email
                            </label>
                            <input
                                type="text"
                                className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-purple-600 
                                focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {/* <br/> */}
                        <br/>
                        <div className="mb-2">
                            <label className="block text-sm font-semibold text-gray-100">
                                Password
                            </label>
                            <input
                                type="password"
                                className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md focus:border-purple-600 
                                focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-sm font-semibold text-gray-100">
                                Re-enter Password
                            </label>
                            <input
                                type="password"
                                className="block w-full px-4 py-2 mt-2 text-black bg-white border rounded-md 
                                focus:border-purple-600 
                                focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                value={rePassword}
                                onChange={(e) => setRePassword(e.target.value)}
                            />
                        </div>
                        {(password!==rePassword)&&<p className="text-red-500">*Passwords must match</p>}
                        <hr className="border-zinc-900"/>
                        <div className="mt-6">
                           {!loading?<button 
                                className="w-full px-4 py-2 tracking-wide text-black transition-colors 
                                duration-200 transform bg-gray-200 rounded-md hover:bg-gray-500 
                                focus:outline-none focus:bg-purple-600
                                disabled:bg-zinc-500"
                                onClick={sendActivationEmail}
                                type='button'
                                disabled={username===''||email===''||password===''||password!==rePassword}
                            >
                                Sign up    
                            </button>:
                            <Spinner className="text-purple-600"/>
                           }
                        </div>
                    </form>
                    <p className="mt-8 text-xs font-light text-center text-white">
                        Already have an account?{" "}
                        <Link
                            to="/"
                            className="font-medium text-black-600 hover:underline focus:text-purple-600"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
     );
}
 
export default RegisterPage;