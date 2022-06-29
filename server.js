const express = require("express");
require("dotenv").config()
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const File = require("./models/File")
const multer = require("multer");
const { urlencoded } = require("express");
const app = express()
app.use(urlencoded({extended: true}))

const upload = multer({ dest: "uploads" })

mongoose.connect(process.env.DATABASE_URL)

app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/upload", upload.single("file"), async(req, res) =>{
    const fileData = {
        Path: req.file.path,
        originalName: req.file.originalname,
    }
    if(req.body.password != null && req.body.password !== "") {
        fileData.password = await bcrypt.hash(req.body.password, 10)
    }

    const file = await File.create(fileData)
    res.render("index", {fileLink: `${req.headers.origin}/file/${file.id}`})
})


function handleDownload(req, res) {
    app.get("/file/:id", async (req, res) => {
        res.send(req.params.id)
        const file = await File.findById(req.params.id)
    
        if(file.password != null) {
            if(req.body.password == null) {
                res.render("password")
                return
            }
            if (await bcrypt.compare(req.body.password, file.password)) {
                res.render ("password", {error: true})
            }
        }
    
        file.downloadCount++
        await file.save()
        console.log(file.downloadCount)
    
        res.download(file.path, file.originalName)
    })
    
}

app.listen(process.env.PORT)