const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./config/keys');
const app = express();
app.use(
    cookieSession(
        {
            Age: 30*24*60*60*1000,
            keys: [keys.cookieKey]
        }
    )
);
app.use(passport.initialize());
app.use(passport.session());


require('./models/User')
const User = mongoose.model('users');

passport.serializeUser((user,done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

mongoose.connect(keys.mongooseURI);

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {

        User.findOne({googleId:profile.id}).then( existingUser => {
            if(existingUser){
                done(null, existingUser);
            }
            else{
                new User({
                    googleId:profile.id
                }).save().
                then(user => done(null, user));
            }
        })
    //console.log('access token',accessToken);
    //console.log('profile', profile);

    
})
);

app.get('/auth/google', passport.authenticate('google',{
scope: ['profile','email']
})
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google')
    );
//app.get('/', (req,res) =>{
//res.send({hi:'there'});
//});
app.get('/api/current_user', (req,res) => {
    res.send(req.user);
});

app.get('/api/logout', (req,res) => {
    req.logout();
    res.send(req.user);
});
app.listen(5000);

//http://localhost:5000/