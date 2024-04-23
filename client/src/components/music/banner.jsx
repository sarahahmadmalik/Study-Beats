import React, { useCallback } from "react";
import { Play, Heart, Share, MusicIcon, Pause } from "../../assets";
import { getTrack, setStatus } from "../../redux/player";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../../redux/auth";
import "./style.scss";
import AudioDuration from "../AudioDuration";
import TotalDurationCalculator from "../TotalDurationCalculator ";
const Banner = ({ data, libraryAction, inLibrary, category }) => {
  const dispatch = useDispatch();
  const { player, user } = useSelector((state) => state);

  console.log(data)
// console.log(data?.artist)
  //   console.log(data?.type === "playlist")


  return (
    <div className="banner">
      <div className="details">
        <div className="thumbnail">
          {data?.img ? (
            <img src={data?.img} alt={data?.title} />
          ) : (
            <MusicIcon />
          )}
        </div>

        <div className="content">
          <h5>{data?.type ? data?.type : category}</h5>
          <h1>
  {data?.type 
    ? data?.name 
    : (data?.category && data?.title 
        ? data?.title 
        : (category.toLowerCase() === "artist" 
            ? data?.name 
            : data?.category
          )
      )
  }
</h1>

         <p>{data?.type === "playlist"
            ? data?.short
            : ( category.toLowerCase() === "artist" ? "" : "Unknown")
          }</p> 

          <ul>
          {data?.type !== "artist" && (
  <>
    {data?.type && (
      <li className="avatar">
        {data?.album?.images?.[0]?.url ? (
          <img
            src={data?.album?.images?.[0]?.url}
            alt={data?.artists?.[0]?.uri}
          />
        ) : (
          <>
            {data?.images?.[0]?.url ? (
              <img
                src={data?.images?.[0]?.url}
                alt={data?.artists?.[0]?.uri}
              />
            ) : (
              <MusicIcon />
            )}
          </>
        )}
        <span>
          {data?.artists
            ? data?.artists?.[0]?.name
            : data?.type === "playlist" && "Own"}
        </span>
      </li>
    )}
  </>
)}




            {data?.release_date && (
              <li>
                <span>{data?.release_date}</span>
              </li>
            )}
            {data && (
              <li>
              {category?.toLowerCase() === "track" && <AudioDuration audioSrc={data?.audio} />}
                {category?.toLowerCase() === "album" && <TotalDurationCalculator songsData={ data?.songs} />}
            </li>
            
            )}
          </ul>
        </div>
      </div>

      <div className="actions">
        {
        player?.data?.title === data?.title &&
        player?.status ? (
          <button
            className="play"
            onClick={() => {
              dispatch(setStatus(false));
            }}
          >
            <Pause width={"16px"} height={"16px"} color={"#fff"} />
            Pause
          </button>
        ) : (
          <button
            className="play"
            onClick={() => {
              if (user) {
                if (
                  player?.data?.type === "audio" &&
                  player?.data?.title === data?.title
                ) {
                  dispatch(setStatus(true));
                } else {
                  dispatch(getTrack({ type: category.toLowerCase() === "track" ? "track" : "album", id: category.toLowerCase() === "track" ? data?.title : data?.category}));
                }
              } else {
                dispatch(setAuth({ login: true }));
              }
            }}
          >
            <Play width={"16px"} height={"16px"} color={"#fff"} />
            Play
          </button>
        )}

        <button
          className={`extra ${inLibrary ? "active" : ""}`}
          onClick={() => libraryAction?.()}
        >
          <Heart width={"20px"} height={"20px"} />
        </button>
        <button
          className="extra"
          onClick={() => {
            window.navigator.clipboard.writeText(window.location.href);
            alert(`Link Copied ${window.location.href}`);
          }}
        >
          <Share width={"20px"} height={"20px"} />
        </button>
      </div>
    </div>
  );
};

export default Banner;
