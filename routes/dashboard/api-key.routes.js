const express = require("express");
const router = express.Router();
const generateApiKey = require("../../utils/generateApiKey");
const ApiKey = require("../../models/apiKey");

router.get("/api-keys", (req, res) => {
  res.render("dashboard/api-key");
});

router.post("/api-keys", async (req, res) => {
  try {
    const { name, project, environment } = req.body;

    if (!name || !name.trim() || !project || !project.trim() || !environment) {
      return res.status(400).json({
        message: "API key name is required",
      });
    }

    const generatedKey = generateApiKey();

    const { rawKey, keyPrefix, keyHash } = generatedKey;

    const apiKey = await ApiKey.create({
      user: req.session.userId,
      name: name.trim(),
      project: project.trim(),
      environment,
      keyPrefix,
      keyHash,
    });

    res.status(201).json({
      message: "API key created successfully",

      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        project: apiKey.project,
        environment: apiKey.environment,
        keyPrefix: apiKey.keyPrefix,
        key: rawKey,
      },
    });
  } catch (error) {
    console.log("API key creation error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports = router;