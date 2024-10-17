import { useNavigate } from "react-router-dom";

import { getCookie } from "./getCookie";
import { useEffect } from "react";
import { isTokenExpired } from "./isTokenExpired";

export const useNavigateBackToLogin = () => {
    const navigate = useNavigate();
    useEffect(() => {
        if(isTokenExpired(getCookie('token'))){
            console.log('Authentication Token Expired');
            navigate("/");
        }else{
            console.log('Authentication Token is still valid');

        }
    });
}