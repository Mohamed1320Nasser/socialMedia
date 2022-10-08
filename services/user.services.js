let userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const saltRounds = Number(process.env.ROUNDS);
// console.log(saltRounds);
let jwt = require("jsonwebtoken");
const postModel = require("../models/post.model");
const commentModel = require("../models/comment.model");
const { emailVerify } = require("../email/user.email");
const { param } = require("../api/user.api");

userModel = require("../models/user.model");
module.exports.signup = async (req, res) => {
  const { name, email, password, age, phone } = req.body;
  const user = await userModel.findOne({ email });
  if (user) {
    res.json({ message: "email already exists" });
  } else {
    bcrypt.hash(password, saltRounds, function async(err, hash) {
      if (err) {
        res.json({ message: "error in hash password" });
      } else {
        userModel.insertMany({ name, email, password: hash, age, phone });
        let token = jwt.sign({ email }, process.env.VERIFYTOKEN);
        emailVerify({ token, email, message: "message sended" });
        res.json({ message: "succes" });
      }
    });
  }
};
module.exports.emailverification = async (req, res) => {
  const { token } = req.params;
  jwt.verify(token, process.env.VERIFYTOKEN, async (err, decoded) => {
    if (err) {
      res.json({ message: "invalid token" });
    } else {
      let user = await userModel.findOne({ email: decoded.email });
      if (user) {
        await userModel.findOneAndUpdate(
          { email: decoded.email },
          { emailConfirm: true }
        );
        res.json({ message: "verified" });
      } else {
        res.json({ message: "email not found" });
      }
    }
  });
};
module.exports.signin = async (req, res) => {
  const { email, password } = req.body;
  user = await userModel.findOne({ email });
  if (user) {
    let match = await bcrypt.compare(password, user.password);
    if (match) {
      let token = jwt.sign(
        {
          role: "user",
          id: user._id,
          email: user.email,
          password: user.password,
          name: user.name,
        },
        process.env.TOKENKEY
      );
      if (user.emailConfirm == true) {
        res.json({ message: "succes", token });
      } else {
        res.json({ message: "this email not confirm" });
      }
    } else {
      res.json({ message: "the password is incorrect" });
    }
  } else {
    res.json({ message: "email incorrect" });
  }
};

module.exports.changePass = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // console.log(req.user._id);
  const password = newPassword;
  let match = await bcrypt.compare(oldPassword, req.user.password);
  if (match) {
    let hash = await bcrypt.hash(password, saltRounds);
    // console.log(hash);
    const user = await userModel.updateOne(
      { _id: req.user._id },
      { password: hash }
    );
    res.json({ message: "succes", user });
  } else {
    res.json({ message: "old password incorrect" });
  }
};
module.exports.update = async (req, res) => {
  const { name, email, phone, age } = req.body;
  const id = req.user._id;
  let user = await userModel.findOne({ email });
  if (user) {
    res.json({ message: "email alreada exists" });
  } else {
    let userUpdate = await userModel.updateMany(
      { _id: id },
      { name, email, phone, age }
    );
    res.json({ message: "succes", user: req.user });
  }
};
module.exports.deleteUser = async (req, res) => {
  const id = req.user._id;
  const user = await userModel.deleteOne({ _id: id });
  await postModel.deleteOne({ createdBy: id });
  await commentModel.deleteOne({ createdBy: id });
  res.json({ message: "succes" });
};
