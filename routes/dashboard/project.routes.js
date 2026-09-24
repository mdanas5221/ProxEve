const express = require("express");
const router = express.Router();
const Project = require("../../models/project");

router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find({ user: req.session.userId }).sort({
      createdAt: -1,
    });

    res.render("dashboard/project.ejs", { projects });

    console.log(projects);
  } catch (error) {
    console.log("Fetch projects error:", error);
    res.status(500).send("Failed to load projects");
  }
});

router.post("/projects", async (req, res) => {
  try {
    const { name, description, aiProvider } = req.body;

    if (!name || !name.trim() || !description || !aiProvider) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const project = await Project.create({
      user: req.session.userId,
      name: name.trim(),
      description: description.trim(),
      aiProvider,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.log("Project creation error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports = router;
