const jwt = require('jsonwebtoken');


module.exports.socketAuth = (socket, next) => {
    console.log("Trying to authenticate socket");

    const cookies = socket.handshake.headers.cookie;
    // Parse cookies and extract JWT
    // Assuming the cookie name for the JWT is 'jwtCookie'
    const token = parseJwtFromCookie(cookies, 'token');

    if(token == null) next();
  
    // 
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) => {
        if(err) {
            console.log('error with access token in socket');
            
        }else{
            console.log('Socket Request authenticated successfully');
            next();
        }
        
    });
}



function parseJwtFromCookie(cookies, cookieName) {
    if (cookies == null) return null;
    const cookieArray = cookies.split('; ');
    for (const cookie of cookieArray) {
      const [name, value] = cookie.split('=');
      if (name === cookieName) {
        return value;
      }
    }
    return null;
  }