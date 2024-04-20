import React, { useEffect, useState } from "react";
import { Row, FIlterSearch, LoadMore, Carousel } from "../components";
import { setLoading } from "../redux/additional";
import { useDispatch } from "react-redux";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Error from "./error";
import axios from "axios";
import instance from "../lib/axios";

const Search = () => {
  const location = useLocation();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { type } = useParams();


  const [searchParams] = useSearchParams();

  const [response, setResponse] = useState({});

  const onLoad = async () => {
    let res;
    try {
      res = await instance("/music/search", {
        params: {
          type: 'all',
          offset: response?.offset + 10,
          search:
            searchParams.get("q")?.length > 0
              ? searchParams.get("q")
              : undefined,
        },
      });
    } catch (err) {
      if (typeof err?.response?.data?.message === "string") {
        alert(err?.response?.data?.message);
      } else {
        alert("Facing An Error");
      }

      return true;
    } finally {
      if (res?.data) {
        setResponse((state) => ({
          [`${type}s`]: [
            ...state[`${type}s`],
            ...(res?.data?.data?.[`${type}s`] || []),
          ],
          offset: res?.data?.data?.offset,
        }));

        return true;
      }
    }
  };

  useEffect(() => {
    document.title = `Musicon - Search ${searchParams.get("q") || ""}`;

    const cancelToken = axios.CancelToken.source();

    const getSearch = async (type) => {
      let type_ = type;
      if (!type_)
        type_ = 'all'
      let res;
      try {
        res = await instance("/music/search", {
          params: {
            type: type_,
            search:
              searchParams.get("q")?.length > 0
                ? searchParams.get("q")
                : undefined,
          },
          cancelToken: cancelToken.token,
        });
        if (!cancelToken.token.reason) {
          setResponse(res?.data?.data);
          dispatch(setLoading(false));
        }
      } catch (err) {
        // Handle errors
        if (!axios.isCancel(err)) {
          if (err?.response?.data?.message) {
            alert(err.response.data.message);
          } else {
            alert("Facing An Error");
          }
          dispatch(setLoading(false));
        }
      }finally {
        if (res?.data) {
          setResponse(res?.data?.data);
          console.log(res.data.data)
          setTimeout(() => {
            dispatch(setLoading(false));
          }, 1000);
        }
      }
    };

    if (type === "genres") {
      getSearch("genres");
    } else if (type === "artist") {
      getSearch("artist");
    } else if (type === "track") {
      getSearch("track");
    } else if (type === "all") {
      getSearch("all")
    }
    else if (!type) {
      getSearch();
    } else {
      navigate("/404");
    }

    return () => {
      cancelToken.cancel();
    };
  }, [location]);

  return (
    <div className="container">
      <FIlterSearch type={type} q={searchParams.get("q") || ""} />

      {!response?.empty ? (
        <>
          {response[0] && !type && (
  <>
    <Row
      title="Artists"
      data={response[0].data}
      isCarousel={type ? false : true}
      isRound={true}
      type_='artist'
    />

    <Row
      title={"Genres"}
      data={response[2].data}
                isCarousel={type ? false : true}
                type_='genres'
    />

    <Row
      title={"Tracks"}
      data={response[1].data}
                isCarousel={true}
                type_='track'
    />
  </>
)}

{response[0] && type === 'genres' && (
  <Carousel
    title={"Genres"}
    data={response}
              isCarousel={type ? false : true}
              
  />
          )}
          
          {response[0] && type === 'artist' && (
 <Row
 title="Artists"
 data={response}
 isCarousel={type ? false : true}
 isRound={true}
 type_='artist'
/>
)}

          {response[0] && type==="track" && (
            <Row
              title={"Tracks"}
              data={response}
              isCarousel={type ? false : true}
              type_='artist'
            />
          )}

          {type === "artist" || type === "track" || type === "album" ? (
            <>
              {response?.[`${type}s`]?.length > 0 && (
                <LoadMore onHandle={onLoad} />
              )}
            </>
          ) : null}
        </>
      ) : (
        <Error
          customErr={{
            status: 404,
            statusText: "Data not found in our database.",
          }}
        />
      )}
    </div>
  );
};

export default Search;
