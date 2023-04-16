var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var dotenv = require("dotenv");
var mongoose = require("mongoose");
var port = process.env.PORT || 5000;

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
dotenv.config();
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongo DB disconnected");
});

mongoose.connection.on("connected", () => {
  console.log("mongo DB connected");
});

var Message = mongoose.model("Message", {
  name: String,
  message: String,
});

//var messages = [
//{ name: "John", message: "hello" },
//{ name: "Jane", message: "hello" },
//];
app.get("/messages", async (req, res) => {
  try {
    messages = await Message.find();
    res.send(messages);
  } catch (err) {
    res.sendStatus(500);
  }
});

app.post("/messages", (req, res) => {
  var message = new Message(req.body);
  try {
    message.save();
  } catch (err) {
    res.sendStatus(500);
  }
  //messages.push(req.body);
  io.emit("message", req.body);
  res.sendStatus(200);
});
io.on("connection", (socket) => {
  console.log("User Connected");
});

var server = http.listen(port, () => {
  connect();
  //console.log(" Server is listening on port", server.address().port);
  console.log(" Server is listening on port %d", port);
});
