const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const users = {
    admin: {
        id: 1,
        username: 'admin',
        passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
    }
};

passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {
        const user = users[username];

        if (!user) {
            return done(null, false, { message: 'User not found' });
        }

        if (!bcrypt.compareSync(password, user.passwordHash)) {
            return done(null, false, { message: 'Invalid password' });
        }

        return done(null, user);
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = Object.values(users).find(u => u.id === id);
    done(null, user);
});

module.exports = passport;