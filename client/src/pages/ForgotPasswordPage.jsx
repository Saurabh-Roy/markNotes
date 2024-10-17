import { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading,setLoading] = useState(false);
    const navigate = useNavigate();

    const requestEmail = async () => {
        setLoading(true);
        fetch('/api/send-reset-password-email',{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email:email
                })
        }).then(
            response =>{
                if(response.ok){
                    toast.dark('Reset password email sent');
                }

                setLoading(false);
                navigate("/");
            }
        )
    }
    return ( 
        <div className="bg-gradient-to-b from-blue-900 to-purple-700">
            <div className="relative flex flex-col justify-center min-h-screen overflow-hidden mx-8">
                <div className="w-full p-6 m-auto bg-zinc-900 rounded-md shadow-md lg:max-w-xl">
                    <h1 className="text-3xl font-semibold text-center text-white">
                    Forgot Password?
                    </h1>
                    <br/>
                    <hr className="border-zinc-700"/>
                    <form className="mt-6">
                        <div className="mb-2">
                            <label className="block text-sm font-semibold text-gray-100">
                                Enter your email address:
                            </label>
                            <input
                                type="text"
                                className="block w-full px-4 py-2 mt-2 
                                text-black bg-white border rounded-md focus:border-purple-600 
                                focus:ring-purple-500 focus:outline-none focus:ring focus:ring-opacity-60"
                                value={email}
                                onChange={(e) => setEmail(e.target.value) }
                            />
                        </div>
                        <div className="mt-6">
                            {
                                !loading?
                                <button 
                                    className="w-full px-4 py-2 tracking-wide text-black transition-colors 
                                    duration-200 transform bg-gray-200 rounded-md hover:bg-gray-500 
                                    focus:outline-none focus:bg-purple-600 disabled:bg-zinc-500"
                                    onClick={requestEmail}
                                    type="button"
                                    disabled={email === ''}
                                >
                                    Send Reset Code
                                </button>:
                                <Spinner className='text-purple-600'/>
                            }
                        </div>
                    </form>
                </div>
            </div>
        </div>
     );
}
 
export default ForgotPasswordPage;