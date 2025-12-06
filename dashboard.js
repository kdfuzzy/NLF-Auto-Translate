const express = require("express");
const session = require("express-session");
const OAuth = require("discord-oauth2");
const path = require("path");
require("dotenv").config();

const app = express();

// OAUTH SETUP
const oauth = new OAuth({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

// VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// STATIC FILES
app.use(express.static("public"));

// SESSIONS
app.use(
    session({
        secret: "NLFSecretKey",
        resave: false,
        saveUninitialized: false
    })
);

// HOME
app.get("/", (req, res) => {
    res.render("home");
});

// LOGIN
app.get("/login", (req, res) => {
    const url = oauth.generateAuthUrl({
        scope: ["identify"],
        state: "nlfbot"
    });
    res.redirect(url);
});

// CALLBACK
app.get("/callback", async (req, res) => {
    if (req.query.error) return res.send("OAuth error: " + req.query.error);

    const token = await oauth.tokenRequest({
        code: req.query.code,
        scope: ["identify"],
        grantType: "authorization_code"
    });

    const user = await oauth.getUser(token.access_token);
    req.session.user = user;

    res.redirect("/dashboard");
});

// DASHBOARD
app.get("/dashboard", (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    res.render("dashboard", {
        user: req.session.user
    });
});

// LOGOUT
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// START SERVER
app.listen(process.env.PORT || 3000, () =>
    console.log("🌐 Dashboard running on port " + (process.env.PORT || 3000))
);
