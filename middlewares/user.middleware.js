const User = require("../models/user");

async function attachUser(req, res, next) {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).send("user not found");
    }

    res.locals.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
}

module.exports = attachUser;
