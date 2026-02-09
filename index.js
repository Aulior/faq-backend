const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// DB
const db = new sqlite3.Database("./faq.db");

// Create table
db.run(`
CREATE TABLE IF NOT EXISTS faq (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT,
  answer TEXT,
  category TEXT,
  created_at TEXT,
  updated_at TEXT
)
`);

// GET
app.get("/api/faq", (req, res) => {
    db.all("SELECT * FROM faq ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST
app.post("/api/faq", (req, res) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer required" });
    }

    db.run(
        "INSERT INTO faq (question, answer) VALUES (?, ?)",
        [question, answer],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, question, answer });
        }
    );
});


// PUT
app.put("/api/faq/:id", (req, res) => {
    const { question, answer, category } = req.body;
    const now = new Date().toISOString();

    db.run(
        `UPDATE faq SET question=?, answer=?, category=?, updated_at=?
     WHERE id=?`,
        [question, answer, category, now, req.params.id],
        err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// DELETE
app.delete("/api/faq/:id", (req, res) => {
    db.run("DELETE FROM faq WHERE id=?", [req.params.id], err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log("API running on :3000"));
