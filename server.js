const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport');

const users = require('./routes/api/users');
const posts = require('./routes/api/posts');
const profile = require('./routes/api/profile');

//Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//DB CONFIG
const db = require('./config/keys').mongoURI;
//Connect to MongoDB
mongoose.connect(db)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("ERROR: Couldn't connect to MongoDB: ", err));
//Passport middleware
app.use(passport.initialize());
//Passport Config
require('./config/passport')(passport);
//Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('Server is running');
});