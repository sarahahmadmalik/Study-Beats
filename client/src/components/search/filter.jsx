import React from "react";
import "./style.scss";
import { useNavigate } from "react-router-dom";

const FIlterSearch = ({ type, q }) => {
  const navigate = useNavigate();

  return (
    <div className="search-filter">
      <button
        className={!type ? "active" : ""}
        onClick={() => {
          navigate(`/search/?q=${q}`);
        }}
      >
        All
      </button>
      <button
        className={type === "genres" ? "active" : ""}
        onClick={() => {
          navigate(`/search/genres?q=${q}`);
        }}
      >
        Genres
      </button>
      <button
        className={type === "artist" ? "active" : ""}
        onClick={() => {
          navigate(`/search/artist?q=${q}`);
        }}
      >
        Artist
      </button>
      <button
        className={type === "track" ? "active" : ""}
        onClick={() => {
          navigate(`/search/track?q=${q}`);
        }}
      >
        Tracks
      </button>
    </div>
  );
};

export default FIlterSearch;
