const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//Connect to MongoDB
const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST || "mongo-service";

const mongoURL = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:27017/mydb?authSource=admin`;

mongoose.connect(mongoURL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

//Create Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});

const User = mongoose.model("User", UserSchema);

//Show form + saved data
app.get("/", async (req, res) => {
  const users = await User.find();

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>User App</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #0f2027, #2c5364);
          display: flex;
          justify-content: center;
          padding: 40px;
        }

        .container {
          background: #f8fbfc;   /* soft off-white with slight blue tone */
          padding: 30px;
          border-radius: 12px;
          width: 400px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.35);
        }

        h2 {
          margin-top: 0;
          color: #1f2937;   /* darker cool gray */
          text-align: center;
        }
        form {
          margin-bottom: 20px;
        }

        input {
          width: 100%;
          padding: 10px;
          margin: 8px 0;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #f1f5f9;   /* very light blue-gray */
        }

        button {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: #2c5364;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }

        button:hover {
          background: #203a43;
        }

        .user {
          padding: 8px;
          background: #e2e8f0;  /* soft gray-blue */
          margin: 6px 0;
          border-radius: 6px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Add User</h2>
        <form method="POST" action="/add">
          <input name="name" placeholder="Name" required/>
          <input name="email" placeholder="Email" required/>
          <button type="submit">Save</button>
        </form>

        <h2>Delete User</h2>
        <form method="POST" action="/delete">
          <input name="email" placeholder="Email" required/>
          <button type="submit">Delete</button>
        </form>

        <h2>Saved Users</h2>
    `;

  users.forEach(user => {
  html += `<div class="user">${user.name} - ${user.email}</div>`;
});

  html += `
    </div>
  </body>
  </html>
  `;

  res.send(html);
});

//Save to DB
app.post("/add", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email
  });

  await user.save();
  res.redirect("/");
});

//Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

//To view all the Users
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users)
});

//To delete a user
app.post("/delete", async (req, res) => {
  await User.deleteOne({ email: req.body.email });
  res.redirect("/");
});