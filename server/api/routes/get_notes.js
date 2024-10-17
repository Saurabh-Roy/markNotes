const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {

    //const dbRes = await database.query("SELECT * FROM notes")
    // res.status(200).json({
    //     message: "gets this"
    // })
})

router.get('/:noteID', (req, res, next) => {
    const id = req.params.noteID;
})

router.get('/:category', (req, res, next) => {
    const category = req.params.category;
})

router.get('/order=:recent', (req, res, next) => {
    
})

module.exports = router;