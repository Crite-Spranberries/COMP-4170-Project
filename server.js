import express from "express";
import { createDbClient } from "./db/client.js";

const app = express();
const port = 3000;
const FLASHCARD_SIDE_MAX_CHARS = 120;

const db = createDbClient();

db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("landing.ejs", { currentPath: "/" });
});

app.get("/login", (req, res) => {
  res.render("login.ejs", { error: null, currentPath: "/login" });
});

app.get("/register", (req, res) => {
  res.render("register.ejs", { error: null, currentPath: "/register" });
});

app.get("/home", (req, res) => {
  res.render("home.ejs", { currentPath: "/home" });
});


// GET SETS PAGE
app.get("/sets", async (req, res) => {

  try {

    const result = await db.query("SELECT * FROM sets ORDER BY id");

    res.render("sets.ejs", {
      sets: result.rows,
      currentPath: "/sets"
    });

  } catch (err) {
    console.log(err);
    res.send("Database error");
  }

});

// Deck editor (Quizlet-style)
app.get("/decks/:id", async (req, res) => {
  const setId = req.params.id;

  try {
    const setResult = await db.query("SELECT * FROM sets WHERE id = $1", [setId]);
    if (setResult.rows.length === 0) return res.redirect("/sets");

    const cardsResult = await db.query(
      "SELECT id, front, back FROM flashcards WHERE set_id = $1 ORDER BY id",
      [setId]
    );

    res.render("deck.ejs", {
      set: setResult.rows[0],
      flashcards: cardsResult.rows,
      currentPath: "/sets",
    });
  } catch (err) {
    console.log(err);
    res.send("Database error");
  }
});

app.post("/decks/:id/rename", async (req, res) => {
  const setId = req.params.id;
  const { title } = req.body || {};

  if (typeof title !== "string" || title.trim() === "") {
    return res.json({ success: false });
  }

  try {
    await db.query("UPDATE sets SET title = $1 WHERE id = $2", [title.trim(), setId]);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

app.post("/decks/:id/flashcards/create", async (req, res) => {
  const setId = req.params.id;
  const front = (req.body.front || "").trim();
  const back = (req.body.back || "").trim();

  if (
    !front ||
    !back ||
    front.length > FLASHCARD_SIDE_MAX_CHARS ||
    back.length > FLASHCARD_SIDE_MAX_CHARS
  ) {
    return res.redirect(`/decks/${setId}`);
  }

  try {
    await db.query("INSERT INTO flashcards (set_id, front, back) VALUES ($1, $2, $3)", [
      setId,
      front,
      back,
    ]);
    await db.query(
      "UPDATE sets SET cards = (SELECT COUNT(*) FROM flashcards WHERE set_id = $1) WHERE id = $1",
      [setId]
    );
    res.redirect(`/decks/${setId}`);
  } catch (err) {
    console.log(err);
    res.redirect(`/decks/${setId}`);
  }
});

app.post("/decks/:id/flashcards/:cardId/edit", async (req, res) => {
  const setId = req.params.id;
  const cardId = req.params.cardId;
  const { front, back } = req.body || {};

  if (typeof front !== "string" || typeof back !== "string") {
    return res.json({ success: false });
  }

  const frontTrimmed = front.trim();
  const backTrimmed = back.trim();
  if (
    !frontTrimmed ||
    !backTrimmed ||
    frontTrimmed.length > FLASHCARD_SIDE_MAX_CHARS ||
    backTrimmed.length > FLASHCARD_SIDE_MAX_CHARS
  ) {
    return res.json({ success: false });
  }

  try {
    await db.query(
      "UPDATE flashcards SET front = $1, back = $2 WHERE id = $3 AND set_id = $4",
      [frontTrimmed, backTrimmed, cardId, setId]
    );
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

app.post("/decks/:id/flashcards/:cardId/delete", async (req, res) => {
  const setId = req.params.id;
  const cardId = req.params.cardId;

  try {
    await db.query("DELETE FROM flashcards WHERE id = $1 AND set_id = $2", [cardId, setId]);
    await db.query(
      "UPDATE sets SET cards = (SELECT COUNT(*) FROM flashcards WHERE set_id = $1) WHERE id = $1",
      [setId]
    );
  } catch (err) {
    console.log(err);
  }

  res.redirect(`/decks/${setId}`);
});

// Study & Preview: load set + flashcards for one view (mode = study | preview)
app.get("/decks/:id/study", async (req, res) => {
  const setId = req.params.id;
  try {
    const setResult = await db.query("SELECT * FROM sets WHERE id = $1", [setId]);
    if (setResult.rows.length === 0) return res.redirect("/sets");
    const cardsResult = await db.query(
      "SELECT id, front, back FROM flashcards WHERE set_id = $1 ORDER BY id",
      [setId]
    );
    res.render("study.ejs", {
      mode: "study",
      set: setResult.rows[0],
      flashcards: cardsResult.rows,
      currentPath: "/sets",
    });
  } catch (err) {
    console.log(err);
    res.send("Database error");
  }
});

app.get("/decks/:id/preview", async (req, res) => {
  const setId = req.params.id;
  try {
    const setResult = await db.query("SELECT * FROM sets WHERE id = $1", [setId]);
    if (setResult.rows.length === 0) return res.redirect("/sets");
    const cardsResult = await db.query(
      "SELECT id, front, back FROM flashcards WHERE set_id = $1 ORDER BY id",
      [setId]
    );
    res.render("study.ejs", {
      mode: "preview",
      set: setResult.rows[0],
      flashcards: cardsResult.rows,
      currentPath: "/sets",
    });
  } catch (err) {
    console.log(err);
    res.send("Database error");
  }
});

// CREATE SET
app.post("/sets/create", async (req, res) => {

  const { title, color } = req.body;
  const safeTitle = typeof title === "string" && title.trim() ? title.trim() : "Untitled Deck";
  const safeColor = typeof color === "string" && color.trim() ? color.trim() : "#FF9B00";

  try {

    await db.query(
      "INSERT INTO sets (topic, title, cards, color) VALUES ($1,$2,$3,$4)",
      ["Custom Deck", safeTitle, 0, safeColor]
    );

    res.json({ success: true });

  } catch (err) {

    console.log(err);
    res.json({ success: false });

  }

});

app.post("/sets/edit", async (req, res) => {

  const { id, title, color } = req.body;

  try {

    if (typeof title === "string" && typeof color === "string") {
      await db.query("UPDATE sets SET title=$1, color=$2 WHERE id=$3", [
        title,
        color,
        id,
      ]);
    } else if (typeof title === "string") {
      await db.query("UPDATE sets SET title=$1 WHERE id=$2", [title, id]);
    } else if (typeof color === "string") {
      await db.query("UPDATE sets SET color=$1 WHERE id=$2", [color, id]);
    } else {
      return res.json({ success: false });
    }

    res.json({ success: true });

  } catch (err) {

    console.log(err);
    res.json({ success: false });

  }

});

app.post("/sets/delete", async (req, res) => {

  const { id } = req.body;

  console.log("Deleting set id:", id);

  try {

    const result = await db.query(
      "DELETE FROM sets WHERE id=$1",
      [id]
    );

    console.log("Rows deleted:", result.rowCount);

    res.json({ success: true });

  } catch (err) {

    console.log(err);
    res.json({ success: false });

  }

});

// Cards are managed per-deck now.
// Compatibility: /cards?set=X → study page
app.get("/cards", (req, res) => {
  const setId = req.query.set;
  if (setId) return res.redirect(`/decks/${setId}/study`);
  res.redirect("/sets");
});

app.post("/register", async (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  try {

    const checkUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkUser.rows.length > 0) {

      res.render("register.ejs", {
        error: "Email already exists. Try logging in.",
        currentPath: "/register"
      });

    } else {

      await db.query(
        "INSERT INTO users (email, password) VALUES ($1, $2)",
        [email, password]
      );

      res.redirect("/home");

    }

  } catch (err) {

    console.log(err);

    let errorMessage = "Something went wrong. Please try again.";
    // If `users.id` is NOT NULL but has no default/identity, the INSERT will try to write NULL for id.
    if (err && err.code === "23502" && err.column === "id") {
      errorMessage =
        "Registration failed: `users.id` must be auto-generated (set it to SERIAL/IDENTITY).";
    }

    res.render("register.ejs", {
      error: errorMessage,
      currentPath: "/register"
    });

  }

});


// LOGIN
app.post("/login", async (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  try {

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length > 0) {

      const storedPassword = result.rows[0].password;

      if (password === storedPassword) {

        res.redirect("/home");

      } else {

        res.render("login.ejs", {
          error: "Incorrect Password",
          currentPath: "/login"
        });

      }

    } else {

      res.render("login.ejs", {
        error: "User not found",
        currentPath: "/login"
      });

    }

  } catch (err) {

    console.log(err);

    res.render("login.ejs", {
      error: "Something went wrong.",
      currentPath: "/login"
    });

  }

});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});