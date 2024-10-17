require('dotenv').config();
const express = require('express');
const cookie_parser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { markAsUntransferable } = require('worker_threads');
const { authenticateToken } = require('./middleware/authenticateToken.js');
const { isDate } = require('util/types');
const cors = require('cors');
const database = require('./database')
const email = require('./email');
const socket_io = require('socket.io');
const http = require('http');
const { update_body } = require('./database');
const { lutimes } = require('fs');
const { socketAuth } = require('./middleware/socketAuth.js');



const app = express();
app.use(express.json());
app.use(cookie_parser());
//const address = 'https://webdev-client-c42082c1db99.herokuapp.com';
const address = 'http://localhost:5173';

//Something you gotta do to allow vite to be able to send requests to the server
app.use(cors({
    origin: address,                            //change to 'https://webdev-client-c42082c1db99.herokuapp.com' for deployment
    methods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
    credentials: true,
    optionsSuccessStatus: 204
}));

const server = http.createServer(app);
const io = new socket_io.Server(server,{
    cors: {
      origin: address,                          //change to 'https://webdev-client-c42082c1db99.herokuapp.com' for deployment
      methods:['GET','POST'],
      credentials: true,
    },
  });

// io.use(socketAuth);



/**
 * POST request which sends activation link for an email address
 * 
 *  what to put in the body (json format)
 *  - username
 *  - email to be verified
 *  - password for new user
 *  - avatar_url
 */
app.post('/api/activate-email', async (req, res) => {
    
    const registerData = req.body; // Data sent from React

    //If the username already exists within the database then send a 409 conflict response
    const username_exists = await database.check_if_user_exists(registerData.username);
    const email_exists = await database.check_if_email_exists(registerData.email);
    if(username_exists||email_exists) return res.sendStatus(409);

    //If the username does not exist then send the verification email
    try {
        const hash = await bcrypt.hash(registerData.password, 10);

        const activation_token = jwt.sign({ 
                username: registerData.username,
                email:registerData.email,
                password:hash,
                avatar_url:registerData.avatar_url
            }, 
            process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            
            
        await email.send_verification_link(registerData.email, `${address}/email-verified?activation=${activation_token}`);
        res.status(201).json({ message: "verification email sent successfully" });
    } catch (error) {
        console.error("Error sending verification email:", error);
        res.status(500).json({ error: error });
    }
});

/**
 * POST request which sends activation link for registering a new email address
 * 
 *  Query parameters
 *  - username
 *  - email 
 */
app.post('/api/verify-new-email', authenticateToken,async (req, res) => {
    
    const username = req.query.username;
    const email_address = req.query.email;

    console.log(username, email);
    try {

        const activation_token = jwt.sign({ 
                username: username,
                email:email_address,
            }, 
            process.env.ACCESS_TOKEN_SECRET, 
            
            { expiresIn: '1h' }
            
        );
            
            
        await email.send_verification_link(email_address, `${address}/verify-new?activation=${activation_token}`);
        res.status(201).json({ message: "verification email sent successfully" });
    } catch (error) {
        console.error("Error sending verification email:", error);
        res.status(500).json({ error: error });
    }
});

/**
 * POST request which sends a reset password email to a user who has forgotten their password.
 */
app.post('/api/send-reset-password-email', async (req,res) => {
    const data = req.body;
    let email_address;
    data?email_address=data.email:res.sendStatus(400);
    
    const email_exists = await database.check_if_email_exists(email_address);
    console.log(email_address);
    console.log(email_exists);
    if(!email_exists) return res.sendStatus(409);

    try {
        const reset_token = jwt.sign({ 
                email:email_address,
            }, 
            process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' }
        );

        
        await email.send_reset_password_link(email_address, `${address}/reset-password?reset-token=${reset_token}`);
        console.log("Sent password reset email successfully");
        res.status(201).json({ message: "reset password email sent successfully" });
    } catch (error) {
        console.error("Error sending reset password email:", error);
        res.status(500).json({ error: error });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const password = req.body.password;
    const reset_token = req.body.reset_token;
    const email_json = jwt.verify(reset_token,process.env.ACCESS_TOKEN_SECRET,(err, user) =>{
        if(err){
            return null;
        }else{
            return user;
        }
    });

    const email = email_json.email;

    try{
        const hash = await bcrypt.hash(password, 10);
        const update_password_response = database.update_password(email,hash);
        console.log(update_password_response);
        console.log("Successfully updated password");
        return res.sendStatus(200);
    }catch(error){
        console.log("Error updating password", error)
        return res.sendStatus(500);
    }
});

/**
 * POST request for registering a new user onto the database
 */
app.post('/api/register-user', async (req, res) => {
    
    const registerData = req.body; // Data sent from React
    
    const user_jwt = registerData.user_jwt;
    const user_info = jwt.verify(user_jwt,process.env.ACCESS_TOKEN_SECRET,(err, user) =>{
        if(err){
            return null;
        }else{
            return user;
        }
    });
    console.log(user_info);

    if(!user_info){
        return res.sendStatus(403);
    }

    try {
        await database.register_user(user_info.username,user_info.email,user_info.password,
            user_info.avatar_url);

        res.status(201).json({ message: "Registered Successfully!" });
    } catch (error) {
        console.error("Error Registering:", error);
        res.status(500).json({ error: error });
    }
});

/**
 * PUT request allowing user to update their email
 */
app.put('/api/email', authenticateToken,async (req, res) => {
    const user_jwt = req.query.jwt;
    const user_info = jwt.verify(user_jwt,process.env.ACCESS_TOKEN_SECRET,(err, user) =>{
        if(err){
            return null;
        }else{
            return user;
        }
    });
    console.log(user_info);

    if(!user_info){
        return res.sendStatus(403);
    }

    try {
        await database.update_email(user_info.username,user_info.email);

        res.status(201).json({ message: "Registered Successfully!" });
    } catch (error) {
        console.error("Error Registering:", error);
        res.status(500).json({ error: error });
    }
});

/**
 * POST request for when user wants to Log-in
 */
app.post('/api/login', async (req, res) => {

    const loginData = req.body;
    let send_back_message = {
        'message': '',
        'user_found': true,
        'password_match': null,
    };
    let status = 201
    console.log(loginData);
    try {
        const result = await database.get_user_info(loginData.username);
        console.log(result);
        if (result.length === 0) {
            console.log("user not found");
            send_back_message.message = "User not found";
            send_back_message.user_found = false;
            // res.status(404).json(send_back_message);
            status = 404;
        } else {
            const correct_password = await bcrypt.compare(loginData.password, result[0].password);
            if (!correct_password) {
                console.log('Incorrect Password')
                send_back_message.message = "Incorrect password"
                send_back_message.password_match = false;
                // res.status(400).json(send_back_message);        // made the status code 400 (bad user request - cant be 201 (created))
                status = 400
            } else {
                send_back_message.password_match = true;
                //Create Access Token
                let accessToken;
                if(!req.body.remember_me){
                    accessToken = jwt.sign({ 
                            username: result[0].username,
                            email:result[0].email,
                            avatar:result[0].avatar_url
                        },
                        process.env.ACCESS_TOKEN_SECRET, 
                        { 
                            expiresIn: '1h' 
                        }
                    );
                }else{
                    accessToken = jwt.sign({ 
                        username: result[0].username,
                        email:result[0].email,
                        avatar:result[0].avatar_url
                        },
                        process.env.ACCESS_TOKEN_SECRET
                    );
                }
              
                //Store tokens in the cookies
                res.cookie('token',accessToken,{ maxAge: 9999999999999 });

                // Store refresh Token in database
                // res.status(202).json(send_back_message);            // changed status code to 202 (Accepted)
                status = 202;
            }
            
        }
        res.status(status).json(send_back_message);
    } catch (error) {
        send_back_message.message = "Error Connecting to database";
        console.log(error);
        send_back_message.user_found = null;
        send_back_message.password_match = null;
        res.status(500).json(send_back_message);
    }
});

//Creates a user-category instance and adds new category if needed.

/**
 * This post request is used to add a category for a specified user.
 * 
 * Query parameters:
 *  - user : username of the user you want to create a new category for
 * 
 * What to place in the body (json format):
 *  - category_name : the name of the new category you are creating 
 * 
 */
app.post('/api/categories',authenticateToken, async (req,res) => {

    var username = req.query.user;
    const {category_name} = req.body;

    if (username == undefined){
        username=null;
    }

    if (!category_name || !username){
        return res.status(406).json({ error: "Must provide an username and a category name." });
    }

    if (typeof username != 'string'){
        return res.status(406).json({ error: "Username must be of type string."});
    }

    if (!await database.check_if_user_exists(username)){
        return res.status(406).json({ error: "User does not exist" });
    }

    if(typeof category_name != 'string'){
        return res.status(406).json({ error: "category_name must be of type string." });
    }

    let usercat = await database.add_user_category(username,category_name);
    if (usercat.rowCount>0){
        return res.status(200).json({ message: "User Category added or already exists" });
    }
    else{
        return res.status(500).json({ error: "Internal server error" });
    }   

})


/**
 * This post request gives another user access to a shared note.
 * 
 * Query parameters:
 *  - user : username of the user who is granting access to the note
 * 
 * What to place in the body (json format):
 *  - new_role : The new role of the new member on the note, options are owner, collaborator and viewer.
 *  - user_to_add : The user being granted access to the note
 *  - note_id : The note to which the user is giving access 
 * 
 */
app.post('/api/usernotes', authenticateToken,async (req, res) => {

    var username = req.query.user;
    const {new_role, user_to_add, note_id} = req.body;

    try {
        if (await database.check_if_user_exists(username) && await database.check_if_user_exists(user_to_add)) {

            if (new_role != "collaborator" && new_role != "viewer" && new_role != "owner") {
                return res.status(400).json({Error: "Please ensure the new role is either, collaborator, owner or viewer"});
            }

            if (!await database.check_user_note(username,note_id)) {
                return res.status(400).json({Error: "Please ensure to provide note id of an existing note"});
            }
            if (await database.check_user_note(user_to_add,note_id)){
                return res.status(400).json({Error: "Relationship already exists"});
            }
            var result = await database.add_member(username, new_role, note_id, user_to_add);

            return res.status(200).json({message: result});


        } else {
            return res.status(406).json({Error: "Please provide a registered user's username and registered username for the user who you are trying to add"})
        }
    } catch {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

})

/**
 * This post request creates a note a user.
 * 
 * Query parameters:
 *  - user : username of the user who is creating the note
 * 
 * What to place in the body (json format):
 *  - body : The body of the note / the content of the note.
 *  - title : The title of the note.
 *  - category : The category of the note (if it does not exist it will be created)
 * 
 * Data returned:
 *  - note information including note id, title, body and category id
 * 
 */
app.post('/api/notes', authenticateToken, async (req, res) => { // what is the reason for the :id 
    
    const username = req.query.user;
    const { body,title,category } = req.body;  // Destructure values from the request body

    if ( !username  || !await database.check_if_user_exists(username) || !title || !body || !category) {
        res.status(400).json({Error: "Please provide a valid username, title, category and body for the note to be created"})
    }

    if (typeof title  != 'string' || typeof category != 'string' || typeof body != 'string' ) {
        res.status(400).json({Error: "Please ensure that the title, category and body are all strings"})
    }

    //can make multiple notes of the same name - avoids issue when note title gets changed to a different note's title. 
    try {
        result = await database.create_note(username, title, body, category);   

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Note created successfully', note: result['rows'][0]});
        } else {
            res.status(404).json({ message: 'Note could not be created' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
 })

 /**
 * This function returns all the notes of a user.
 * 
 * Query parameters:
 *  - user : username of the user requesting their notes' information
 *  - order : Specify how you would like the response to be order, options are:process.env.PORT
 *  *  - (optional) id: The ID of a particular note owned by the user or shared with them 
 * 
 * Data returned:
 *  - note information including note id, title, body and category id for each note owned
 *    and shared with the user

 */
 
 app.get('/api/notes', authenticateToken, async (req, res) => {

    const username = req.query.user;
    const order  = req.query.order;
    var id = req.query.id;

    if (id == undefined){
        id = null;
    }
    else{
        try{
            id = parseInt(id);
            if (Number.isNaN(id)){
                return res.status(400).json({Error: 'id must be of type integer'})
            }
        }
        catch(err){
            return res.status(400).json({Error: 'id must be of type integer'})
        }
    }


    if (typeof order == undefined){
        order = null;
    }

    if (username == null || !await database.check_if_user_exists(username)) 
        return res.status(403).json({Error: "username must be provided in order to access notes."});
    if (typeof username != 'string'){
        return res.status(403).json({Error: "username must be of type string."});
    }
    if (typeof id != 'number' && id != null){
        return res.status(403).json({Error: "id must be of type integer or null."});
    }
    if (order != 'recent' && order != 'category' && order != null){
        return res.status(403).json({Error: "order must be 'recent', 'category' or null."});
    }

    if (typeof id == 'number') {//get specific note
        if (!await database.check_note(id)){
            return res.status(403).json({Error: "Note does not exist"});
        }
        if (!await database.check_user_note(username,id)){
            return res.status(403).json({Error: "User not collaborator of note."});
        }
        
        result = await database.get_a_note(id,username);

        try {
            if (result.rowCount > 0) {
                res.status(200).json({notes: result.rows});
            } else {
                res.status(204).json({message: 'No notes stored'});
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({Error: 'Internal server error'})
        }

    } else {//get all notes - order
        if (order == null){
            result = await database.get_all_notes(username);
        }
        else if(order == 'recent'){
            result = await database.get_ordered_notes("last_used",username);
        }
        else{
            result = await database.get_ordered_notes("category",username);
            console.log(result)
        }
        
        if (result.length == 0){
            return res.status(200).json({message: 'User has no notes'})
        }
   
        try {
            if (result.length > 0) {
                return res.status(200).json({notes: result});
            } else {
                return res.status(204).json({message: 'No notes stored'});
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({Error: 'Internal server error'})
        }

    } 
})


/**
 * This function returns all the categories of a user.
 * 
 * Query parameters:
 *  - user : username of the user requesting their categories' information
 *  - (optional) category: The ID of a particular category owned by the user or shared with them 
 * 
 * Data returned:
 *  - category information including category id and category name for each note owned
 *    and shared with the user
 */
app.get('/api/categories', authenticateToken,async (req, res) => {

    var cat = req.query.category;
    var username = req.query.user;
    var check_cat;

    if (cat != undefined)
        check_cat = await database.check_category(cat);
    else {
        check_cat = true;
    }

    var check_user = await database.check_if_user_exists(username);

    if (check_cat && check_user) {
        result = await database.get_category_info(username, cat);

        if (result != false) {
            res.status(200).json({categories: result})
        } else {
            res.status(500).json({Error: 'Internal server error'})
        }
    } else {
        res.status(400).json({Error: 'Please provide a valid category name and username.'})
    }

})

/**
 * This endpoint allows for a user to access their user information 
 * 
 * Query parameters:
 *  - user : username of the user requesting their information
 * 
*/
app.get('/api/users', authenticateToken,async (req, res) => {

    var userName = req.query.user;

    var userExists = await database.check_if_user_exists(userName);

    if (userExists) {

        var result = await database.get_user_info(userName);
        res.status(200).json({user_info: result});
        
    } else {
        res.status(400).json({Error: "Invalid username provided."});
    }

})

//all deletes

/**
 * This endpoint allows a user to delete an owned note.
 * 
 * Query Parameters:
 *  - user : username of the user deleting the note
 *  - id : the note id of the note you wish to delete
 * 
 */
app.delete('/api/notes',authenticateToken, async (req, res) => {  // is there really use case for deleting all notes for user?

    const username = req.query.user;
    const note_id = req.query.id;
    
    try {
        
        if (!(await database.check_user_note(username, note_id))) {
            return res.status(500).json({message: "You can only delete a note that you have access to."})
        }

        var result = await database.delete_note(note_id, username);
        
        res.status(200).json(result)
        

    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }

})

/**
 * This endpoint allows for a user to delete a category.
 * 
 * Query parameters:
 *  - user : username of the user trying to delete the category
 *  - category : the ID of the category the user is tring to delete 
 */
app.delete('/api/categories',authenticateToken, async (req,res) => {
    
    const username = req.query.user;
    const cat_name = req.query.category;

    try {
        const response = await database.getCategoryID(username, cat_name);
      
        const cat_id = response[0].category_id
        try {

            //if ( await database.check_user_category(username, cat_id)) {
                console.log("passed if")
                console.log(cat_id)

                result = await database.delete_category(username, cat_id);

                return res.status(200).json({message: result});


        //} else {
            console.log("failed if")
            return res.status(406).json({Error: "User must have a category with the given ID"});
       // }
    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }
    
} catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }


})

/**
 * This endpoint allows the owner of the note to remove members with any role. 
 * 
 * 
 * Query parameters:
 *  - user : username of the note's owner
 *  - id : the ID of the bote the user is trying to remove the member from
 * 
 * What to place in the body (json format):
 *  - user_to_delete : the username of the user that the owner would like to remove from the note
 * 
 */
app.delete('/api/usernotes',authenticateToken, async (req, res) => {  // is there really use case for deleting all notes for user?

    var username = req.query.user;
    var note_id = req.query.id;
    const {user_to_delete} = req.body;

    if (username == undefined){
        username = null;
    }
    if(note_id == undefined){
        note_id = null;
    }
    
    try {
        
        if (!await database.check_user_note(username, note_id)) {
            return res.status(400).json({message: "You can only remove someone from a note that you have access to."});
        }

        if (!await database.check_user_note(user_to_delete, note_id)) {
            return res.status(400).json({message: "Relationship to be removed does not exist"});
        }

        if(!await database.check_owner(note_id,username)){
            return res.status(400).json({message: "Only owner can delete user-note relationship"});
        }
        if (username == user_to_delete){
            result = await database.delete_note(note_id,user_to_delete);
        }else{
            result = await database.delete_user_note(user_to_delete,note_id);
        }

        if (result.rowCount >0){
            res.status(200).json({deletedMember: result['rows'][0]});
        }
        else{
            res.status(500).json({ message: 'Could not delete usernote' });
        }
        
        
        

    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }

})


/**
 * This endpoint allows for a user to delete themself :(.
 * 
 * Query parameters:
 *  - user : username of the user deleting their account.
 * 
 */
app.delete('/api/user',authenticateToken, async (req, res) => {  // is there really use case for deleting all notes for user?

    var username = req.query.user;
    
    try {
        
        if (typeof username != 'string' ||!await database.check_if_user_exists(username)){
            return res.status(400).json({message: "User does not exist"});
        }

        result = await database.delete_user(username);
        if (result.rowCount >0){
            res.status(200).json({message: "User deleted",result:result});
        }
        else{
            res.status(500).json({ message: 'Could not delete usernote' });
        }
        
        
        

    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }

})

//all puts


/**
 * This end point allows for a user to make changes to all the proprties of a note.
 * 
 * Query parameters:
 *  - user : username of the user requesting tto change the body of the note
 *  - id : The ID of the note the user wants to change
 * 
 * What to place in the body (json format):
 *  - body : The new value of the body of the note
 *  - title : New title of the note
 *  - category : category name of the note
 * 
 * Data returned:
 *  - Message indicating if task was successfully and updated note's information 
 *    such as the id, category id and name as well as body and title.
 */
app.put('/api/notes', authenticateToken,async (req, res) => {    

    var id = parseInt(req.query.id);
    var user = req.query.user;
    const { body,title,category } = req.body;  // Destructure values from the request body
    if (id == undefined){
        id = null;
    }

    if (user == undefined){
        user = null;
    }
    const username = user;

    if (!id || !username || (!title && !body && !category) ) {  // Check if at least one of the fields is provided for update
        return res.status(400).json({ message: "Please provide a note_id, user and at least one field to update." });
    }

    //Check user exists
    if (! await database.check_if_user_exists(username)){
        return res.status(404).json({ message: "User does not exist." });           // changed to status code 404 (not found)
    }

    //Check that note exists
    if (! await database.check_note(id)){
        return res.status(403).json({ message: "Note does not exist." });           // changed to status code 404 (not found)
    }
    
    //Check user-note relationship exists
    if (! await database.check_user_note(user,id)){
        return res.status(403).json({ message: "User is not collaborator of note" });  
    }
    //Check user is not a viewer
    if (await database.check_note_viewer(username,id)){
        return res.status(400).json({ message: "A viewer can't update the body" });
    }

    try {
      
        let updateFields = [];
        let values = [];
        let index = 1; 

        //  Check params not null and correct type
        if (username) {
            if (typeof username != 'string'){
                return res.status(400).json({ message: "Username must be of type String." });
            }
        }
        if(title){
            if (typeof title != 'string'){
                return res.status(400).json({ message: "Title must be of type String." });
            }
            if (! await database.check_owner(id,username)){
                return res.status(403).json({ message: "Only owner may change title" });
            }
            updateFields.push(`title = $${index++}`); // what are these ? ==> need to use $1 notation rather
            values.push(title);
        }
        if (body) {
            if (typeof body != 'string'){
                return res.status(400).json({ message: "Body must be of type String." });
            }
            updateFields.push(`body = $${index++}`); // what are these ? ==> need to use $1 notation rather
            values.push(body);
        }
        if (category) {               
            if (! await database.check_owner(id,username)){
                return res.status(400).json({ message: "Only an owner may update the category" });
            }
            if (typeof category != 'string'){
                return res.status(400).json({ message: "category_id must be of type String." });
            }
            const cat = await database.add_user_category(username,category);
            if (cat.rowCount==0){
                return res.status(400).json({ message: "category  and user category creation failed" });
            }
            updateFields.push(`category_id = $${index++}`);
            values.push(cat.rows[0]['category_id']);
        }

        const date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let hrs = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();
        let timezone = date.getTimezoneOffset();


        let last_used = `${year}-${month}-${day} ${hrs}:${min}:${sec}`;
        updateFields.push(`last_used = $${index++}`);
        values.push(last_used);
        
        let result = await database.update_note(updateFields,values,id);
       
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Note updated successfully', updatedNote: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


/**
 * This end point allows for a user to make changes to just the body of the note.
 * If any other changes are being made to the note then the previous endpoint should be used.
 * 
 * Query parameters:
 *  - user : username of the user requesting tto change the body of the note
 *  - id : The ID of the note the user wants to change
 * 
 * What to place in the body (json format):
 *  - body : The new value of the body of the note
 * 
 * Data returned:
 *  - Message indicating if task was successfull and note ID of the note updated
 */
app.put('/api/notes/body',authenticateToken, async (req, res) => {    
   
    const id = parseInt(req.query.id);
    const username = req.query.user;
    const body = req.body.body;  // Destructure values from the request body

    if (!id||!body||!username || id == undefined || username == undefined || body == undefined) {  // Need all 3 fields to approve update
        return res.status(400).json({ message: "Please provide an id, a username and a body to update." });
    }

    var user_exist = await database.check_if_user_exists(username)

    if (!user_exist) {
        return res.status(406).json({ message: "User must be a registered user." }); 
    } 
    
    var user_linked_note = await database.check_user_note(username, id)
    if (!user_linked_note) {
        return res.status(406).json({ message: "User must have some access to the note." });
    }

    var result;
   
    try {
        if (typeof id != 'number' && id >0){
            return res.status(406).json({ message: "id must be of type 'integer'." }); // changed the error code to 406 (not acceptable)
        }
        if (typeof body != 'string'){
            return res.status(406).json({ message: "Body must be of type 'string'." }); // changed the error code to 406 (not acceptable)
        }
        if (typeof username != 'string'){
            return res.status(406).json({ message: "Username must be of type 'string'." }); // changed the error code to 406 (not acceptable)
        }

        if (await database.check_has_write_access(username, id)) {
            result = await database.update_body(id, body);
        } else {
            return res.status(406).json({message: "The user making the request does not have rights to edit the body of the note."})
        }
        
        
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Note updated successfully', note_updated : id});
        } else {
            res.status(404).json({ message: 'Note not found' });
        }

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * This function can be used to update the following user info:
 * password, email, avatar_url
 * 
 * Query params: 
 *  - user (username)
 * 
 * What to place in the body (json format): (if you do not want to change one of these simply leave it out)
 *  - new_username : The new username of the specified user ==> currenlty depreciated (unique usernames)
 *  - email : new email of the user
 *  - password : new password of the user
 *  - avatar_url : new avatar url of the user
 * 
 * Returns (given all passed parameters are valid):
 *  - Message indicating whether or not the update was successful.
 */

app.put('/api/user',authenticateToken, async (req, res) => {
    var user = req.query.user;
    const {new_username,email,password, avatar_url} = req.body;  // Destructure values from the request body

    if (user == undefined){
        user = null;
    }
    
    //Presence and type check
    try{
        let values = [];
        let updateFields=[];
        let sql = ``;
        let result = '';
        let index =1 ;
        const username = user;

        if (!username || (!new_username && !email && !password && !avatar_url)){
            return res.status(400).json({ message: "Please provide username and fields to update in the body of the request." });
        }

        if (!await database.check_if_user_exists(username)) {
            return res.status(406).json({ message: "User does not exist" });   // changed the error code to 406 (not acceptable)
        }

        if (false) {//new_username - not for now
            if (typeof new_username != 'string'){
                return res.status(406).json({ message: "New username must be of type String." }); // changed the error code to 406 (not acceptable)
            }
            
            if (await database.check_if_user_exists(new_username)){
                return res.status(406).json({ message: "Username has been taken." }); // changed the error code to 406 (not acceptable)
            }
            updateFields.push(`username = $${index++}`);
            values.push(new_username);
            //Tokkie: will it update the relationships? only in notes and usernotes
        }
        if (email) {
            if (typeof email != 'string'){
                return res.status(406).json({ message: "Email must be of type String." }); // changed the error code to 406 (not acceptable)
            }
            if(await database.check_if_email_exists(email)){
                return res.status(406).json({ message: "email has already been used." });
            }
            updateFields.push(`email = $${index++}`);
            values.push(email);
        }
        if (password) {    //Password needs to be strength tested.
            if (typeof password != 'string'){
                return res.status(400).json({ message: "Password must be of type String." });
            }
            updateFields.push(`password = $${index++}`);
            values.push(await bcrypt.hash(password, 10));
        }
        if (avatar_url) {
            if (typeof avatar_url != 'string'){
                return res.status(406).json({ message: "Avatar_url must be of type String." }); // changed the error code to 406 (not acceptable)
            }
            updateFields.push(`avatar_url = $${index++}`);
            values.push(avatar_url);
        }
        values.push(username);
        
        result = await database.update_user(updateFields,values,username);
        if (result.rowCount!=0){
            return res.status(200).json({ message: "User information updated successfully." });
        }
        else{
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }

});

/**
 * This functions updates the username
 * 
 * Query parameters
 *  - username The current username
 * 
 * What to put in the body(json format)
 *  - new_username
 *  - email
 *  - avatar_url
 */
app.put("/api/username", authenticateToken, async (req, res) => {
    const current_username = req.query.username;
    const new_username = req.body.new_username;

    const successful = await database.update_username(req.body.email, current_username,new_username);
    console.log(successful)
    if(successful){
        const accessToken = jwt.sign({ 
                        username: req.body.new_username,
                        email:req.body.email,
                        avatar:req.body.avatar_url
                    },
                    process.env.ACCESS_TOKEN_SECRET, 
                    { 
                        expiresIn: '1h' 
                    }
                );
        res.cookie('token',accessToken,{ maxAge: 9999999999999 });
        res.status(200).json({
            message:"Updated username",
            token:accessToken
        });

    }else{
        res.status(400).json({message:"Failed to update username"});

    }
})


/**
 * This functions updates the password for a user
 * 
 * Query parameters
 *  - email : the users current email address
 *  
 * What to put in the body (json format):
 *  - new_password : the new password for the user
 */
app.put("/api/password", authenticateToken,async (req, res) => {
    const email = req.query.email;
    console.log(email);
    const new_password = req.body.new_password;

    const hash = await bcrypt.hash(new_password, 10);
    try{
        const dbRes = database.update_password(email,hash);
        res.sendStatus(200);
    }catch{
        res.sendStatus(500)
    }
});

/**
 * This functions updates the password for a user
 * 
 * Query parameters
 *  - email : the users current email address
 *  
 * What to put in the body (json format):
 *  - new_avatar : the new password for the user
 */
app.put("/api/avatar",authenticateToken, async (req, res) => {
    const email = req.query.email;
    console.log("new avatar for", email);
    const new_avatar = req.body.new_avatar;

    try{
        const dbRes = database.update_avatar(email,new_avatar);
        res.sendStatus(200);
    }catch{
        res.sendStatus(500)
    }
});

/**
 * Function can be used to update user-note relationships.
 * Only works if the user is the owner
 * 
 * Query params: 
 *  - user (username)
 * 
 * What to place in the body (json format): 
 *  - new_role : The new role which the user is giving to the new member (collaborator, owner, viewer)
 *  - user_to_change : The user who is receiving the rights to the note
 *  - note_id : The note ID of the note to which the user is granting access
 * 
 * NB consequences:
 * 
 * If the user is giving another user owner rights to the note, then they themself will be made a colloborator
 * and will have their owner rights removed (this is because each note can only have one owner).
 * 
 * Successful operation:
 * {message: "Success"}
 */
app.put('/api/usernotes', authenticateToken,async (req, res) => {

    const username = req.query.user;
    const {new_role, user_to_change, note_id} = req.body;

    try {
        
        if (await database.check_if_user_exists(username) && await database.check_if_user_exists(user_to_change)) {
          
            if (new_role != "owner" && new_role != "collaborator" && new_role != "viewer") {
                return res.status(400).json({Error: "Please ensure the new role is either, collaborator, owner or viewer"});
            }
        
            if (!database.check_note(note_id)) {
                return res.status(400).json({Error: "Please ensure to provide note if of an existing note"});
            }
           
            if (! await database.check_user_note(username,note_id) || !await database.check_owner(note_id,username)){
                return res.status(400).json({Error: "User must be added to note"});
            }
          
            var result = await database.update_role(username, new_role, note_id, user_to_change);
            
            if (new_role == "owner"){//must transfer ownership - including category
                var note = await database.get_a_note(note_id,username);
               
                var cat = await database.add_user_category(user_to_change,note['rows'][0]['category_name']);
               
                var update_notes = await database.update_note(["category_id = $1"],[cat['rows'][0]['category_id']],note_id);
               
                result = await database.update_role(user_to_change,"collaborator", note_id, username);
                   
                return res.status(200).json({message: result});
            }
            return res.status(200).json({message: "Success"});

        } else {
            return res.status(406).json({Error: "Please provide a registered user's username and registered username for the user who you are trying change roles for"})
        }
    } catch {
        return res.status(500).json({ message: 'Internal Server Error' });
    }


})

/**
 * This api end point allows a user to update the category name.
 * 
 *  * Query parameters:
 *  - user : username of the user requesting to change the category name
 *  - category_id : The ID of the category the user wants to change
 * 
 * What to place in the body (json format):
 *  - new_category_name : The new name of the category
 * 
 */
app.put('/api/categories', authenticateToken,async (req, res) => {

    var username = req.query.user;
    var cat_id = req.query.category_id;
    const new_category_name = req.body.new_category_name;

    if (!username || !cat_id || !new_category_name){
        return res.status(400).json({ message: 'Include a username,category_id and a new category name.' });
    }

    try {
        if (await database.check_if_user_exists(username)) {
            if (await database.check_user_category(username,cat_id)){
                var result = await database.update_category_name(cat_id, new_category_name);
                return res.status(200).json({message: "Success"});
            }
            else{
                return res.status(400).json({message: "Only the owner may change the category."});
            }
            
        } else {
            return res.status(406).json({Error: "Please provide a registered user's username and registered username for the user who you are trying to add"})
        }
    } catch {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

})

//gets to make development easiler:

app.get('/api/notesall', authenticateToken,async (req,res)=>{
    
    var notes = await database.notes();
    return res.status(200).json(notes);

})

app.get('/api/usersall',authenticateToken, async (req,res)=>{
    
    var notes = await database.users();
    return res.status(200).json(notes);

});

app.get('/api/usernotesall',authenticateToken, async (req,res)=>{

    
    var notes = await database.usernotes();
    return res.status(200).json(notes);

});

app.get('/api/categoriesall',authenticateToken, async (req,res)=>{
    
    var notes = await database.categories();
    return res.status(200).json(notes);

});

app.get('/api/usercategoriesall', authenticateToken,async (req,res)=>{
    
    var notes = await database.usercategories();
    return res.status(200).json(notes);

})


io.on('connection', (socket) => {
    // Handle Socket.IO events here
    console.log("Socket connected");

    socket.on('get-note', async note_id_and_user => {
        socket.join(note_id_and_user.note_id);
        const note = await database.get_a_note(note_id_and_user.note_id,note_id_and_user.user);
        console.log(note);
        socket.emit('load-note',note.rowCount!==0?note.rows[0]:{title:"",body:"",category:""});
        console.log(note_id_and_user);


        socket.on("send-changes", data => {
            socket.broadcast.to(note_id_and_user.note_id).emit('receive-changes',data);
            console.log(data);
        });


        socket.on("save-note", async (note_body) => {
            update_body(note_id_and_user.note_id, note_body);
        })
    })
  });

  //server.listen(process.env.PORT, () => { console.log("Server is running on port process.env.PORT") });

  server.listen(5000, () => { console.log("Server is running on port 5000")} );