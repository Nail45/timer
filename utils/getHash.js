const crypto = require("crypto");

const getHash = (data) => {
  const hash = crypto.createHash("sha256");
  return hash.update(data).digest("hex");
};

module.exports = getHash;
