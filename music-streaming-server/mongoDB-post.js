app.post("/upload", upload.single("file"), async (req, res) => {
    const { title, artist } = req.body;

    // 입력 데이터 검증
    if (!title || !artist || !req.file) {
        return res.status(400).json({
            error: "Missing required fields. 'title', 'artist', and 'file' are required.",
        });
    }

    const newSong = new Song({
        title,
        artist,
        fileName: req.file.filename, // 업로드된 파일명
    });

    try {
        // MongoDB에 데이터 저장
        const savedSong = await newSong.save();
        res.status(201).json({
            message: "File uploaded and song saved successfully",
            song: savedSong,
        });
    } catch (err) {
        console.error("Error saving song:", err.message);

        // 파일 업로드는 성공했으나 데이터 저장 실패 시 파일 삭제
        const fs = require("fs");
        const filePath = `public/music/${req.file.filename}`;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // 파일 삭제
        }

        res.status(500).json({
            error: "Failed to save song",
            details: err.message,
        });
    }
});
