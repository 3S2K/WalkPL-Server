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
