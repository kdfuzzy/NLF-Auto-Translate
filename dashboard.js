const express = require("express");
const session = require("express-session");
const OAuth = require("discord-oauth2");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// ---------- SAFE LOAD JSON ----------
function loadJSON(filepath, fallback) {
    try {
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, JSON.stringify(fallback, null, 4));
            return fallback;
        }
        return JSON.parse(fs.readFileSync(filepath, "utf8")) || fallback;
    } catch (err) {
        console.error("JSON Load Failed:", err);
        return fallback;
    }
}

function saveJSON(filepath, data) {
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 4));
    } catch (err) {
        console.error("JSON Save Failed:", err);
    }
}

// ---------- DATABASES ----------
let config = loadJSON("./config/config.json", { ticketCategory: "" });
let ticketDB = loadJSON("./stats/tickets.json", { tickets: {} });

// ---------- OAUTH ----------
const oauth = new OAuth({
    clientId: process.env.CLIENT_ID ?? "",
    clientSecret: process.env.CLIENT_SECRET ?? "",
    redirectUri: process.env.REDIRECT_URI ?? ""
});

// ---------- SERVER CONFIG ----------
app.set("env", "development");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// ---------- SESSION ----------
app.use(
    session({
        secret: "NLFSecretKey",
        resave: false,
        saveUninitialized: false
    })
);

// ---------- REQUIRE LOGIN ----------
function requireAuth(req, res, next) {
    if (!req.session.user) return res.redirect("/login");
    next();
}

// ---------- GLOBAL ERROR CATCH ----------
app.use((err, req, res, next) => {
    console.error("🔥 DASHBOARD ERROR:", err);
    res.status(500).send("Internal Server Error");
});

// ---------- HOME ----------
app.get("/", (req, res) => res.render("home"));

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
        if (req.query.error) return res.send("OAuth Error: " + req.query.error);

        const token = await oauth.tokenRequest({
            code: req.query.code,
            scope: ["identify"],
            grantType: "authorization_code"
        });

        const user = await oauth.getUser(token.access_token);
        req.session.user = {
            id: user.id,
            username: user.username,
            avatar: user.avatar ?? null
        };

        res.redirect("/dashboard");
    } catch (err) {
        console.error("OAuth Callback Error:", err);
        res.send("OAuth failed: " + err.message);
    }
});

// ---------- DASHBOARD ----------
app.get("/dashboard", requireAuth, (req, res) => {
    const tickets = Object.values(ticketDB.tickets ?? {});

    const stats = {
        total: tickets.length || 0,
        open: tickets.filter(t => t.status === "open").length || 0,
        closed: tickets.filter(t => t.status === "closed").length || 0
    };

    res.render("dashboard", {
        user: req.session.user,
        stats
    });
});

// ---------- TICKETS PAGE ----------
app.get("/tickets", requireAuth, (req, res) => {
    const tickets = Object.values(ticketDB.tickets ?? {});

    res.render("tickets", {
        user: req.session.user,
        tickets,
        guild: process.env.GUILD_ID ?? "0"
    });
});

// ---------- STAFF PAGE ----------
app.get("/staff", requireAuth, (req, res) => {
    const data = ticketDB.tickets ?? {};
    const staffStats = {};

    for (let t of Object.values(data)) {
        if (!t.claimedBy) continue;
        if (!staffStats[t.claimedBy]) staffStats[t.claimedBy] = { claimed: 0, closed: 0 };

        staffStats[t.claimedBy].claimed++;
        if (t.status === "closed") staffStats[t.claimedBy].closed++;
    }

    const leaderboard = Object.entries(staffStats).map(([id, s]) => ({
        id,
        claimed: s.claimed,
        closed: s.closed
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
    saveJSON("./config/config.json", config);
    res.redirect("/settings");
});

// ---------- LOGOUT ----------
app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

// ---------- START ----------
app.listen(process.env.PORT || 3000, () =>
    console.log("🌐 Dashboard is running on port " + (process.env.PORT || 3000))
);
