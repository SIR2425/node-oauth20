import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Passport to use Google OAuth
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Here you could look up the user in the database or create a new one
    return done(null, profile);
  }
));

// Serialize user to session
passport.serializeUser((user, done) => {
  const userinfo = {id : user.id, displayName : user.displayName}
  done(null, userinfo);
});

// Deserialize user from session
passport.deserializeUser((userinfo, done) => {
    // You could look up the user information in the database
    // and pass it to the done function
  done(null,userinfo);
});

// Middleware
app.use(session({ secret: 'secretkey', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Login</h1><a href="/auth/google">Login with a Google Account</a>');
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/profile');
});

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
    console.log(req.user);
  // Display user's profile information
  res.send(`<h1>User Page</h1><p>Welcome, ${req.user.displayName}</p><a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
