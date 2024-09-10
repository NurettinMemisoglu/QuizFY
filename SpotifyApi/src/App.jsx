import React, { useEffect } from "react";
import Login from "./components/Login";
import Spotify from "./components/Spotify";
import QuizPage from "./components/QuizPage";
import { reducerCases } from "./utils/Constants";
import { useStateProvider } from "./utils/StateProvider";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  const [{ token }, dispatch] = useStateProvider();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = hash.substring(1).split("&")[0].split("=")[1];
      if (token) {
        dispatch({ type: reducerCases.SET_TOKEN, token });
      }
    }
    document.title = "Spotify";
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      
        <Routes>
          <Route path="" element={ token ? <Spotify /> : <Login />} />
          <Route path="/quiz" element={ token ? <QuizPage /> : <Login />} />
        </Routes>
      
    </BrowserRouter>
  );
}
