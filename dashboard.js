const express = require("express");
const session = require("express-session");
const OAuth = require("discord-oauth2");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Utility to load/save JSON
function loadJSON(path) {
    return JSON.parse(fs.readFileSync(path, "utf8"));
}
function saveJSON(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
}

// Databases
let config = loadJSON("./config/config.json");
let ticketDB = loadJSON("./stats/tickets.json");

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
app.use(bodyParser.urlencoded({ extended: true }));

// SESSION
app.use(
    session({
        secret: "NLFSecretKey",
        resave: false,
        saveUninitialized: false
    })
);

// 🔹 MIDDLEWARE — REQUIRE LOGIN
function requireAuth(req, res, next) {
    if (!req.session.user) return res.redirect("/login");
    next();
}

// HOME PAGE
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

// 🌟 MAIN DASHBOARD PAGE
app.get("/dashboard", requireAuth, (req, res) => {
    const tickets = Object.values(ticketDB.tickets);

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === "open").length,
        closed: tickets.filter(t => t.status === "closed").length
    };

    res.render("dashboard", {
        user: req.session.user,
        stats
    });
});

// 🎟 TICKET LIST PAGE
app.get("/tickets", requireAuth, (req, res) => {
    res.render("tickets", {
        user: req.session.user,
        tickets: Object.values(ticketDB.tickets),
        guild: process.env.GUILD_ID
    });
});

// 🛠 STAFF LEADERBOARD PAGE
app.get("/staff", requireAuth, (req, res) => {
    const staffStats = {};

    for (let t of Object.values(ticketDB.tickets)) {
        if (!t.claimedBy) continue;

        if (!staffStats[t.claimedBy]) {
            staffStats[t.claimedBy] = { claimed: 0, closed: 0 };
        }

        staffStats[t.claimedBy].claimed++;

        if (t.status === "closed") {
            staffStats[t.claimedBy].closed++;
        }
    }

    const leaderboard = Object.entries(staffStats).map(([id, data]) => ({
        id,
        claimed: data.claimed,
        closed: data.closed
    }));

    res.render("staff", {
        user: req.session.user,
        staff: leaderboard
    });
});

// ⚙ BOT SETTINGS PAGE
app.get("/settings", requireAuth, (req, res) => {
    res.render("settings", {
        user: req.session.user,
        config
    });
});

// ⚙ SAVE SETTINGS
app.post("/save-settings", requireAuth, (req, res) => {
    config.ticketCategory = req.body.ticketCategory;
    saveJSON("./config/config.json", config);

    res.redirect("/settings");
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
