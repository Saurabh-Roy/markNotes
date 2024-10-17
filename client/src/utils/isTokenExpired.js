import jwtDecode from "jwt-decode";
/**
 * Description. This function checks if a json web has expired or not.
 * @param {json web token} token 
 * @returns true if the token has expired and returns false if the token has not expired
 */
const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        console.log(token);
        console.log(decoded);
        if (!decoded) {
            return true;
        }
        const dateNow = new Date();
        const has_expired = decoded.exp < dateNow.getTime() / 1000;
        // JWT exp is in seconds, so convert it to milliseconds
        return has_expired;
    } catch (err) {
        console.log("An error with the token has occurred", err);
        return true;
    }
}

const _isTokenExpired = isTokenExpired;
export { _isTokenExpired as isTokenExpired };

