const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/auth.middleware");

router.use(isAuthenticated);

router.get("/overview", (req, res) => {
  res.render("dashboard/overview");
});

router.get("/projects", (req, res) => {
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
