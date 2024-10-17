/**
 * Description. Gets the value of a cookie with the specified key.
 * @param {String} key 
 * @returns 
 */
function getCookie(key){
    let b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
    return b ? b.pop() : "";
}

const _getCookie = getCookie;
export { _getCookie as getCookie };