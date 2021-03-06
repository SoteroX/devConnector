const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//Load User model
const User = require('../../models/User');

//@route    GET /api/users/test
//@desc     test users routes
//@access   public
router.get('/test', (req, res) => res.json({msg: 'Users works'}))

//@route    GET /api/users/register
//@desc     register users
//@access   public
router.post('/register', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }
    User.findOne({email: req.body.email})
        .then(user => {
            if(user){
                errors.email = "Email already exist";
                return res.status(400).json(errors)
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', //size
                    r: 'pg',//rated PG
                    d: "mm"//Default
                })
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar, 
                    password: req.body.password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log('ERROR: ', err));
                    });
                });
            }
        });
});

//@route    GET /api/users/login
//@desc     login User / Returning JWT Token
//@access   public
router.post('/login', (req, res) => {
    //Check Validation
    const {errors, isValid} = validateLoginInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }
    const {email, password} = req.body;
    //Find User by Email
    User.findOne({email})
        .then(user => {
            //Check User
            if(!user){
                errors.email = ' User not found';
                return res.status(404).json(errors);
            }
            //Check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        //User Matched
                        //Create JWT Payload
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        };
                        //Sign Token
                        jwt.sign(
                            payload, 
                            keys.SECRET_KEY, 
                            { expiresIn: 3600 }, 
                            (err, token) => {
                                console.log("TOKEN IS: ", token);
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            }
                        );
                    } else {
                        errors.password = 'Password incorrect';
                        return res.status(400).json(errors);
                    }
                })
        })
});

//@route    GET /api/users/current
//@desc     Return current user
//@access   Private
router.get('/current', passport.authenticate('jwt',{ session: false }), (req, res) => {
    res.json({msg: 'Success'});
});

module.exports = router;