const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require("body-parser");

const users= require('./routes/users');
const passwordReset = require('./routes/passwordReset');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require("dotenv").config();

const db = process.env.URI;

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

app.use(express.json());

app.use("/user", users);
app.use("/user", passwordReset);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
