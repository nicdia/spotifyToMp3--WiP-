"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const spotify_web_api_node_1 = __importDefault(require("spotify-web-api-node"));
dotenv.config();
const clientID = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URL;
const app = (0, express_1.default)();
const port = 3000;
const spotifyApi = new spotify_web_api_node_1.default({
    clientId: clientID,
    clientSecret: clientSecret,
    redirectUri: redirectUri,
});
app.listen(port, () => {
    console.log(`Connected successfully on port ${port}`);
});
app.get("/login", (req, res) => {
    const scopes = "user-read-private";
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});
app.get("/callback", (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;
    if (error) {
        console.error("Error" + error);
        res.send("Error" + error);
        return;
    }
    spotifyApi.authorizationCodeGrant(code).then((data) => {
        const accessToken = data.body("access_token");
        const refreshToken = data.body["refresh_token"];
        const expiresIn = data.body["expires_in"];
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);
        console.log(accessToken, refreshToken);
        res.send("Success!");
        setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            const data = yield spotifyApi.refreshAccessToken();
            const accessTokenRefreshed = data.body["access_token"];
            spotifyApi.setAccessToken(accessTokenRefreshed);
        }), (expiresIn / 2) * 1000);
    });
});
