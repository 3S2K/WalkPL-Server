app.delete("/songs/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSong = await Song.findByIdAndDelete(id);
        if (deletedSong) {
            res.json({ message: "Song deleted successfully" });
        } else {
            res.status(404).json({ error: "Song not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to delete song" });
    }
});
