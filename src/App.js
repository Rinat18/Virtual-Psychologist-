import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./index.css";
import Voiceicon from "./images.png";

export default function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [emotion, setEmotion] = useState();
  const [question, setQuestion] = useState("Привет?");
  const [answer, setAnswer] = useState("");
  const [answerUser, setAnswerUswer] = useState(answer);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    startVideo();
    videoRef && loadModels();
    // ! ТЕМА
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(prefersDarkScheme.matches ? "dark" : "light");

    const handleChange = (event) => {
      setTheme(event.matches ? "dark" : "light");
    };

    prefersDarkScheme.addEventListener("change", handleChange);

    return () => {
      prefersDarkScheme.removeEventListener("change", handleChange);
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]).then(() => {
      faceMyDetect();
    });
  };
  const faceMyDetect = () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
        videoRef.current
      );
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650,
      });
      const resized = faceapi.resizeResults(detections, {
        width: 940,
        height: 650,
      });
      console.log();
      if (detections[0]) {
        if (detections[0].expressions.happy > 0.8) {
          console.log("вы радостный");
          // setQuestion("Что то хорошое случилось?");
          setEmotion("happy");
        }
        if (detections[0].expressions.angry > 0.8) {
          console.log("вы Злитесь");
          // setQuestion("Вы на что злитесь?");
          setEmotion("angry");
        }
        if (detections[0].expressions.fearful > 0.8) {
          console.log("вам срашно");
          setEmotion("fearful");
        }
        if (detections[0].expressions.sad > 0.8) {
          console.log("вы грустный");
          // setQuestion("Вас кто то обидел?");
          setEmotion("sad");
        }
        if (detections[0].expressions.disgusted > 0.8) {
          console.log("вам противно");
          setEmotion("disgusted");
        }
        if (detections[0].expressions.surprised > 0.8) {
          console.log("вы удивлены");
          setEmotion("surprised");
        }
      }

      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
    }, 1000);
  };

  // ! EMOTIONS
  const emotions = [];
  console.log(emotions);
  useEffect(() => {
    console.log(emotion);
    console.log(emotions);
    emotions.push(emotion);
  }, [emotion]);

  useEffect(() => {
    if (answerUser == "привет") {
      setQuestion("Какой у вас вопрос?");
    } else if (answerUser == "пока") {
      setQuestion("Иди в жопу");
    }
  }, [answerUser]);

  const clean = () => {
    setAnswerUswer(answer);
    setAnswer("");
  };

  // ! ГОЛОСОВОЙ
  const [recordedSpeech, setRecordedSpeech] = useState("");
  const recognition = new window.webkitSpeechRecognition();

  recognition.onresult = (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    setRecordedSpeech(transcript);
  };




  const startRecording = () => {
    recognition.start();
  };


  useEffect(() => {
    if(recordedSpeech == "Привет"){
      setQuestion("Имеются ли у вас не завершенные дела?")
    }else if(recordedSpeech == "да"){
      setQuestion("Вам знакомо состояние неясности в голове?")
    }else if(recordedSpeech == "нет"){
      setQuestion("Тогда у вас рак мозга")
    }
  },[recordedSpeech])

  console.log(recordedSpeech);
  return (
    <div className={`myapp ${theme}`}>
      <h1>Virtual Pschycologist</h1>
      <div className="appvide">
        <video
          className="videoR"
          crossOrigin="anonymous"
          ref={videoRef}
          autoPlay
        ></video>
      </div>
      <canvas ref={canvasRef} className="appcanvas" />
      <h2>{question}</h2>
      <div className="inp">
        <img className="icon" onClick={startRecording} src={Voiceicon} alt="" />
        <div>{recordedSpeech}</div>
      </div>
    </div>
  );
}
