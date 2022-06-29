const express = require("express");
require("dotenv").config()
const mongoose = require("mongoose")
const multer = require("multer")
const app = express()

const upload = multer({ dest: "uploads" })

mongoose.connect(process.env.DATABASE_URL)

app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/upload", upload.single("file"), (req, res) =>{
    res.send("Done")
})

app.listen(process.env.PORT)