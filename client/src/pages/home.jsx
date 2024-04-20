import React, { useEffect, useState } from "react";
import { Carousel, LiteRow, Row } from "../components";
import { useDispatch } from "react-redux";
import { setLoading } from "../redux/additional";
import { useLocation } from "react-router-dom";
import instance from "../lib/axios";

const Home = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [musicData, setMusicData] = useState({});
 
  useEffect(() => {
    document.title = `Musicon`;
    const fetchMusicData = async () => {
      try {
        const res = await instance.get("/music/home");
        if (res.data && res.data.status === 200) {
          setMusicData(res.data.data);
         
        } else {
          throw new Error("Failed to fetch music data");
        }
      } catch (err) {
        console.error("Error fetching music data:", err.message);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchMusicData();
  }, [dispatch, location]);

  // console.log(musicData)
  return (
    <div className="container">
      {Object.entries(musicData).map(([category, categoryData]) => {
        // console.log(category)
        // console.log(categoryData);
        return (
          <React.Fragment key={category}>
            {category === "featured" ? (
              <Row title="Featured" data={categoryData} isCarousel={true} type_='music' />
            ) : category === "recentActivity" ? (
              <Row
                title="Based On Activity"
                data={categoryData} isCarousel={true} type_='music'
              />
            ) : category === "latest" ? (
              <Row title="Latest Tracks" data={categoryData} isCarousel={true} type_='music' />
            ) : category === "albums" ? (<Carousel title="Genres" data={musicData.data} />)
                    : (<></>)
            
          }
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Home;
