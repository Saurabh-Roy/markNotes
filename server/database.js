const { Pool } = require('pg');
const bcrypt = require('bcryptjs');


const database = new Pool({
    host:"102.211.204.73",
    user:"root",
    port:8000,
    password:"RxAd26",
    database:"postgres"
});

database.connect();

module.exports.check_user_category

module.exports.create_note = async (username, title, body, category_name) => {      // changed 
    //https://www.freecodecamp.org/news/javascript-get-current-date-todays-date-in-js/


    const date = new Date();
    var cat_ids = [];

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hrs = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();


    let created_at = `${year}-${month}-${day} ${hrs}:${min}:${sec}`;
    console.log(created_at);
    let last_updated = created_at;

    if ( !username || !title || !body || !category_name){
        console.log("Empty");
        return res.status(400).json({ error: 'User does not exist' });
    }

    if (!await this.check_if_user_exists(username)){
         return res.status(400).json({ error: 'User does not exist'});
    }

    dbRes = await this.add_user_category(username,category_name);
    const category_data = dbRes['rows'][0];
   
    var sql = `INSERT INTO notes (title, body, created_at, last_used,category_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    dbRes = await database.query(sql,[title,body,created_at,last_updated,category_data['category_id']] );
    console.log(`INSERT category: `+category_name+` id:`+dbRes['rows'][0]['category_id']);

    const new_sql = `INSERT INTO usernotes (username,note_id,role) VALUES ($1,$2,$3) RETURNING *`;
    dbRes = await database.query(new_sql,[username,dbRes['rows'][0]['id'],"owner"] );
    console.log(`INSERT category: `+category_name+` id:`+dbRes['rows'][0]['category_id']);

    return dbRes;

}

module.exports.create_categories = async (id, category_name) => {  // changed

    var dbRes;
    const query = `
    INSERT INTO categories (id, category_name) 
    VALUES($1, $2);`;

    const query_params = [id, category_name];

    dbRes = await database.query(query, query_params);
    return dbRes;
}

/**
 * Description. This function stores a new user onto the database.
 * @param {String} username Unique username of new user.
 * @param {String} email Email address of new user
 * @param {String} password Users new password
 * @param {String} avatar_url The url that links to the users avatar
 */
module.exports.register_user = async (username,email, password,avatar_url) => {

    var dbRes;
    const register_user_data_query = `
    INSERT INTO users (username,email,password, avatar_url) 
    VALUES($1, $2, $3, $4);`;

    const user_register_values = [username, email, password, avatar_url ];

    dbRes = await database.query(register_user_data_query, user_register_values);
}

/**
 * Description. This function stores the refresh (remember me) tokens on the database
 * @param {String} refreshToken 
 */
module.exports.set_refresh_token = async (refreshToken) => {
    const refresh_query = "INSERT INTO tokens (tokens) VALUES($1)";
    const refreshTokenValue = [refreshToken];
    await database.query(refresh_query, refreshTokenValue);
}

module.exports.get_all_notes = async(username) => {
    
    var dbRes;

    const query1 = `
    SELECT note_id
    FROM usernotes
    WHERE username = $1;`;

    var results =[];

    dbRes = await database.query(query1, [username]);

    if (dbRes.rowCount==0){
        return [];
    }
    

    for (i = 0; i< dbRes.rowCount; i++){
        results.push(dbRes['rows'][i]['note_id']);
    }
    
    const placeholders = results.map((_, index) => `$${index + 2}`).join(',');
    
    const sql =`SELECT notes.*, categories.category_name, S.role 
    FROM notes
    FULL JOIN categories ON notes.category_id = categories.category_id 
    INNER JOIN (
    SELECT note_id, role 
    FROM usernotes 
    WHERE username = $1
    ) AS S ON S.note_id = notes.id 
    WHERE notes.id IN (${placeholders});`;
    
    dbRes = await database.query(sql, [username,...results]);
    return dbRes.rows;
}

module.exports.get_ordered_notes = async (order, username) => {

    const sql =`SELECT notes.*, categories.category_name, S.role 
    FROM notes
    FULL JOIN categories ON notes.category_id = categories.category_id 
    INNER JOIN (
    SELECT note_id, role 
    FROM usernotes 
    WHERE username = $1
    ) AS S ON S.note_id = notes.id;`;
    
    dbRes = await database.query(sql, [username]);

    const userNotes = dbRes['rows']
    
    if(order == "category"){
        userNotes.sort(compareByCategoryName);
        console.log(`ORDER notes by category`);
    }
    else{
        userNotes.sort(compareByLastUsed);
        console.log(`ORDER notes by recently used`);
    }
    
    return userNotes;
}

function compareByCategoryName (a, b) {
    if (a.category_name == undefined){
        return -1;
    }
    if (b.category_name == undefined){
        return 1;
    }
    if (a.category_name < b.category_name) {
        return -1;
    }
    if (a.category_name > b.category_name) {
        return 1;
    }
    return 0;
}

function compareByLastUsed (a, b) {
    if (a.last_used < b.last_used) {
        return 1;
    }
    if (a.last_used > b.last_used) {
        return -1;
    }
    return 0;
}

module.exports.get_a_note = async (noteId,username) => {

    var dbRes;

    const sql =`SELECT notes.*, categories.category_name, S.role 
    FROM notes
    FULL JOIN categories ON notes.category_id = categories.category_id 
    INNER JOIN (
    SELECT note_id, role 
    FROM usernotes 
    WHERE username = $1
    ) AS S ON S.note_id = notes.id 
    WHERE notes.id = $2;`;
    console.log("SELECT note_id: "+noteId);

    dbRes = await database.query(sql, [username,noteId]);
    console.log("SELECT note id: "+noteId);
    return dbRes;

}

module.exports.get_notes_for_category = async (cat_name) => {
    
    var dbRes;
    
    const query = `
    SELECT * 
    FROM notes 
    WHERE category = $1;`;

    try {

        dbRes = await database.query(query, [cat_name]);

        if (dbRes.rowCount > 0) {
            return result['rows'];
        } else {
            return false;
        }
    } catch {
        return false;
    }
}

module.exports.get_category_info = async (username, cat_id) => {

    var dbRes;
    var cat_ids = [];
    var cats_info = [];

    const categories_info = `
    SELECT category_id
    FROM usercategories
    WHERE username = $1;
    `;

    if (cat_id == null) {     // get all the categories for that use 

        dbRes = await database.query(categories_info, [username])

        for (i = 0; i<dbRes['rows'].length; i++) {  // collect the category ids into a list
            cat_ids.push(dbRes['rows'][i]['category_id']);
        }

        // get add the categories info

        const category_info = `
        SELECT *
        FROM categories
        WHERE category_id = $1;
        `;

        for(j = 0; j<cat_ids.length; j++) {
            dbRes = await database.query(category_info, [cat_ids[j]]);
            cats_info.push(dbRes['rows'][0]);
        }

        return cats_info;
    } else {            // user only wants category info of a specfic category

        const cat_info = `
        SELECT *
        FROM categories
        WHERE category_id = $1
        `;

        dbRes = await database.query(cat_info, [cat_id]);

        return dbRes['rows'][0];

    }
}

module.exports.get_user_info = async (username) => {

    var dbRes;

    const query = `
    SELECT * 
    FROM users 
    WHERE username = $1;
    `;

    dbRes = await database.query(query, [username]);
    console.log("SELECT get info for user: "+username);

    return dbRes['rows'];

}

/**
 * Description. This function checks if the username parameter exists in the users table of the
 *      database or not.
 * @param {String} username username to check for
 * @returns true if the username is found and false if the username is not found.
 */
module.exports.check_if_user_exists = async (username) => {
    
    var dbRes;

    const user_query = `
    SELECT username 
    FROM users 
    WHERE username = $1;`

    dbRes = await database.query(user_query,[username]);
    console.log(`SELECT check if user <${username}> exists`);
    // console.log(dbR)
    
    if(dbRes.rowCount <= 0){
        return false;
    }else{
        return true;
    }
    
}

module.exports.check_owner = async (note_id, username) => {
    
    var dbRes;

    const query = `
    SELECT role 
    FROM usernotes 
    WHERE username = $1 AND note_id = $2;
    `;
    
    dbRes = await database.query(query,[username, note_id]);
    console.log("SELECT get user role on specific note");
    
    if (dbRes.rowCount > 0){
        if (dbRes['rows'][0]['role'] == "owner") {
            return true;
        }
        return false;
    }
    else
        return false;
}

module.exports.check_note = async (id) => {
    
    var dbRes;
    
    const query = `
    SELECT * 
    FROM notes 
    WHERE id = $1;
    `;
    
    dbRes = await database.query(query,[id]);
    console.log(`SELECT everything from notes with id = <${id}>`);
    
    if (dbRes.rowCount > 0){
        return true;
    }
    else
        return false;
}

module.exports.check_user_note = async(user,id)=>{
    var sql = `SELECT * FROM usernotes WHERE username  = $1 AND note_id = $2`;

    var dbRes = await database.query(sql,[user,id]);
    console.log(`SELECT check usernote exists`);

    if(dbRes.rowCount>0){
        return true;
    }
    else{
        return false;
    }
}

module.exports.check_category = async (cat_id) => {

    var dbRes;
    const query = `SELECT * FROM categories WHERE category_id = $1`;
    console.log('SELECT Check that the catgory exists using id');

    try {
        dbRes = await database.query(query, [cat_id]);
        if (dbRes.rowCount > 0) {
            return true;
        } else {
            return false;
        }
    } catch (err){
        console.log('ERROR');
        return false;
    }
}

module.exports.check_user_category = async (username,category_id) => {

    var dbRes;

    const query = `SELECT * FROM usercategories WHERE username = $1 AND category_id = $2`;

    dbRes = await database.query(query, [username,category_id]);
    console.log("SELECT check user-category");
    if (dbRes.rowCount>0){
        return true;
    }
    else{
        return false;
    }

}

module.exports.check_if_email_exists = async (email) => {
    
    var dbRes;

    const query = `
    SELECT * 
    FROM users 
    WHERE email = $1;
    `;
    
    dbRes = await database.query(query,[email]);
    console.log("SELECT check if email has already been used");
    if (dbRes.rowCount > 0){
        
        return true;
    }
    else
        return false;
}

module.exports.check_note_viewer= async (username,note_id) => {
    
    var dbRes;

    const query = `
    SELECT * 
    FROM usernotes 
    WHERE username = $1 AND note_id = $2 AND role = $3;
    `;
    
    dbRes = await database.query(query,[username,note_id,"viewer"]);
    console.log("SELECT check if user is note viewer");
    if (dbRes.rowCount > 0){
        return true;
    }
    else
        return false;
}

module.exports.check_has_write_access = async (username, note_id) => {

    
    const sql = `
    SELECT role
    FROM usernotes
    WHERE username = $1 AND note_id = $2`;

    var dbRes = await database.query(sql, [username, note_id]);
    console.log("SELECT check whether provided user has write access to note "+note_id);

    if (dbRes.rowCount> 0) { // Then there was note note with that id related that user

        var role = dbRes['rows'][0].role;
        console.log(role);

        if (role == 'collaborator' || role == 'owner') {
            return true;
        }
        return true;
    }
    return false;

}

module.exports.update_body = async (note_id,body) => {
    
    var dbRes;

    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hrs = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    let timezone = date.getTimezoneOffset();


    let last_updated = `${year}-${month}-${day} ${hrs}:${min}:${sec}`;
    
    const query = `
    UPDATE Notes 
    SET body = $1, last_used = $2
    WHERE id = $3
    RETURNING *;
    `;

    const query_params = [body, last_updated, note_id];

    dbRes = await database.query(query, query_params);
    console.log("UPDATE the body of the note: "+note_id);
    return dbRes;

}

module.exports.update_role = async (username, new_role, note_id, user_to_change) => {

    var message;

    if (await this.check_owner(note_id, username)) {

        const update_role = `
        UPDATE usernotes
        SET role = $1
        WHERE username = $2 AND note_id = $3 RETURNING *;
        `;

        dbRes = await database.query(update_role, [new_role, user_to_change, note_id]);
        console.log("UPDATE usernotes role");

        if (dbRes.rowCount > 0) {
            message = "The users role has been changed.";
            return message
        } else {
            message = "The users role could not be changed.";
        }

    } else {
        console.log("Comes into else");
        message = "Only the owner of the note may change another user's role";
    }

    return message;

}

module.exports.update_category_name = async (cat_id, category_name) => {

    var message;
    var dbRes;

        const change_name = `
        UPDATE categories 
        SET category_name = $1 
        WHERE category_id = $2;
        `;

        dbRes = await database.query(change_name, [category_name, cat_id]);
        console.log("UPDATE category name: "+category_name);
        if (dbRes.rowCount > 0 ) {
            message = "Name of category successfully changed";
        } else {
            message = "Name of category could not be changed";
        }

    

    return message;

}

module.exports.update_note = async (params,data, note_id) => {

    const sql = `UPDATE notes SET ${params} WHERE id = $${params.length+1}`;
    const dbRes = await database.query(sql,[...data,note_id]);
    console.log("UPDATE update contents of note "+note_id);
    return dbRes;
}

module.exports.update_user = async (params,data) => {

    const sql = `UPDATE users SET ${params} WHERE username = $${params.length+1}`;
   
    const dbRes = await database.query(sql,[...data]);
    console.log("UPDATE info for user");
    return dbRes;
}

module.exports.add_member = async (username, new_role, note_id, user_to_add) => {

    var message;

    if (await this.check_owner(note_id, username)) {
        if (new_role == "owner"){

            var get_note = await this.get_a_note(note_id,username);
            
            let sql = `INSERT INTO usernotes (role,username,note_id) VALUES ($1,$2,$3)`;
            dbRes = await database.query(sql, ["owner", user_to_add, note_id]);
            console.log("INSERT usernote owner added: "+user_to_add);

            sql = `UPDATE usernotes SET role = $1 WHERE username = $2 AND note_id = $3`;
            dbRes = await database.query(sql, ["collaborator", username, note_id]);
            console.log("UPDATE old owner change to collaborator: "+username);

            
            let add_category = await this.add_user_category(user_to_add,get_note['rows'][0]['category_name']);
            sql = `UPDATE notes SET category_id = $1 WHERE id = $2`;
            dbRes = await database.query(sql, [add_category['rows'][0]['category_id'], note_id]);
            console.log("UPDATE note category changed to new owner owner: "+user_to_add);

            return message = `Owner successfully replaced`;
        }
        
    
        const update_role = `
            INSERT INTO usernotes (role, username, note_id)
            VALUES($1, $2, $3);
            `;
            dbRes = await database.query(update_role, [new_role, user_to_add, note_id]);
        console.log(`INSERT usernote for ${username} on note: ${note_id}`);
        if (dbRes.rowCount > 0) {
            message = "The users has been added as a member with the specified role";
            return message
        } else {
            message = "The user could not be added as a member";
        }
 
    } else {
        message = "Only the owner of the note may add members";
    }

    return message;
}

module.exports.add_user_category = async (username,category_name) => {
    
    var sql = `SELECT category_id FROM categories WHERE category_name = $1`;
    let dbRes = await database.query(sql, [category_name]);
    console.log(`SELECT all category_id for category_name `);

    if (dbRes.rowCount>0){
        var cat_id = [];

        for (i=0;i<dbRes.rowCount;i++){
            cat_id.push(dbRes.rows[i]['category_id']);
        }
        const placeholders = cat_id.map((_, index) => `$${index + 1}`).join(',');

        sql = `SELECT * FROM usercategories WHERE category_id IN (${placeholders}) AND username = $${cat_id.length+1};`;
        dbRes = await database.query(sql, [...cat_id,username]);
        console.log(`SELECT check user-category relationship`);
    }
    
    if (dbRes.rowCount == 1){//already exists
        return dbRes;
    }
    else if (dbRes.rowCount>1){
        console.log("ERROR: TOO MANY USERCATEGORIES");
        return dbRes;
    }
    else{//must add user category
        sql = `INSERT INTO categories (category_name) VALUES ($1) RETURNING *`;
        dbRes = await database.query(sql, [category_name]);
        console.log("INSERT category: "+category_name);
        
        sql = `INSERT INTO usercategories (category_id,username) VALUES ($1,$2) RETURNING *`;
        dbRes = await database.query(sql, [dbRes.rows[0]['category_id'],username]);
        console.log("INSERT usercategory for user: "+username);
        return dbRes;
    }
    
}

module.exports.delete_user = async (username) => {

    let sql = `SELECT category_id FROM usercategories WHERE username = $1`;
    const dbRes = await database.query(sql,[username]);
    console.log("SELECT get all category_ids for user:"+username);
    count = dbRes.rowCount;
    if (count > 0){ 
          
        var index = 0;
        var cat_ids = dbRes['rows'];

        while (index<count){
            console.log("In it");
            console.log(cat_ids[index]['category_id']);
            result = await this.delete_category(username,cat_ids[index]['category_id']);
            index = index +1;
        }
    }

    sql = `DELETE FROM users WHERE username = $1 RETURNING *`;
    result = await database.query(sql,[username]);
    console.log("DELETE user:"+username);
    return result['rows'][0];

}


module.exports.delete_category = async (username, cat_id) => {

    // delete from user catagories 
    var dbRes;
    var note_ids = [];
    var sql = `
    DELETE FROM usercategories
    WHERE username = $1 AND category_id = $2`;

    dbRes = await database.query(sql, [username, cat_id]);
    console.log('DELETE all usercategory entries for user with passed category ID')

    // get all the note_id's for the notes in that category
    sql = `
    SELECT id
    FROM notes
    WHERE category_id = $1`;

    dbRes= await database.query(sql, [cat_id]);
    console.log('SELECT all the notes that have a matching category id');
    console.log(dbRes);

    console.log(dbRes.rowCount);

    var limit = dbRes.rowCount;
    var index = 0;
    var note_ids = dbRes['rows'];

    while (index < limit){
        dbRes = await this.delete_note(note_ids[index]['id'], username);
        index = index + 1;
    }

    sql = `
    DELETE 
    FROM categories
    WHERE category_id = $1`;

    dbRes= await database.query(sql, [cat_id]);
    console.log('DELETE category: '+cat_id);
    return message = "Success";
    
}

module.exports.delete_note = async (note_id, username) => {

    var dbRes;

    if (await this.check_owner(note_id, username)) { // if they are the owner delete the note for them, in notes table and everyone else

        const delete_in_notes = `
        DELETE FROM notes
        WHERE id = $1;`;

        const delete_in_usernotes = `
        DELETE FROM usernotes
        WHERE note_id = $1`;

        dbRes = await database.query(delete_in_usernotes, [note_id]); 
        console.log("DELETE all realtions to note: "+note_id);
        dbRes = await database.query(delete_in_notes, [note_id]);        // delete any empty categories ?
        console.log("DELETE note from notes: "+note_id);

        if (dbRes.rowCount > 0) {
            return { Message: "Note has been successfully deleted.", NoteId: note_id }
        }

        return {databaseError: "Note could not be deleted."}

    } else {                    // if the user is not an owner of the note it just removes 

        const delete_in_usernotes = `
        DELETE FROM usernotes
        WHERE note_id = $1 AND username = $2`;

        dbRes = database.query(delete_in_usernotes, [note_id, username]);
        console.log("Remove note from user's library, note: "+note_id);

        return { Message: "Note has been successfully deleted.", NoteId: note_id }; 
    }

}

module.exports.delete_user_note = async (username,note_id) => {
    const sql = `DELETE FROM usernotes WHERE username = $1 AND note_id = $2 RETURNING *`;
    dbRes = await database.query(sql,[username,note_id]);
    return dbRes;
}

module.exports.notes = async()=>{
    var dbRes;

    const sql =`SELECT notes.*, categories.category_name 
    FROM notes
    JOIN categories ON notes.category_id = categories.category_id;`;

    dbRes = await database.query(sql);

    return dbRes.rows;
}

module.exports.users = async()=>{
    var dbRes;

    const query = `SELECT * FROM users;`;

    dbRes = await database.query(query);

    return dbRes.rows;
}

module.exports.usercategories = async()=>{
    var dbRes;

    const query = `SELECT * FROM usercategories;`;

    dbRes = await database.query(query);

    return dbRes.rows;
}

module.exports.categories = async()=>{
    var dbRes;

    const query = `SELECT * FROM categories;`;

    dbRes = await database.query(query);

    return dbRes.rows;
}

module.exports.usernotes = async()=>{
    var dbRes;

    const query = `SELECT * FROM usernotes;`;

    dbRes = await database.query(query);

    return dbRes.rows;
}



/**
 * Description. This function updates the password for a user if they want to reset it.
 * @param {String} email Email of the person who needs their password updated
 * @param {String} hash encrypted updated password to be stored in the database
 * @returns response from the database
 */
module.exports.update_password = async (email,hash) => {
    const update_password_query = "UPDATE users SET password = $1 WHERE email = $2";
    const dbRes = await database.query(update_password_query,[hash,email]);

    return dbRes;

}


module.exports.getCategoryID = async(username, cat_name)=>{

    var dbRes;
    var sql = `
    SELECT category_id
    FROM public.categories
    WHERE category_name = $2
    AND category_id IN (SELECT category_id FROM usercategories WHERE username = $1)`;

    dbRes = await database.query(sql, [username, cat_name]);
    console.log(dbRes.rows);
    return dbRes.rows;
}

/**
 * Description. This function updates the the username for a user
 * @param {String} email Email of the user that wants to change username
 * @param {String} current_username the users current username
 * @param {String} new_username the value the username is going to be updated to
 * @returns 
 */
module.exports.update_username = async (email,current_username,new_username) => {
    // const update_password_query = "UPDATE users SET password = $1 WHERE email = $2";
    // const dbRes = await database.query(update_password_query,[hash,email]);

    // return dbRes;
    let dbRes;
    let successful = false;
    // console.log(current_username);
    console.log(new_username);
    let dropped_constraints = false;
    try {
        // Drop the foreign key constraint
        dbRes = await database.query('ALTER TABLE usernotes DROP CONSTRAINT usernotes_username_fkey');
        // console.log(dbRes);
        dbRes = await database.query('ALTER TABLE usercategories DROP CONSTRAINT usercategories_username_fkey');
        // console.log(dbRes);

        dropped_constraints = true;
    
        // Update the primary key in parent_table
        dbRes = await database.query('UPDATE users SET username = $1 WHERE email = $2', [new_username, email]);
        if(dbRes.severity === "ERROR") {
            successful = false;
            console.log("erorrdafadf")
        }
        
        

        // Update the foreign key values in child_table
        dbRes = await database.query('UPDATE usernotes SET username = $1 WHERE username = $2', [new_username, current_username]);
        if(dbRes.severity === "ERROR") {
            successful = false;
            console.log("erorrdafadf")
        }

        await database.query('UPDATE usercategories SET username = $1 WHERE username = $2', [new_username, current_username]);
        if(dbRes.severity === "ERROR") {
            successful = false;
            console.log("erorrdafadf")
        }
    
    
        successful =  true;
      } catch (error) {
        console.error('Error updating primary key:', error);
        successful = false;
        // console.log(successful)
      }

      // Re-create the foreign key constraint
      if(dropped_constraints === true){
        await database.query('ALTER TABLE usernotes ADD FOREIGN KEY (username) REFERENCES public.users (username)');
        await database.query('ALTER TABLE usercategories ADD FOREIGN KEY (username) REFERENCES public.users (username)');
      }
      return successful;

}


/**
 * Description. This function updates the avatar for a user
 * @param {String} email Email of the person
 * @param {String} new_avatar the new avatar value for the user
 * @returns response from the database
 */
module.exports.update_avatar = async (email,new_avatar) => {
    const update_avatar_query = "UPDATE users SET avatar_url = $1 WHERE email = $2";
    const dbRes = await database.query(update_avatar_query,[new_avatar,email]);

    return dbRes;

}


/**
 * Description. This function updates the email
 * @param {String} username the username of the user
 * @param {String} email Email of the person
 * @returns response from the database
 */
module.exports.update_email = async (username,email) => {
    const update_avatar_query = "UPDATE users SET email = $1 WHERE username = $2";
    console.log(email, username);
    const dbRes = await database.query(update_avatar_query,[email,username]);

    return dbRes;

}


