import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "auth",
  password: "123",
  port: 5432,
});

db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* Landing Page */
app.get("/", (req, res) => {
  res.render("landing.ejs", { currentPath: "/" });
});

/* Login Page */
app.get("/login", (req, res) => {
  res.render("login.ejs", { error: null, currentPath: "/login" });
});

/* Register Page */
app.get("/register", (req, res) => {
  res.render("register.ejs", { error: null, currentPath: "/register" });
});

/* Home Page (after login/register) */
app.get("/home", (req, res) => {
  res.render("home.ejs", { currentPath: "/home" });
});

/* Flashcard Sets Page */
app.get("/sets", (req, res) => {
  res.render("sets.ejs", { currentPath: "/sets" });
});

/* Individual Cards Page */
app.get("/cards", (req, res) => {
  res.render("cards.ejs", { currentPath: "/cards" });
});

/* REGISTER USER */
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

    res.render("register.ejs", {
      error: "Something went wrong. Please try again.",
      currentPath: "/register"
    });
  }
});

/* LOGIN USER */
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
``
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});