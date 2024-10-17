import { useState } from "react";
import Spinner from "../components/Spinner";
import { isTokenExpired } from "../utils/isTokenExpired";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const resetPassword = async () => {
        setLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const reset_token = urlParams.get('reset-token');
        
        if(!isTokenExpired(reset_token)){
            fetch('/api/reset-password',{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        reset_token:reset_token,
                        password:password
                    })
            }).then(
                (response) => {
                    if(response.ok){
                        toast.dark("Successfully reset password");
                        navigate("/");
                    }else{
                        toast.error("Something when wrong while trying to reset password");
                    }
                    setLoading(false);
                }
            )
        }else{
            toast.error("This link has expired please request a new one to reset password");
            setLoading(false);
        }
    }
    
    return ( 
        <div className="bg-gradient-to-b from-blue-900 to-purple-700">
            <div className="relative flex flex-col justify-center min-h-screen overflow-hidden mx-8 ">
                <div className="w-full p-6 m-auto bg-zinc-900 rounded-md shadow-md lg:max-w-xl">
                    <h1 className="text-3xl font-semibold text-center text-white">
                        Reset Password
                    </h1>
                    <br/>
                    <hr className="border-zinc-700"/>
                    <form className="mt-6">
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
                                onClick={resetPassword}
                                type='button'
                                disabled={password===''||password!==rePassword}
                            >
                                Reset Password    
                            </button>:
                            <Spinner className="text-purple-600"/>
                           }
                        </div>
                    </form>
                </div>
            </div>
        </div>
     );
}
 
export default ResetPasswordPage;