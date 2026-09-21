const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const router = express.Router();

// SIGNUP GET ROUTE
router.get("/signup", (req, res) => {
  res.render("auth/signup.ejs");
});

// SIGNUP POST ROUTE
router.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).send("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    req.session.userId = newUser._id;

    res.redirect("/dashboard/overview");
  } catch (error) {
    console.log(error);
  }
});

// SIGNIN GET ROUTE
router.get("/signin", (req, res) => {
  res.render("auth/signin.ejs");
});

// SIGNIN POST ROUTE
router.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingEmail = await User.findOne({ email });

    if (!existingEmail) {
      return res.send("Could not found your account, create new account");
    }

    const userMatch = await bcrypt.compare(password, existingEmail.password);

    if (!userMatch) {
      return res.send("Username or password is incorrect");
    }

    req.session.userId = existingEmail._id;

    res.redirect("/dashboard/overview");
  } catch (error) {
    console.log(error);
  }
});

// LOG OUT ROUTE
router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
      return res.status(500).send("Logout Failed");
    }

    res.clearCookie("connect.sid");

    res.redirect("/signin");
  });
});

module.exports = router;
