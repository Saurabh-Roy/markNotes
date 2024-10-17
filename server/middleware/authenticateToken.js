const jwt = require('jsonwebtoken');


/**
 * This function is used to check if a token is still valid
 * @param {*} req A request from the server.
 * @param {*} res The response to be sent back to the server.
 * @param {*} next function that allows this function to move to the next function after middleware
 * @returns 
 */
function authenticateToken(req, res, next){
    const token = req.cookies.token && req.cookies.token;
    
    if(token == null) return res.sendStatus(401);
    console.log(jwt.decode(token));
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) => {
        if(err) {
            // console.log(err);
            res.sendStatus(511);
            console.log('Authentication of request failed');
        }else{
            //console.log('Request authenticated successfully');
            next();
        }
        
    });

}

exports.authenticateToken = authenticateToken;