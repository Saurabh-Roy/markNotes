import jwtDecode from "jwt-decode";
/**
 * Description. This function retrieves the username field that is stored inside a json web token
 * @param {json web token} token 
 * @returns true if the token has expired and returns false if the token has not expired
 */
const getUser = (token) => {
    try {
        const decoded_jwt = jwtDecode(token);

        return decoded_jwt.username;


    } catch (err) {
        return "user not known"
    }
}

const _getUser = getUser;
export { _getUser as getUser };