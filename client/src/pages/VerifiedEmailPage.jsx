import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { isTokenExpired } from "../utils/isTokenExpired";


const VerifiedEmail = () => {
    const [loading,setLoading] = useState(true);
    const [message, setMessage] = useState('Your account has been verified and registered');
    
    useEffect(() => {
        let ignore = false;
        get_url_param('activation')
            .then(async activation_jwt =>{
                if(!ignore){ 
                    console.log(activation_jwt);
                    if(!isTokenExpired(activation_jwt)){
                        const response = await send_user_details(activation_jwt);
                        setLoading(false);
                        if(!response.ok){
                            setMessage("Error verifying your account please try again later");
                            toast.error("Error occurred on the server");
                        }
                    }else{
                        toast.error("This link has expired!")
                        setMessage('Error verifying your Account');
                        setLoading(false);
                    }
                }
                setLoading(false);
            } );
        
        return () => {
            ignore = true;
        };
    
    },[]);
    
    const get_url_param = async (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    const send_user_details = async (jwt) => {

        const response = await fetch('/api/register-user',{
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({user_jwt:jwt})
        });
        return response;
    }

    return ( 
        <div>
            {loading?<Spinner/>:
            <div>
                <h1>{message}</h1>
                <h2>You can close this page</h2>
            </div>}
        </div>
       
     );
}
 
export default VerifiedEmail;