const crypto = require("crypto");

function generateApiKey() {
  const randomSecret = crypto.randomBytes(32).toString("hex");

  const rawKey = `pxv_live_${randomSecret}`;

  const keyPrefix = rawKey.slice(0, 14);

  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  return {
    rawKey,
    keyPrefix,
    keyHash,
  };
}

module.exports = generateApiKey;
