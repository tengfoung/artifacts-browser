require("dotenv").config()

const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")

const artifactsRootPath = "./artifacts"

const moveUploadedFile = (file, folder) => {
    const sourcePath = `${file.destination}/${file.filename}`

    var destinationDir = artifactsRootPath
    if (folder) {
        destinationDir += `/${folder}`
    }
    const destinationPath = `${destinationDir}/${file.filename}`

    if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true })
    }

    fs.renameSync(sourcePath, destinationPath)
}

const app = express()

// Set up middleware for JSON, form data, and file uploads
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (optional)
app.use(express.static("public"))

// Configure multer file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        const tempDir = `${artifactsRootPath}/temp`

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true })
        }

        cb(null, tempDir)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage, array: true })

// POST route for file upload
app.post("/upload", upload.single("file"), (req, res) => {
    // File is uploaded to req.file
    if (!req.file) {
        return res.status(400).send("No files were uploaded.")
    }

    moveUploadedFile(req.file, req.body.folder)

    // Do something with success message
    console.log("File uploaded:", req.file)
    
    // Respond with success message
    res.send("File uploaded successfully.")
})

// POST route for file upload
app.post("/upload-multiple", upload.array("files"), (req, res) => {
    // File is uploaded to req.file
    if (!req.files) {
        return res.status(400).send("No files were uploaded.")
    }

    for (const file of req.files) {
        moveUploadedFile(file, req.body.folder)
    }

    // Do something with success message
    console.log("Files uploaded:", req.files)
    
    // Respond with success message
    res.send("Files uploaded successfully.")
})

// Start the server

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})