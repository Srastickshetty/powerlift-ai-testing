const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../data/users.json");

function readUsers() {
  return JSON.parse(fs.readFileSync(usersPath, "utf-8"));
}

exports.getUserProfile = (req, res) => {
  const { uid } = req.params;
  const users = readUsers();

  const user = users.uids[uid];

  if (!user) {
    return res.status(404).json({ error: "User not registered" });
  }

  res.json(user);
};
