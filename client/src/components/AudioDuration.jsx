import React, { useEffect, useState } from "react";

const AudioDuration = ({ audioSrc }) => {
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
    return () => {
      audio.removeEventListener("loadedmetadata", () => {
        setDuration(null);
      });
    };
  }, [audioSrc]);

  const getTime = (milliseconds) => {
    // Convert milliseconds to seconds
    const seconds = Math.floor(milliseconds / 1000);
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    // Format the time as mm:ss
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <span>{duration ? getTime(duration * 1000) : "Calculating..."}</span>
  );
};

export default AudioDuration;
