import { useNavigate } from "react-router-dom";
import { Pause, Play } from "../../assets";
import { useCarousel } from "../../hooks";
import { useDispatch, useSelector } from "react-redux";
import { getTrack, setStatus } from "../../redux/player";
import { setAuth } from "../../redux/auth";
import "./style.scss";

const Carousel = ({ title, data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [ref, settings] = useCarousel({
    play: [],
  });
  const { player, user } = useSelector((state) => state);
console.log(data)
  return (
    <div className="carousel">
      <div className="title">
        <h5>{title}</h5>
      </div>

      <div
        className="inner"
        id="carousel"
        ref={(elem) => {
          if (ref?.current) return (ref.current["slide"] = elem);
        }}
      >
        {data?.map((album, key) => {
          // console.log(album)
          return (
            <div
              className="card"
              key={key}
              ref={(elem) => {
                if (ref?.current) return (ref.current["card"] = elem);
              }}
            >
              <img src={album.img} alt={album.category} />

              {!settings?.isDragging && (
                <div
                  className="hover-details"
                  data-also-for="navigate"
                  onClick={(e) => {
                    if (!ref?.current?.["play"][key]?.contains(e.target)) {
                      navigate(`/album/${album.category}`);
                    }
                  }}
                >
                  { album.songs && album.songs.map((song, songIndex) => (
                    
                    <div key={songIndex}>
                      {player?.data?.title === song.title &&
                      player?.data?.category === song.category &&
                      player?.status ? (
                        <button
                          ref={(elem) => {
                            if (ref?.current)
                              return (ref.current["play"][key] = elem);
                          }}
                          onClick={() => {
                            dispatch(setStatus(false));
                          }}
                        >
                          <Pause
                            width={"16px"}
                            height={"16px"}
                            color={"#333"}
                          />
                        </button>
                      ) : (
                        <button
                          ref={(elem) => {
                            if (ref?.current)
                              return (ref.current["play"][key] = elem);
                          }}
                          onClick={() => {
                            if (user) {
                              if (
                                player?.data?.title === song.title &&
                                player?.data?.category === song.category
                              ) {
                                dispatch(setStatus(true));
                              } else {
                                dispatch(getTrack({ ...song }));
                              }
                            } else {
                              dispatch(setAuth({ login: true }));
                            }
                          }}
                        >
                          <Play
                            width={"16px"}
                            height={"16px"}
                            color={"#333"}
                          />
                        </button>
                      )}
                      <div className="details">
                        <h5>{song.category}</h5>
                        <p>{song.artist}</p>
                      </div>
                    </div>
                  ))}

                  
                </div>
              )}
              
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;
