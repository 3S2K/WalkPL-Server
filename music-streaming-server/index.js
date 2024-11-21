const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// JSON 요청 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
mongoose.connect("mongodb+srv://dbUser:0000@cluster0.r0u6r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0\n", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });

// 정적 파일 경로 설정
app.use("/music", express.static(path.join(__dirname, "public/music")));

// Song 스키마 및 모델 정의
const songSchema = new mongoose.Schema({
    title: String,
    artist: String,
    fileName: String,
});
const Song = mongoose.model("Song", songSchema);

// 모든 노래 조회 API
app.get("/songs", async (req, res) => {
    try {
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch songs" });
    }
});

// 특정 노래 조회 API
app.get("/songs/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const song = await Song.findById(id);
        if (song) {
            res.json({
                id: song.id,
                title: song.title,
                artist: song.artist,
                url: `http://localhost:3000/music/${song.fileName}`,
            });
        } else {
            res.status(404).json({ error: "Song not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch song" });
    }
});

// 노래 추가 API
app.post("/songs", async (req, res) => {
    const { title, artist, fileName } = req.body;

    const newSong = new Song({
        title,
        artist,
        fileName,
    });

    try {
        const savedSong = await newSong.save();
        res.status(201).json(savedSong);
    } catch (err) {
        res.status(500).json({ error: "Failed to save song" });
    }
});

// 서버 실행
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
