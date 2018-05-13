const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

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
    User.findOne({email: req.body.email})
        .then(user => {
            if(user){
                return res.status(400).json({email: 'Email Already exists'})
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

module.exports = router;