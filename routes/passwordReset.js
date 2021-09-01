const jwt = require("jsonwebtoken");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const { User } = require("../models/users");
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();
router.post("/forgot-password", async (req, res) => {
  try {
    const schema = Joi.object({ email: Joi.string().email().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.message);
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("user don't exist");

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: jwt.sign({ userId: user._id }, "some_secret_key", {
          expiresIn: "600",
        }),
      }).save();
    }
    const link = `${process.env.BASE_URL}/verify-reset-password/${token.token}`;
    await sendEmail(user.email, "password reset", link);
    res.send(link);
  } catch (err) {
    res.send("an error occured");
    console.log(err);
  }
});

router.post(
  "/verify-reset-password/:password-reset-token",
  async (req, res) => {
    try {
      const schema = Joi.object({ password: Joi.string().required() });
      const { error } = schema.validate(req.body);
      if (error) return res.status(400).send(error.message);

      const user = await User.findById(req.headers["verify-reset-password"]);
      if (!user) return res.status(400).send("invalid user");

      const token = await Token.findOne({
        userId: user._id,
        token: req.params["password-reset-token"],
      });
      if (!token) return res.status(400).send("invalid token");

      user.password = req.body.password;
      await user.save();
      await token.delete();
      await sendEmail(user.email, "password reset complete");
      res.send("password reset done.");
    } catch (err) {
      res.send("an error occured");
      console.log(err);
    }
  }
);

module.exports = router;
