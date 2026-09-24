const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/auth.middleware");
const attachUser = require("../middlewares/user.middleware");
const User = require("../models/user");
const apiKeyRoutes = require("./dashboard/api-key.routes");
const projectRoutes = require("./dashboard/project.routes");

router.use(isAuthenticated);
router.use(attachUser);

router.use("/", apiKeyRoutes);
router.use("/", projectRoutes);

router.get("/overview", async (req, res) => {
  res.render("dashboard/overview");
});

router.get("/usage", (req, res) => {
  res.render("dashboard/usage");
});

router.get("/settings", (req, res) => {
  res.render("dashboard/setting");
});

router.patch("/settings/profile", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId,
      {
        name: name.trim(),
        email: email.trim(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Profile update error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.get("/documentation", (req, res) => {
  res.render("dashboard/docs");
});

module.exports = router;
