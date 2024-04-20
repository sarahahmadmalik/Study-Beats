import { Router } from "express";
import user from "../helper/user.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import data from '../data.json' assert { type: "json" };
import music from "../helper/music.js";
import { ObjectId } from "mongodb";
const router = Router();

const CheckLogged = (req, res, next) => {
  const { token = null } = req.cookies;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
    if (decode?._id?.length === 24) {
      try {
        let userData = await user.get_user(decode?._id);
      
        if (userData) {
          req.body.userId = userData._id?.toString();
          req.query.userId = userData._id?.toString();
          console.log(req.body.userId)
          console.log( req.query.userId)
          next();
        }
      } catch (err) {
        console.log(err);
        res.clearCookie("token");
        next();
      }
    } else if (err) {
      console.log(`Error : ${err?.name}`);
      res.clearCookie("token");
      next();
    } else {
      res.clearCookie("token");
      next();
    }
  });
};

// Define the function to get albums
const getAlbums = async () => {
  try {
    // Fetch albums data from your server
    const albumsResponse = await axios.get("http://localhost:5000/api/albums");
    return albumsResponse.data;
  } catch (error) {
    console.error("Error fetching albums:", error);
    return null;
  }
};

// Define the function to get featured tracks
const getFeatured = async () => {
  try {
    // Fetch featured tracks data from your server
    const featuredResponse = await axios.get("http://localhost:5000/api/featured");
    return featuredResponse.data;
  } catch (error) {
    console.error("Error fetching featured tracks:", error);
    return null;
  }
};

// Define the function to get all data
const getAllData = async () => {
  try {
    // Fetch recent activity data from your server
    const recentActivityResponse = await axios.get("http://localhost:5000/api/data");
  
    return recentActivityResponse.data.data;
    
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return null;
  }
};

// Define the function to get latest tracks
const getLatest = async () => {
  try {
    // Fetch recent activity data from your server
    const recentActivityResponse = await axios.get("http://localhost:5000/api/latest");

    return recentActivityResponse.data;
    
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return null;
  }
};
// Define the route to fetch data for the home page
router.get("/home", async (req, res) => {
  try {
    const { token } = req.cookies;

    const getData = async (userId) => {
      try {
        if (!userId) {
          // If user ID is not present, fetch recent activity, albums, and featured without user-specific data
          const latest = await getLatest();
          const data = await getAllData();
          const albums = await getAlbums();
          const featured = await getFeatured();
          
          
          return { latest, albums, featured, data };
        }

        // Fetch recent activity for the user
        const recentActivityResponse = await user.get_user(userId);
        const recentActivity = recentActivityResponse.data;

        // Fetch albums data from your server
        const albums = await getAlbums();
        
        // Fetch featured tracks data from your server
        const featured = await getFeatured();
        const latest = await getLatest();
        const data = await getAllData();
        
        return { recentActivity, albums, featured, data , latest};
      } catch (error) {
        console.error("Error fetching data:", error);
        return null;
      }
    };

    jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
      if (err || !decode?._id) {
        // If there's an error or no user ID, fetch recent activity, albums, and featured without user-specific data
        const { latest, albums, featured, data } = await getData();
        return res.status(200).json({
          status: 200,
          message: "Success",
          data: { latest, albums, featured, data },
        });
      }

      try {
        // If user ID is present, fetch recent activity, albums, and featured for the user
        const { recentActivity, albums, featured, data } = await getData(
          decode._id.toString()
        );

        return res.status(200).json({
          status: 200,
          message: "Success",
          data: { recentActivity, albums, featured, data },
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        const { recentActivity, albums, featured } = await getData();
        return res.status(200).json({
          status: 200,
          message: "Success",
          data: { recentActivity, albums, featured, data },
        });
      }
    });
  } catch (err) {
    console.error("Error in /home route:", err);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
});
router.get("/category/:category", async (req, res) => {
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
router.get("/album/:id", async (req, res) => {
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

router.get("/search", async (req, res) => {
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
        filteredData = [];
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



router.get('/id', async (req, res) => {
  // Extract the track title from the request parameters
  const id = req.params.id;

  try {
    // Decode the track title to handle encoded characters
    const decodedId = decodeURIComponent(id);

    // Make an HTTP GET request to fetch the data from your Node.js server
    const response = await axios.get('http://localhost:5000/api/data');
    
    // Search for the track with the matching title in the fetched data
    const track = response.data.flatMap(category => category.songs).find(song => song.title.trim() === decodedId.trim());

    
    // If the track is found, send it as a response
    if (track) {
      res.json(track);
    } else {
      // If the track is not found, send an appropriate error message
      res.status(404).json({ message: 'Track not found' });
    }
  } catch (err) {
    // If there's an error during the HTTP request or search process, handle it and send an error response
    console.error('Error retrieving track:', err);
    res.status(500).json({ message: 'Error retrieving track' });
  }
});





router.get("/track", async (req, res) => {
  const { token } = req.cookies;
  const { id } = req.query;

  try {
    let result = await axios.get(`http://localhost:5000/api/data/track?id=${id}`);

    if (result.data) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Data not found",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
});

router.get("/album", async (req, res) => {
  const { id } = req.query;

  try {
    let result = await axios.get(`http://localhost:5000/api/data/album?id=${id}`);

    if (result.data) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Data not found",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
});

router.get("/album-tracks-more", async (req, res) => {
  const { id, offset = 0 } = req.query;

  try {
    let tracks = await axios.get(`http://localhost:5000/api/data/album-tracks?id=${id}&offset=${offset}`);

    if (tracks?.data) {
      let response = {
        cover: tracks.data.cover,
        songs: tracks.data.songs.slice(offset, offset + 10),
        offset: parseInt(offset),
      };
      
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: response,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
});

router.get("/artist", async (req, res) => {
  const { id } = req.query;

  try {
    let artist = await axios.get(`http://localhost:5000/api/data/artist?id=${id}`);
    let tracks = await axios.get(`http://localhost:5000/api/data/top-tracks?id=${id}`);
    let related = await axios.get(`http://localhost:5000/api/data/artist-albums?id=${id}`);

    let response = {
      artist: artist?.data,
      related: related?.data?.items,
      songs: tracks?.data?.slice(0, 10),
      offset: 0,
      total: tracks?.data?.length,
    };

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
});

router.post("/clone-collection-playlist", CheckLogged, async (req, res) => {
  const { userId, ...details } = req.body;

  details.playlistId = `${details?.id}_${details?.type}`;

  let response;

  try {
    response = await music.createPlaylist(userId, details);
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err,
    });
  } finally {
    if (response) {
      res.status(200).json({
        status: 200,
        message: "Success",
        data: response,
      });
    }
  }
});

router.get("/all-playlists", CheckLogged, async (req, res) => {
  const { userId, offset = 0, search = "" } = req.query;
  
  let response;
  console.log("user", userId)
  try {
    response = await music.getAllPlaylist(userId, parseInt(offset), 10, search);
    console.log("long", response)
   
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err,
    });
  } finally {
    if (response) {
      res.status(200).json({
        status: 200,
        message: "Success",
        data: {
          list: response?.data,
          total: response?.total,
          offset: parseInt(offset) || 0,
        },
      });
    }
  }
});

router.get("/search-user-playlists", CheckLogged, async (req, res) => {
  const { userId, search = "" } = req.query;

  let response;

  try {
    response = await music.getUserPlaylists(userId, search);
    
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err,
    });
  } finally {
    if (response) {
      
      res.status(200).json({
        status: 200,
        message: "Success",
        data: response?.data,
      });
    }
  }
});

router.post("/create-playlist", CheckLogged, async (req, res) => {
  let { userId, ...details } = req.body;

  let id = new ObjectId().toHexString();

  details = {
    ...details,
    ...{
      id,
      type: "playlist",
      short: `${new Date()}`,
      playlistId: `${id}_playlist`,
    },
  };

  let response;

  try {
    response = await music.createPlaylist(userId, details);
  
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err,
    });
  } finally {
    if (response) {
      console.log(response)
      res.status(200).json({
        status: 200,
        message: "Success",
        data: response,
      });
    }
  }
});


router.get("/get-playlist", CheckLogged, (req, res) => {
  res.status(200).json({
    status: 200,
    message: "Success",
    data: data,
  });
});

router.get("/get-audio-tracks", CheckLogged, async (req, res) => {
  const { userId, type, id, offset = 0 } = req.query;

  try {
    let response;

    if (type === "album") {
      // Make request to your Node.js server to fetch album data
      const { data } = await axios.get(`http://localhost:5000/api/data`);

      if (data) {
        // Find the album corresponding to the specified ID
        const album = data.data.find(item => item.category === id);

        if (album) {
          // Get the first song of the album
          const firstSong = album.songs[0];

          if (firstSong) {
            // Update recent activity and history here if needed
            response = {
              total: album.songs.length,
              offset: 0, // Offset is always 0 for albums since we're fetching the first song
              type,
              id,
              track: firstSong,
            };
          } else {
            return res.status(404).json({
              status: 404,
              message: "No songs found in the album",
            });
          }
        } else {
          return res.status(404).json({
            status: 404,
            message: "Album not found",
          });
        }
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong while fetching data",
        });
      }
    } else if (type === "track") {
      // Make request to your Node.js server to fetch the track based on the provided ID (song title)
      const { data } = await axios.get(`http://localhost:5000/api/data`);

      if (data) {
        // Find the track corresponding to the provided ID
        let track;
        data.data.forEach(category => {
          const foundTrack = category.songs.find(song => song.title === id);
          if (foundTrack) {
            track = foundTrack;
          }
        });

        if (track) {
          // Update recent activity and history here if needed
          response = {
            total: 1,
            offset: 0, // Offset is always 0 for single tracks
            type,
            id,
            track,
          };
        } else {
          return res.status(404).json({
            status: 404,
            message: "Track not found",
          });
        }
      } else {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong while fetching data",
        });
      }
    } else if (type === "playlist") {
      // Handle playlist logic here
    } else {
      return res.status(400).json({
        status: 400,
        message: "Invalid type",
      });
    }

    if (response) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: response,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
});

router.get("/user-playlist", CheckLogged, async (req, res) => {
  const { userId, id } = req.query;

  let response;

  try {
    response = await music.getUserPlaylist(userId, `${id}_playlist`);
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err,
    });
  } finally {
    if (response) {
      res.status(200).json({
        status: 200,
        message: "Success",
        data: response,
      });
    }
  }
});


router.get("/get-songs", CheckLogged, (req, res) => {
  const { category } = req.query;
  const playlist = data[category];

  if (!playlist) {
    return res.status(404).json({
      status: 404,
      message: "Playlist not found",
    });
  }

  res.status(200).json({
    status: 200,
    message: "Success",
    data: playlist.songs,
  });
});

router.get("/get-song", CheckLogged, (req, res) => {
  const { category, title } = req.query;
  const playlist = data[category];

  if (!playlist) {
    return res.status(404).json({
      status: 404,
      message: "Playlist not found",
    });
  }

  const song = playlist.songs.find((s) => s.title === title);

  if (!song) {
    return res.status(404).json({
      status: 404,
      message: "Song not found",
    });
  }

  res.status(200).json({
    status: 200,
    message: "Success",
    data: song,
  });
});


export default router;
