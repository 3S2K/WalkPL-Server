const axios = require("axios");

const uploadSong = async () => {
    try {
        const response = await axios.post("http://localhost:3000/songs", {
            title: "My Song",
            artist: "My Artist",
            fileName: "mysong.mp3",
        });
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error.response.data);
    }
};

uploadSong();
