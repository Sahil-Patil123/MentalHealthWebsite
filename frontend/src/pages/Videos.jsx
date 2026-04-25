import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const videos = [
  {
    id: 1,
    title: "Cartoon of mental health stories",
    src: "https://www.youtube.com/embed/DxIDKZHW3-E",
  },
  {
    id: 2,
    title: "Warning signs of mental health problems in teens and young adults",
    src: "https://www.youtube.com/embed/zt4sOjWwV3M",
  },
  {
    id: 3,
    title: "Asking for help on your mental health",
    src: "https://www.youtube.com/embed/9FbBwehUp5Q",
  },
  {
    id: 4,
    title: "5 Signs Your Mental Health is Getting Worse",
    src: "https://www.youtube.com/embed/rkZl2gsLUp4",
  },
  {
    id: 5,
    title: "5 Signs Your Mental Health is Improving",
    src: "https://www.youtube.com/embed/ZidGozDhOjg",
  },
];

const Videos = () => {
  const [currentVideo, setCurrentVideo] = useState(0);

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-8">
      <h2 className="text-center text-white text-5xl font-bold bg-slate-800 py-4">
        Mental Health Resources: Videos
      </h2>
      <div className="container mx-auto px-4">
        <h3 className="mt-8 mb-5 bg-emerald-300 text-3xl font-semibold py-2 px-4 rounded-md inline-block">
          {videos[currentVideo].title}
        </h3>
        <div className="flex justify-center my-8">
          <iframe
            width="720"
            height="450"
            src={videos[currentVideo].src}
            title={videos[currentVideo].title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg shadow-lg"
          />
        </div>
        <div className="flex justify-between max-w-md mx-auto mt-5 mb-10">
          <button
            onClick={prevVideo}
            className="flex items-center space-x-2 text-slate-800 font-semibold hover:text-slate-600 transition-colors"
          >
            <ChevronLeft />
            <span>Previous</span>
          </button>
          <button
            onClick={nextVideo}
            className="flex items-center space-x-2 text-slate-800 font-semibold hover:text-slate-600 transition-colors"
          >
            <span>Next</span>
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Videos;
