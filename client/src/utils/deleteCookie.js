/**
 * Description. This function deletes a cookie that is currently stored in teh browser
 * @param {String} key The name/key of the cookie to be deleted from the browser.
 */
export const deleteCookie = (key) => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}