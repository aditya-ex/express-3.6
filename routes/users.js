const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");
const {User, validate} = require("../models/users");

router.post('/',async(req,res)=>{
    try{
        const {error} = validate(req.body);
        if(error) return res.status(400).send(error.message);

        const user = await new User(req.body).save();
        await sendEmail(user.email, "user created");
        res.send(user);
    }catch (error){
        res.send("an error occured");
        console.log(error);
    }
});

module.exports = router;
