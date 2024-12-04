import SpotifyWebApi from "spotify-web-api-node";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { relevantSpotifyData } from "./interface";

dotenv.config();
const clientID = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

const spotifyApi = new SpotifyWebApi({
  clientId: clientID,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
});

export const authorizationProcess = () => {
  const scopes = [
    "ugc-image-upload",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
    "app-remote-control",
    "user-read-email",
    "user-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-read-private",
    "playlist-modify-private",
    "user-library-modify",
    "user-library-read",
    "user-top-read",
    "user-read-playback-position",
    "user-read-recently-played",
    "user-follow-read",
    "user-follow-modify",
  ];
  const state = "55";
  return spotifyApi.createAuthorizeURL(scopes, state);
};

export const getToken = async (
  req: Request,
  res: Response
): Promise<string | null> => {
  const error = req.query.error;
  const code = req.query.code as string;
  const state = req.query.state;

  if (error) {
    console.error("Error" + error);
    res.send("Error" + error);
    return null;
  }
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body.access_token;
    const refreshToken = data.body.refresh_token;
    const expiresIn = data.body.expires_in;

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    console.log(accessToken, refreshToken);

    // Aktualisiere das Access-Token regelmäßig
    setInterval(async () => {
      const refreshData = await spotifyApi.refreshAccessToken();
      const accessTokenRefreshed = refreshData.body["access_token"];
      spotifyApi.setAccessToken(accessTokenRefreshed);
    }, (expiresIn / 2) * 1000);

    return accessToken;
  } catch (err) {
    console.error("Error during authorization code grant", err);
    res.send("Error during authorization code grant");
    return null; 
  }
};

export const getSongs = async (token: string, limit: string) => {
  const result = await fetch(
    `https://api.spotify.com/v1/me/tracks?offset=0&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await result.json();
  return data;
};

export const extractArtistsAndSongs = (songData: any) => {
  const artistAndTrackNameList: relevantSpotifyData[] = [];

  songData.items.forEach((element: any) => {
    const trackName = element.track.name;
    const artistInfos = element.track.album.artists;
    artistInfos.forEach((artist: any) => {
      const artistName = artist.name;
      const artistAndTrackName: relevantSpotifyData = {
        artist: trackName,
        track: artistName,
      };
      artistAndTrackNameList.push(artistAndTrackName);
    });
  });
  return artistAndTrackNameList;
};
