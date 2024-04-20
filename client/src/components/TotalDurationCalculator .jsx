import React, { useEffect, useState } from "react";

const TotalDurationCalculator = ({ songsData }) => {
  const [totalDuration, setTotalDuration] = useState(null);

  useEffect(() => {
    let totalDurationInSeconds = 0;

    const getTime = (milliseconds) => {
      // Convert milliseconds to seconds
      const seconds = Math.floor(milliseconds / 1000);
      // Calculate minutes and remaining seconds
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      // Format the time as mm:ss
      return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    };

    // Iterate over each song data to calculate its duration
    songsData.forEach(song => {
      const audio = new Audio(song.audio);
      audio.addEventListener("loadedmetadata", () => {
        totalDurationInSeconds += audio.duration;
        // Check if all songs' durations are calculated
        if (songsData.indexOf(song) === songsData.length - 1) {
          // Set the total duration using getTime function
          setTotalDuration(getTime(totalDurationInSeconds * 1000));
        }
      });
    });

    // Cleanup event listeners
    return () => {
      songsData.forEach(song => {
        const audio = new Audio(song.audio);
        audio.removeEventListener("loadedmetadata", () => {});
      });
    };
  }, [songsData]);

  return <>{totalDuration}</>;
};

export default TotalDurationCalculator;
