import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { data } from "./assets/data";
import { Link } from "react-router-dom";
import { useStateProvider } from "../utils/StateProvider";

export default function QuizPage() {
    const [{ token }] = useStateProvider();
    const [playlists, setPlaylists] = useState([]);
    const [genreId, setGenreId] = useState("");

    let [index, setIndex] = useState(0);
    let [question, setQuestion] = useState(data[index]);
    let [lock, setLock] = useState(false);
    let [result, setResult] = useState(false);
    let [quizStarted, setQuizStarted] = useState(false);
    let [scores, setScores] = useState({
        hiphop: 0,
        country: 0,
        rock: 0,
        pop: 0
    });
    let [randomPlaylists, setRandomPlaylists] = useState([]);
    let [randomQuestions, setRandomQuestions] = useState([]);

    let Option1 = useRef(null);
    let Option2 = useRef(null);
    let Option3 = useRef(null);
    let Option4 = useRef(null);

    let option_array = [Option1, Option2, Option3, Option4];

    useEffect(() => {
        const getPlaylists = async () => {
            if (genreId) {
                const result = await fetch(
                    `https://api.spotify.com/v1/browse/categories/${genreId}/playlists`,
                    {
                        headers: {
                            Authorization: "Bearer " + token,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const splaylists = await result.json();
                console.log(splaylists.playlists.items); // Log the data to inspect its structure

                setPlaylists(splaylists.playlists.items);
            }
        };

        getPlaylists();
    }, [token, genreId]);

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    useEffect(() => {
        const shuffledData = shuffleArray(data).slice(0, 10);
        const shuffledQuestions = shuffledData.map(question => ({
            ...question,
            options: shuffleArray(question.options)
        }));
        setRandomQuestions(shuffledQuestions);
        setQuestion(shuffledQuestions[0]);
    }, []);

    const getRandomPlaylists = () => {
        const shuffled = playlists.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2);
    };

    const checkAns = (e, optionIndex) => {
        if (lock === false) {
            const selectedGenre = question.options[optionIndex].genre;
            setScores(prevScores => ({
                ...prevScores,
                [selectedGenre]: prevScores[selectedGenre] + 1
            }));

            const optionElement = option_array[optionIndex].current;
            optionElement.classList.add(selectedGenre);
            setLock(true);
        }
    };

    const next = () => {
        if (lock === true) {
            if (index === randomQuestions.length - 1) {
                const highestScoreGenre = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
                setGenreId(highestScoreGenre);

                setResult(true);
                return 0;
            }
            setIndex(++index);
            setQuestion(randomQuestions[index]);
            setLock(false);
            const classesToRemove = question.options.flatMap(option => option.genre);
            option_array.forEach(option => {
                option.current.classList.remove(...classesToRemove);
            });
        }
    };

    const reset = () => {
        const shuffledData = shuffleArray(data).slice(0, 10);
        const shuffledQuestions = shuffledData.map(question => ({
            ...question,
            options: shuffleArray(question.options)
        }));
        setRandomQuestions(shuffledQuestions);
        setQuestion(shuffledQuestions[0]);
        setIndex(0);
        setScores({
            hiphop: 0,
            country: 0,
            rock: 0,
            pop: 0
        });
        setLock(false);
        setResult(false);
        setRandomPlaylists([]);
        setGenreId(""); // Reset the genreId as well
        setQuizStarted(false); // Reset quizStarted
    };

    useEffect(() => {
        if (result) {
            setRandomPlaylists(getRandomPlaylists());
        }
    }, [playlists, result]);

    const handleTitleClick = (url) => {
        window.location.href = url;
    };

    return (
        <Container>
            {!quizStarted ? (
                <div className="start-container">
                    <button className="start-button" onClick={() => setQuizStarted(true)}>START QUIZ</button>
                    <StyledLink to="/"> {/* StyledLink kullanarak alt çizgiyi kaldırıyoruz */}
                        <div className="backButton">
                            <span>BACK</span>
                        </div>
                    </StyledLink>
                </div>
            ) : (
                <div className="quiz-container">
                    <h1>GENRE QUIZ</h1>
                    <hr />
                    {result ? <></> : <>
                        <h2>{index + 1}. {question.question}</h2>
                        <ul className="options">
                            <li ref={Option1} onClick={(e) => { checkAns(e, 0) }}>{question.options[0].text}</li>
                            <li ref={Option2} onClick={(e) => { checkAns(e, 1) }}>{question.options[1].text}</li>
                            <li ref={Option3} onClick={(e) => { checkAns(e, 2) }}>{question.options[2].text}</li>
                            <li ref={Option4} onClick={(e) => { checkAns(e, 3) }}>{question.options[3].text}</li>
                        </ul>
                        <button className="nextButton" onClick={next}>NEXT</button>
                        <div className="index">{index + 1} of {randomQuestions.length} questions</div>
                    </>}
                    {result ? <>
                        <div className="playlistsContainer">
                            {randomPlaylists.map((playlist) => (
                                <div className="playlistItems" key={playlist.id}>
                                    <div>
                                        <img className="playlistImages" src={playlist.images[0].url} alt="Playlist Cover" />
                                    </div>
                                    <h2
                                        className="playlistName"
                                        onClick={() => handleTitleClick(playlist.external_urls.spotify)}
                                    >
                                        {playlist.name}
                                    </h2>
                                </div>
                              ))}
                          
                        </div>
                        <h2>You have {scores.hiphop} hiphop, {scores.country} country, {scores.rock} rock, and {scores.pop} pop points. 
                            Total number of {randomQuestions.length} questions.</h2>
                        <button onClick={reset}>RESET</button>
                    </> : <></>}
                </div>
            )}
        </Container>
    );
}

const Container = styled.div`
    background: linear-gradient(transparent, rgb(0, 0, 0)) rgb(32, 87, 100);
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    color: lightgray;

    .start-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 5rem;
        height: 100%;
        width: 100%;
        background-color: rgba(15, 143, 9, 0.8);
    }

    button{
        font-weight: bold;
        padding: 1rem 5rem;
        border-radius: 5rem;
        border: none;
        font-size: 1.4rem;
        cursor: pointer;
        color: lightgrey;
        background-color: rgba(6, 120, 19, 0.76);
        box-shadow: 10px 5px 11px 0px rgba(0, 0, 0, 0.3);
        transition: box-shadow 300ms ease-out;
        :hover {
            box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.3);
        }
    }

    .start-button {
        padding: 1rem 5rem;
        border-radius: 5rem;
        background-color: black;
        color: lightgrey;
        border: none;
        font-size: 1.4rem;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover {
          color: white;
        }
    }

    .quiz-container {
        width: 32%;
        display: flex;
        flex-direction: column;
        gap: 20px;
        border-radius: 10px;
        padding: 40px 50px;
        text-align: center;
        background-color: rgba(161, 14, 194, 0.3);
        box-shadow: 10px 5px 11px 0px rgba(0, 0, 0, 0.3);
    }

    .quiz-container hr {
        height: 2px;
        border: none;
        background: #707070;
    }

    .quiz-container h2 {
        font-size: 30px;
        font-weight: 500;
    }

    .options {
        list-style-type: none;
        padding: 0;
        
    }

    .quiz-container hr {
        height: 2px;
        border: none;
    }

    .quiz-container h2 {
        font-size: 30px;
        font-weight: 500;
    }

    .options li {
        display: flex;
        align-items: center;
        height: 45px;
        padding-left: 15px;
        border: 1px solid #686868;
        border-radius: 8px;
        margin-bottom: 15px;
        font-size: 20px;
        cursor: pointer;
        transition: background-color 337ms ease-out;
        :hover {
            background-color: rgba(204, 172, 14, 0.54);
        }
    }

    .rock{
        background-color: rgba(204, 172, 14, 0.54);
    }
    .hiphop{
        background-color: rgba(204, 172, 14, 0.54);
    }
    .country{
        background-color: rgba(204, 172, 14, 0.54);
    }
    .pop{
        background-color: rgba(204, 172, 14, 0.54);
    }

    .playlistsContainer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 20px;
    }

    .playlistItems {
        list-style-type: none;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        max-height: 100%;
        overflow: auto;
        &::-webkit-scrollbar {
            width: 0.7rem;
            &-thumb {
                background-color: rgba(255, 255, 255, 0.6);
            }
        }
    }

    .playlistName {
        margin: 5px;
        padding: 10px 10px;
        background-color: rgba(224, 202, 202, 0.76);
        text-shadow: 5px 2px 5px rgba(0, 0, 0, 1);
        color: lightgrey;
        width: 200px;
        border: 0px solid rgba(100, 100, 100, 1);
        border-radius: 30px;
        cursor: pointer;
        text-align: center;
        transition: text-shadow 337ms ease-out;
        :hover {
            text-shadow: 20px 20px 22px rgba(0, 0, 0, 1);
        }
    }

    .playlistImages {
        margin: auto;
        width: 200px;
        height: flex;
        background: #553f9a;
        color: #fff;
        font-size: 25px;
        font-weight: 500;
        border-radius: 8px;
        margin-left: 7px;
    }
    .playlistsContainer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 20px;
    }
    

    .playlistItems {
        list-style-type: none;
        display: flex;
        flex-direction: column;
        gap: 1rem
    }`;

const StyledLink = styled(Link)`
  text-decoration: none; /* Alt çizgiyi kaldirmak için */
  .backButton {
    font-weight: 500;
    padding: 1rem 5rem;
    border-radius: 5rem;
    background-color: black;
    color: lightgray;
    border: none;
    font-size: 1.4rem;
    cursor: pointer;
    transition: 0.3s ease-in-out;
    box-shadow: 10px 5px 11px 0px rgba(0, 0, 0, 0.3);
    transition: box-shadow 300ms ease-out;
    :hover {
        box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.3);
    }
    &:hover {
      color: white;
    }
  }
`;