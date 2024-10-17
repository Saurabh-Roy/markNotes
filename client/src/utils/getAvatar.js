import jwtDecode from "jwt-decode";
/**
 * Description. This function retrieves the avatar field that is stored inside a json web token
 * @param {json web token} token 
 * @returns true if the token has expired and returns false if the token has not expired
 */
const getAvatar = (token) => {
    try {
        const decoded_jwt = jwtDecode(token);

        return decoded_jwt.avatar;


    } catch (err) {
        return ""
    }
}

const _getAvatar = getAvatar;
export { _getAvatar as getAvatar };