const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Express on Vercel"));
app.get("/server1", (req, res) => res.send("Express on Vercel server1"));
app.get("/server2", (req, res) => res.send("Express on Vercel server2"));

app.listen(3333, () => console.log("Server ready on port 3333."));

module.exports = app;
