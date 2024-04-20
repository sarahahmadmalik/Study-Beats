import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import jwtSecret from './generateJwtSecret.js'
import userRoute from "./routes/user.js";
import musicRoute from "./routes/music.js";

import { ConnectDB } from "./db/connection.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Derive the directory name using import.meta.url
const __filename = new URL(import.meta.url).pathname.slice(1);
console.log(__filename);
const __dirname = path.dirname(__filename);

// Define the path to the data file
const dataFilePath = path.join(__dirname, "data.json");

// Load existing JSON data if available
let jsonData = {};
try {
  const data = fs.readFileSync(dataFilePath, "utf8");
  jsonData = JSON.parse(data);
} catch (err) {
  console.error("Error loading existing data:", err);
}

// Middleware
app.use(express.static("dist"));
app.use(cors({ credentials: true, origin: process.env.SITE_URL }));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/user/", userRoute);
app.use("/api/music/", musicRoute);

// Default API route
app.get("/api", (req, res) => {
  res.send("Musicon API");
});
// API to upload JSON data
app.post("/api/upload-data", (req, res) => {
  const newData = req.body;
  try {
    // Update the logic to handle the new data format
    if (!newData || !newData.data) {
      throw new Error("Invalid data format");
    }

    // Merge new data with existing data
    newData.data.forEach(newCategory => {
      const existingCategoryIndex = jsonData.data.findIndex(category => category.category === newCategory.category);
      if (existingCategoryIndex !== -1) {
        // Category already exists, merge songs
        jsonData.data[existingCategoryIndex].songs.push(...newCategory.songs);
      } else {
        // New category, add it
        jsonData.data.push(newCategory);
      }
    });

    // Write data to file
    fs.writeFileSync(dataFilePath, JSON.stringify(jsonData, null, 2));
    res.status(200).send("Data uploaded successfully!");
  } catch (err) {
    console.error("Error uploading data:", err);
    res.status(500).send("Error uploading data");
  }
});

app.get("/api/latest", (req, res) => {
  try {
    const latest = jsonData.latest;
    res.json(latest);
  } catch (err) {
    console.error("Error retrieving latest tracks:", err);
    res.status(500).send("Error retrieving latest tracks");
  }
});

// API to retrieve albums
app.get("/api/albums", (req, res) => {
  try {
    const albums = jsonData.albums;
    res.json(albums);
  } catch (err) {
    console.error("Error retrieving albums:", err);
    res.status(500).send("Error retrieving albums");
  }
});

// API to retrieve featured tracks
app.get("/api/featured", (req, res) => {
  try {
    const featured = jsonData.featured;
    res.json(featured);
  } catch (err) {
    console.error("Error retrieving featured tracks:", err);
    res.status(500).send("Error retrieving featured tracks");
  }
});

// API to retrieve uploaded data
app.get("/api/data", (req, res) => {
  try {
    res.json(jsonData);
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).send("Error retrieving data");
  }
});

// API to retrieve tracks by category
app.get("/api/music/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const decodedCateg = decodeURIComponent(category);
    // Make a GET request to fetch the uploaded data from localhost:5000/api/data
    const response = await axios.get('http://localhost:5000/api/data');
    const jsonData = response.data;
    // Filter tracks based on the category
    const tracks = jsonData.data.filter(category => category.category === decodedCateg);
    // Send the filtered tracks as response
    res.json(tracks);
  } catch (err) {
    console.error("Error retrieving tracks by category:", err);
    res.status(500).send("Error retrieving tracks by category");
  }
});
// API to retrieve data for a specific album by ID
app.get("/api/music/album/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    // Make a GET request to fetch the uploaded data from localhost:5000/api/data
    const response = await axios.get('http://localhost:5000/api/data');
    const jsonData = response.data;
    // Search for the album with the matching ID in your JSON data
    const album = jsonData.data.find(album => album.category === decodedId);
    
    // If the album is found, send it as a response
    if (album) {
      res.json(album);
    } else {
      // If the album is not found, send an appropriate error message
      res.status(404).json({ message: 'Album not found' });
    }
  } catch (err) {
    console.error("Error retrieving album data:", err);
    res.status(500).send("Error retrieving album data");
  }
});


app.get("/search", async (req, res) => {
  try {
    const { search, type, offset = 0 } = req.query;
    console.log("type =" + type);

    // Fetch data from the server based on search query, type, and offset
    const result = await axios.get("http://localhost:5000/api/data");

    // Check if data is received successfully
    if (result.data) {
      let filteredData;

      // Filter data based on the requested type
      if (type === "genres") {
        // Return all category data
        filteredData = result.data.data;
      } else if (type === "artist") {
        // Return data for each artist with albums and songs
        const artistsData = [];
        const artistsMap = new Map();
      
        result.data.data.forEach((album) => {
          album.songs.forEach((song) => {
            const artist = song.artist.toLowerCase(); // Extract artist from the song
            if (!artistsMap.has(artist)) {
              artistsMap.set(artist, {
                artist: song.artist,
                albums: [],
              });
            }
            const artistData = artistsMap.get(artist);
            // Check if the album already exists for the artist
            const existingAlbum = artistData.albums.find((a) => a.category === album.category);
            if (existingAlbum) {
              existingAlbum.songs.push(song);
            } else {
              artistData.albums.push({
                category: album.category,
                img: album.img,
                songs: [song],
              });
            }
          });
        });
      
        artistsMap.forEach((artistData) => {
          artistsData.push({
            artist: artistData.artist,
            albums: artistData.albums,
          });
        });
      
        filteredData = artistsData;
      }
      else if (type === "track") {
        // Return all tracks from all albums
        filteredData = [];
        result.data.data.forEach((item) => {
          item.songs.forEach((song) => {
            filteredData.push(song);
          });
        });
      }else if (type === "all") {
        // Fetch data for artists with albums and songs
        const artistsData = [];
        const artistsMap = new Map();
        
        result.data.data.forEach((album) => {
          album.songs.forEach((song) => {
            const artist = song.artist.toLowerCase(); // Extract artist from the song
            if (!artistsMap.has(artist)) {
              artistsMap.set(artist, {
                artist: song.artist,
                albums: [],
              });
            }
            const artistData = artistsMap.get(artist);
            // Check if the album already exists for the artist
            const existingAlbum = artistData.albums.find((a) => a.category === album.category);
            if (existingAlbum) {
              existingAlbum.songs.push(song);
            } else {
              artistData.albums.push({
                category: album.category,
                img: album.img,
                songs: [song],
              });
            }
          });
        });
        
        artistsMap.forEach((artistData) => {
          artistsData.push({
            artist: artistData.artist,
            albums: artistData.albums,
          });
        });
        
        filteredData.push({ type: "artists", data: artistsData });

        // Fetch all tracks from all albums
        const allTracks = [];
        result.data.data.forEach((album) => {
          album.songs.forEach((song) => {
            allTracks.push(song);
          });
        });
        filteredData.push({ type: "tracks", data: allTracks });

        // Fetch all genres
        const allGenres = result.data.data;
        filteredData.push({ type: "genres", data: allGenres });
      }  else {
        // Invalid type provided
        return res.status(400).json({
          status: 400,
          message: "Invalid type provided",
        });
      }

      // Send the filtered data to the client
      res.status(200).json({
        status: 200,
        message: "Success",
        data: filteredData,
      });
    } else {
      // Handle if data is not found or empty
      res.status(404).json({
        status: 404,
        message: "Data not found",
      });
    }
  } catch (error) {
    // Handle any errors that occur during the request
    console.error("Error fetching data:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});



// API to retrieve data for a specific track by ID
app.get("/api/music/:id", (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    // Search for the track with the matching ID in your JSON data
   const track = jsonData.data.flatMap(category => category.songs).find(song => song.title.trim() === decodedId.trim());
    
    // If the track is found, send it as a response
    if (track) {
      res.json(track);
    } else {
      // If the track is not found, send an appropriate error message
      res.status(404).json({ message: 'Track not found' });
    }
  } catch (err) {
    console.error("Error retrieving track data:", err);
    res.status(500).send("Error retrieving track data");
  }
});




// Serve React static files
app.get("/*", (req, res) => {
  res.sendFile(path.join(path.resolve(`${__dirname}/dist/index.html`)));
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  ConnectDB((err, res) => {
    if (err) {
      console.error(`MongoDB connection error: ${err}`);
    } else {
      console.log("MongoDB connected successfully");
    }
  });
});


fs.writeFileSync('.env', `PORT=5000\nMONGO_URL=mongodb+srv://sarahahmadmalik55:sarahahmadmalik_123@cluster-1.csjeisa.mongodb.net/\nSITE_URL=http://localhost:5000\nJWT_SECRET=${jwtSecret}\nSPOTIFY_ID=${process.env.SPOTIFY_ID}\nSPOTIFY_SECRET=${process.env.SPOTIFY_SECRET}`);
