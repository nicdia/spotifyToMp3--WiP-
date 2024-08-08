import express from "express";
import * as spotify from "./spotify";

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Connected successfully on port ${port}`);
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.redirect(spotify.authorizationProcess());
});

app.get("/callback", async (req, res) => {
  try {
    const token = await spotify.getToken(req, res);
    if (typeof token === "string") {
      const songs = await spotify.getSongs(token, "20");
      const artistAndTrackNameList = spotify.extractArtistsAndSongs(songs);
      res.send(artistAndTrackNameList);
    } else {
      res.send("Failed to obtain access token.");
    }
  } catch (err) {
    console.error("Error" + err);
  }
});
