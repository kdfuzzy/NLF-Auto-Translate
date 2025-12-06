const express = require("express");
const session = require("express-session");
const OAuth = require("discord-oauth2");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// ---------- SAFE JSON LOADERS ----------
function safeLoad(path, fallback) {
    try {
        if (!fs.existsSync(path)) return fallback;
        const data = JSON.parse(fs.readFileSync(path, "utf8"));
        return data || fallback;
    } catch {
        return fallback;
    }
}

function safeSave(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
}

// ---------- LOAD DATABASES SAFELY ----------
let config = safeLoad("./config/config.json", { ticketCategory: "" });
let ticketDB = safeLoad("./stats/tickets.json", { tickets: {} });

// ---------- OAUTH ----------
const oauth = new OAuth({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

// ---------- EXPRESS SETTINGS ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        secret: "NLFSecretKey",
        resave: false,
        saveUninitialized: false
    })
);

// ---------- LOGIN MIDDLEWARE ----------
function requireAuth(req, res, next) {
    if (!req.session.user) return res.redirect("/login");
    next();
}

// ---------- HOME ----------
app.get("/", (req, res) => {
    res.render("home");
});

// ---------- LOGIN ----------
app.get("/login", (req, res) => {
    const url = oauth.generateAuthUrl({
        scope: ["identify"],
        state: "nlfbot"
    });
    res.redirect(url);
});

// ---------- CALLBACK ----------
app.get("/callback", async (req, res) => {
    try {
        if (req.query.error) return res.send("OAuth error: " + req.query.error);

        const token = await oauth.tokenRequest({
            code: req.query.code,
            scope: ["identify"],
            grantType: "authorization_code"
        });

        const user = await oauth.getUser(token.access_token);
        req.session.user = user;

        res.redirect("/dashboard");
    } catch (e) {
        res.send("OAuth failed: " + e.message);
    }
});

// ---------- DASHBOARD ----------
app.get("/dashboard", requireAuth, (req, res) => {
    const tickets = Object.values(ticketDB.tickets || {});

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

// ---------- TICKETS PAGE ----------
app.get("/tickets", requireAuth, (req, res) => {
    const tickets = Object.values(ticketDB.tickets || {});

    res.render("tickets", {
        user: req.session.user,
        tickets,
        guild: process.env.GUILD_ID || ""
    });
});

// ---------- STAFF PAGE ----------
app.get("/staff", requireAuth, (req, res) => {
    const staffStats = {};

    for (let t of Object.values(ticketDB.tickets || {})) {
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

// ---------- SETTINGS PAGE ----------
app.get("/settings", requireAuth, (req, res) => {
    res.render("settings", {
        user: req.session.user,
        config
    });
});

// ---------- SAVE SETTINGS ----------
app.post("/save-settings", requireAuth, (req, res) => {
    config.ticketCategory = req.body.ticketCategory || config.ticketCategory;
    safeSave("./config/config.json", config);
    res.redirect("/settings");
});

// ---------- LOGOUT ----------
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// ---------- START ----------
app.listen(process.env.PORT || 3000, () =>
    console.log("🌐 Dashboard running on port " + (process.env.PORT || 3000))
);
