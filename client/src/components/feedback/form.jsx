import React, { useRef, useEffect } from "react";
import  Input  from "./input";
import instance from "../../lib/axios";
import useAuthState from "../../features/authentication/hooks/useAuthState";
import StarRatings from "react-star-ratings";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setLoading } from "../../redux/additional";
import axios from "axios";
import "./style.scss";

const Form = () => {
  const errorRef = useRef();
    const dispatch = useDispatch();
    const navigate = useNavigate();

  const location = useLocation();
  const [state, setState] = useAuthState();
  const { user } = useSelector((state) => state);
  const errorHandle = (error) => {
    if (error) {
      if (errorRef?.current) {
        errorRef.current.style.display = "block";
        errorRef.current.innerHTML = error;
      } else {
        alert(error);
      }
    } else {
      if (errorRef?.current) {
        errorRef.current.style.display = "none";
      }
    }
    };
    
    useEffect(() => {
        document.title = `Musicon - Feedback`;
    
        let cancelToken = axios.CancelToken.source();
    
        if (user) {
            dispatch(setLoading(false));
        } else {
           
            navigate("/")
        }
    
        return () => {
          cancelToken?.cancel();
        };
      }, [location, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Submit the feedback data to your backend or perform any desired action
        await instance.post("/music/submit", {
        userID: user.userID,
        rating: state?.form?.rating || null,
        message: state?.form?.message || "",
      });
      // Optionally, you can display a success message or perform other actions
      alert("Feedback submitted successfully!");
      // Clear the form after submission
      setState((prevState) => ({
        ...prevState,
        form: {
          rating: "",
          message: "",
        },
      }));
    } catch (error) {
      // Handle errors
      errorHandle("Failed to submit feedback. Please try again later.");
    }
  };

    console.log("here1")
  

    return (
      <div  className="form">
    <form className="form_auth" onSubmit={handleSubmit}>
      <h3>Give us a Feedback!</h3>

      {/* Error message */}
      <p data-for="error" ref={errorRef} />

      {/* Star rating input field */}
      <label>Rating</label><br/>
      <StarRatings
        rating={state?.form?.rating || 0}
        starRatedColor="orange"
        changeRating={(newRating) => {
          setState((prevState) => ({
            ...prevState,
            form: {
              ...prevState.form,
              rating: newRating,
            },
          }));
        }}
        numberOfStars={5}
        starDimension="30px"
        name="rating"
      />
                <br />
                
      {/* Message input field */}
      <label style={{ marginTop: "2rem !important" }}>Message</label>

      <Input
        type={"text"}
        placeholder={"Enter Feedback Message"}
        name={"message"}
        value={state?.form?.message || ""}
        inputHandle={setState}
        required
      />

      {/* Submit button */}
      <button type="submit">Submit</button>

      
    </form>

    </div>
  );
};

export default Form;
