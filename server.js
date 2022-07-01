const express = require("express");
require("dotenv").config()
const crypto = require("crypto")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const File = require("./models/File")
const multer = require("multer");
const { urlencoded } = require("express");
const app = express()
app.use(express.urlencoded({extended: true}))

const upload = multer({ dest: "uploads" })

mongoose.connect(process.env.DATABASE_URL)

app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));


app.get("/", (req, res) => {
    res.render("index")
})

app.post("/upload", upload.single("file"), async(req, res) =>{
    const fileData = {
        path: req.file.path,
        originalName: req.file.originalname,
    }
    if(req.body.password != null && req.body.password !== "") {
        fileData.password = await bcrypt.hash(req.body.password, 10)
    }

    const file = await File.create(fileData)
    res.render("index", {fileLink: `${req.headers.origin}/file/${file.id}`})
})

// function processFile(evt) {
//     var file = evt.target.files[0],
//     reader = new FileReader();

//     reader.onload = function(e) {
//         var data = e.target.result;

//     }
    
//     reader.readAsArrayBuffer(file);
// }

// var iv = crypto.getRandomValues(new Uint8Array(16));

// crypto.subtle.generateKey([{'name': 'AES-CBC', 'length': 256}], false, ['encrypt', 'decrypt'])
// .then(key => crypto.subtle.encrypt({'name': 'AES-CBC', iv}, key, data))
// .then(encrypted => { /*... */})

// app.get("/file/:id", handleDownload)
// app.post("/file/:id", handleDownload)

// OR
app.route("/file/:id").get(handleDownload).post(handleDownload)

async function handleDownload(req, res) {
    const file = await File.findById(req.params.id)

    if(file.password != null) {
        if(req.body.password == null) {
            res.render("password")
            return
        }
        
        if(!(await bcrypt.compare(req.body.password, file.password))) {
            res.render("password", {error: true})
            return
        }
    }

    file.downloadCount++
    await file.save()
    console.log(file.downloadCount)

    res.download(file.path, file.originalName)
}

app.listen(process.env.PORT)