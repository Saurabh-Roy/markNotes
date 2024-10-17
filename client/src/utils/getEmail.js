import jwtDecode from "jwt-decode";
/**
 * Description. This function retrieves the avatar field that is stored inside a json web token
 * @param {json web token} token 
 * @returns true if the token has expired and returns false if the token has not expired
 */
const getEmail = (token) => {
    try {
        const decoded_jwt = jwtDecode(token);

        return decoded_jwt.email;


    } catch (err) {
        return ""
    }
}

const _getEmail = getEmail;
export { _getEmail as getEmail };