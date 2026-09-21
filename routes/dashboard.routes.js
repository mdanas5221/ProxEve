const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/auth.middleware");
const attachUser = require("../middlewares/user.middleware");
const User = require("../models/user");

router.use(isAuthenticated);
router.use(attachUser);

router.get("/overview", async (req, res) => {
  res.render("dashboard/overview");
});

router.get("/projects", async (req, res) => {
  res.render("dashboard/project.ejs");
});

router.get("/api-keys", (req, res) => {
  res.render("dashboard/api-key");
});

router.get("/usage", (req, res) => {
  res.render("dashboard/usage");
});

router.get("/settings", (req, res) => {
  res.render("dashboard/setting");
});

router.get("/documentation", (req, res) => {
  res.render("dashboard/docs");
});

module.exports = router;
