import { PropTypes } from 'prop-types'
import HomePage from '../pages/HomePage';
import EditPage from '../pages/EditPage';
import ProfilePage from '../pages/ProfilePage';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCookie } from '../utils/getCookie';
import { isTokenExpired } from "../utils/isTokenExpired.js"
import { useNavigateBackToLogin } from '../utils/useNavigateBackToLogin';


const ProtectedRoutes = ({ page }) => {

    useNavigateBackToLogin();
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const navigate = useNavigate();
    
    // useEffect(() => {
    //     const token_is_valid = isTokenExpired(getCookie('token'));
    //     setIsLoggedIn(token_is_valid);
    //     console.log("This is if the token is valide",token_is_valid)

    //     if(isLoggedIn === false){
    //         navigate("/");
    //     }
    // }, [])


    switch (page) {
        case 'home':
            return (

               (isLoggedIn&&<HomePage />)||(<h1>Not Logged In</h1>)
            );
        case 'edit-note':
            return (

                (isLoggedIn&&<EditPage />)||(<h1>Not Logged In</h1>)
            );
        case 'profile':
            return (
                
               (isLoggedIn&&<ProfilePage />)||(<h1>Not Logged In</h1>)
            );

               
        default:
            return (<h1>PAGE NOT FOUND</h1>)
    }
}
export default ProtectedRoutes;

ProtectedRoutes.propTypes = {
    page:PropTypes.string
}
