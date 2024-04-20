import React, { Fragment, useEffect, useState } from "react";
import { Banner, LibraryModal, Row } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/additional";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { setLibraryModal } from "../redux/library";
import { setAuth } from "../redux/auth";
import axios from "axios";
import instance from "../lib/axios";

const Music = () => {
  const location = useLocation();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { id } = useParams();


  const { library, user } = useSelector((state) => state);

  const [response, setResponse] = useState({});

  const libraryAction = () => {
    if (user) {
      dispatch(setLibraryModal({ status: true, track: response?.track?.id }));
    } else {
      dispatch(setAuth({ login: true }));
    }
  };

  const getTrackData = async (cancelToken) => {
    let res;
    try {
      // Fetch the selected track
      res = await instance.get(`/music/${id}`, {
        cancelToken: cancelToken?.token || null,
      });
      if (res?.data) {
        // If the selected track is fetched successfully, extract its category
        const category = res.data?.category;
        // Fetch all tracks from the same category
        const tracksResponse = await instance.get(`/music/category/${category}`);
      
        if (tracksResponse?.data) {
          
          // Set the response data to include both the selected track and all tracks from the same category
          setResponse({
            selectedTrack: res.data,
            tracks: tracksResponse.data
          });
          setTimeout(() => {
            dispatch(setLoading(false));
          }, 1000);
        }
      }
    } catch (err) {
      // Handle errors
    }
  };
  
  
  
  const LibFormAction = async (playlistId, checked, search, reloadData) => {
    if (checked) {
      let res;

      try {
        res = await instance.put("/music/add-track-playlist", {
          playlistId,
          trackId: response?.track?.id,
        });
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Cancelled");
        } else if (err?.response?.data?.status === 405) {
          dispatch(setUser(null));
          dispatch(setLibraryModal({ status: false }));
        } else {
          alert("Facing An Error");
        }
      } finally {
        if (res?.data) {
          getTrackData();
          reloadData(search?.value);
        }
      }
    } else {
      let res;

      try {
        res = await instance.put("/music/remove-track-playlist", {
          playlistId,
          trackId: response?.track?.id,
        });
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Cancelled");
        } else if (err?.response?.data?.status === 405) {
          dispatch(setUser(null));
          dispatch(setLibraryModal({ status: false }));
        } else {
          alert("Facing An Error");
        }
      } finally {
        if (res?.data) {
          getTrackData();
          reloadData(search?.value);
        }
      }
    }
  };

  useEffect(() => {
    document.title = `Musicon`;

    const cancelToken = axios.CancelToken.source();

    getTrackData(cancelToken);

    return () => {
      cancelToken?.cancel?.();
    };
  }, [location]);

  // console.log(response)
  return (
    <Fragment>
      <div className="container">
        {response && (
          <Banner
            data={response.selectedTrack} // Pass the selected track data to the Banner component
            libraryAction={libraryAction}
            inLibrary={response?.inPlaylist}
            category="Track"
          />
        )}
  
        {response?.tracks && response.tracks.length > 0 && ( // Check if tracks data exists and is not empty
          <Row
            title="More from this Artist" // Use selected track's artist name for the title
            data={response.tracks[0].songs} // Pass the tracks data to the Row component
          />
        )}
      </div>
      {library?.modal?.status && <LibraryModal formAction={LibFormAction} />}
    </Fragment>
  );
  
};

export default Music;
