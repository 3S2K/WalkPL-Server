const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();

// MongoDB 연결
mongoose.connect("mongodb+srv://dbUser:0000@cluster0.r0u6r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Failed to connect to MongoDB:", err));

// Song 스키마 정의
const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    fileName: { type: String, required: true },
});

const Song = mongoose.model("Song", songSchema);

// JSON 요청 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 경로 설정
app.use("/music", express.static(path.join(__dirname, "public/music")));

// 파일 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/music");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// 파일 업로드 및 데이터 저장
app.post("/upload", upload.single("file"), async (req, res) => {
    const { title, artist } = req.body;

    const newSong = new Song({
        title,
        artist,
        fileName: req.file.originalname,
    });

    try {
        const savedSong = await newSong.save();
        res.status(201).json({
            message: "File uploaded and song data saved successfully",
            song: savedSong,
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to upload song" });
    }
});

// 서버 실행
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
