import React from "react";
import { useNavigate } from "react-router-dom";
import { Dots, MusicIcon, Pause, Play, Plus } from "../../assets";
import { useCarousel } from "../../hooks";
import { useDispatch, useSelector } from "react-redux";
import { setLibraryModal } from "../../redux/library";
import { getTrack, setStatus } from "../../redux/player";
import { setAuth } from "../../redux/auth";
import "./style.scss";

const Row = ({ title, data, isCarousel, isRound, isLibrary, type_ }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { player, user } = useSelector((state) => state);
  const [ref, settings] = useCarousel({
    play: [],
    menu: [],
  });
  console.log("here", data)



  return (
    <div data-for="Row">
      <div className="title">
        <h5>{title}</h5>
      </div>

      <div
        className="grid"
        id={isCarousel ? "carousel" : ""}
        ref={(elem) => {
          if (isCarousel && ref?.current) return (ref.current["slide"] = elem);
        }}
      >
        {isLibrary && (
          <div
            className="card"
            onClick={() => {
              dispatch(setLibraryModal({ status: true }));
            }}
          >
            <div className="thumbnail">
              <Plus />
            </div>

            <div className="details">
              <h5>New playlist</h5>
              <p>Create new playlist by click.</p>
            </div>

            <div className="on_hover" />
          </div>
        )}

        {data?.map((item, key) => {
         
          const { title, category, img, audio, artist, name, type, short, id, playlistId } = item;
console.log(artist)
          return (
            <div
              className="card"
              key={key}
              ref={(elem) => {
                if (isCarousel && ref?.current)
                  return (ref.current["card"] = elem);
              }}
            >
              <div className="thumbnail">
                {img ? (
                  <img
                    className={isRound ? "rounded" : ""}
                    src={img}
                    alt={title}
                  />
                ) : (
                  <MusicIcon />
                )}
              </div>

              <div className="details">
<h5>
  {
    (type_?.toLowerCase() === 'music' ? title :
    type_?.toLowerCase() === 'artist' ? artist : name)
  }
</h5>




<p>{type === 'playlist' ? short : category}</p>

              </div>

              {!settings.isDragging && (
                <div
                  className="on_hover"
                  data-also-for="navigate"
                  onClick={(e) => {
                    if (
                      !ref?.current?.["menu"][key]?.contains(e.target) &&
                      !ref?.current?.["play"][key]?.contains(e.target)
                    ) {
                      if(type_?.toLowerCase() === 'artist')
                        navigate(`/artist/${artist}`);
                      else if(type_?.toLowerCase() === 'music') 
                        navigate(`/music/${title}`);
                      else if (type_?.toLowerCase() === 'playlist')
                        navigate(`/playlist/${id}`)
                    }

                   
                   
                    
                  }}
                >
                  {isLibrary && (
                    <button
                      data-for="libray_options"
                      onClick={() => {
                        dispatch(
                          setLibraryModal({
                            status: true,
                            id: key, // Assuming key can be used as playlistId
                          })
                        );
                      }}
                      ref={(elm) => {
                        if (ref?.current) {
                          ref.current["menu"][key] = elm;
                        }
                      }}
                    >
                      <Dots width={"16px"} height={"16px"} color={"#FFF"} />
                    </button>
                  )}
                  {player?.data?.type === "track" &&
                  player?.data?.id === key &&
                  player?.status ? (
                    <button
                      data-for="play"
                      ref={(elm) => {
                        if (ref?.current) {
                          ref.current["play"][key] = elm;
                        }
                      }}
                      onClick={() => {
                        dispatch(setStatus(false));
                      }}
                    >
                      <Pause width={"16px"} height={"16px"} color={"#333"} />
                    </button>
                  ) : (
                    <button
                      data-for="play"
                      ref={(elm) => {
                        if (ref?.current) {
                          ref.current["play"][key] = elm;
                        }
                      }}
                      onClick={() => {
                        if (user) {
                          if (
                            player?.data?.type === "track" &&
                            player?.data?.id === key
                          ) {
                            dispatch(setStatus(true));
                          } else {
                            dispatch(
                              getTrack({ type: "track", id: key }) // Assuming key can be used as track ID
                            );
                          }
                        } else {
                          dispatch(setAuth({ login: true }));
                        }
                      }}
                    >
                      <Play width={"16px"} height={"16px"} color={"#333"} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Row;
