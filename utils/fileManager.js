const fs = require("fs");

module.exports = {
    loadJSON(path) {
        try {
            if (!fs.existsSync(path)) return {};
            const data = fs.readFileSync(path, "utf8");
            return JSON.parse(data || "{}");
        } catch (err) {
            console.error("JSON LOAD ERROR:", err);
            return {};
        }
    },

    saveJSON(path, data) {
        try {
            fs.writeFileSync(path, JSON.stringify(data, null, 4));
        } catch (err) {
            console.error("JSON SAVE ERROR:", err);
        }
    }
};
