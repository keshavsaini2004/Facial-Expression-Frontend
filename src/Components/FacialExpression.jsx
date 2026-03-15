import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import axios from "axios";

export default function FacialExpression() {
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [expression, setExpression] = useState("Not detected");
  const [songs, setSongs] = useState([]);

  let url = "https://facial-expression-backend-1.onrender.com/api/songs"
  console.log(songs)
  async function fetchSongs() {
    let data = await axios.get(url)
    setSongs(data.data.data)
    console.log(data.data.data)
  }

  useEffect(() => {
    fetchSongs()
  }, [])

  const [filterSongs, setFilterSongs] = useState([])

  useEffect(() => {
    const filtered = songs.filter(
      (el) => el.mood?.toLowerCase() === expression?.toLowerCase()
    );
    setFilterSongs(filtered)
  }, [expression, songs])

  console.log("Detected mood:", expression);
  console.log("Songs from API:", songs);

  // const dummySongs = [
  //   { title: "Sunrise Serenade", artist: "Ava Carter" },
  //   { title: "Midnight Groove", artist: "Ethan Blake" },
  //   { title: "Electric Pulse", artist: "Olivia Hayes" },
  //   { title: "Tranquil Echoes", artist: "Noah Bennett" },
  //   { title: "Rhythmic Heartbeat", artist: "Sophia Reed" },
  //   { title: "Dreamy Horizons", artist: "Liam Foster" },
  //   { title: "Urban Flow", artist: "Isabella Morgan" },
  //   { title: "Soulful Journey", artist: "Caleb Parker" },
  //   { title: "Cosmic Dance", artist: "Grace Ellis" },
  //   { title: "Velvet Nights", artist: "Owen Mitchell" },
  // ];

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
      startVideo();
    };

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoRef.current.srcObject = stream;
      });
    };

    loadModels();
  }, []);

  const handleClick = async () => {
    if (!modelsLoaded) return;

    let detections = [];

    for (let i = 0; i < 5; i++) {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceExpressions();

      if (detection) {
        detections.push(detection.expressions);
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (detections.length > 0) {
      const avg = detections.reduce((acc, exp) => {
        for (let key in exp) {
          acc[key] = (acc[key] || 0) + exp[key];
        }
        return acc;
      }, {});

      const mood = Object.entries(avg).sort((a, b) => b[1] - a[1])[0][0];
      setExpression(mood);
    }
  };
  const audioRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(null);

  const togglePlay = (index) => {
    const currentAudio = audioRefs.current[index];

    if (!currentAudio) return;

    if (playingIndex === index) {
      currentAudio.pause();
      setPlayingIndex(null);
    } else {
      if (playingIndex !== null) {
        audioRefs.current[playingIndex].pause();
      }

      currentAudio.play();
      setPlayingIndex(index);
    }
  };
  return (
    <div className="min-h-screen bg-[#faf9ff] px-10 py-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold mb-8 flex items-center gap-2"
      >
        🎧 Moody Player
      </motion.header>

      {/* Main Section */}
      <div className="flex gap-12 items-center">
        {/* Camera */}
        <motion.video
          ref={videoRef}
          autoPlay
          muted
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-[320px] h-[240px] rounded-xl object-cover shadow-md"
        />

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <h2 className="text-2xl font-bold mb-2">
            Live Mood Detection
          </h2>
          <p className="text-gray-600 mb-4">
            Your current mood is being analyzed in real-time.
            Enjoy music tailored to your feelings.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className="bg-purple-600 text-white px-6 py-2 rounded-full shadow-md"
          >
            Start Listening
          </motion.button>

          <p className="mt-3 text-sm text-gray-700">
            <span className="font-semibold">Detected Mood:</span>{" "}
            {expression}
          </p>
        </motion.div>
      </div>

      {/* Recommended Tracks */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 max-w-3xl"
      >
        <h3 className="text-xl font-semibold mb-4">
          Recommended Tracks
        </h3>

        <div className="space-y-3">
          {filterSongs.map((song, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm"
            >
              <div>
                <p className="font-medium">{song.title}</p>
                <p className="text-sm text-gray-500">
                  {song.artist}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                {/* Audio Element */}
                <audio
                  ref={(el) => (audioRefs.current[index] = el)}
                  src={song.audioFile}
                  preload="auto"
                  onEnded={() => setPlayingIndex(null)}
                />

                {/* Play Button */}
                <motion.button
                  onClick={() => togglePlay(index)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg"
                >
                  {playingIndex === index ? <Pause size={28} /> : <Play size={28} />}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
