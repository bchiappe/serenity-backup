const crypto = require("crypto");
const config = require("config");

const algorithm = config.get("encryption.algorithm");
const secret = config.get("encryption.secret");
const iv = crypto.randomBytes(16);

exports.encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secret, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

exports.decrypt = (hash) => {
  const sections = hash.split(":");
  const iv = sections[0];
  const content = sections[1];
  const decipher = crypto.createDecipheriv(
    algorithm,
    secret,
    Buffer.from(iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString();
};
