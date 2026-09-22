const connectDB = require("./config/db");
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

connectDB()
  .then(() => {
    console.log("Successfully connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// DEFAULT MIDDLEWARES
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

// EXPRESS SETTINGS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ROUTES
app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// LISTENING PORT
app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});

// STARTS FROM SETTINGS FORM SUBMISSION
