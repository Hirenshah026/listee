import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    img: "/banners/banner1.jpg",
    title: "First Call @ ₹1/min",
  },
  {
    id: 2,
    img: "/banners/banner2.jpg",
    title: "Love • Career • Marriage",
  },
  {
    id: 3,
    img: "/banners/ad3.jpg",
    title: "Love • Career • Marriage",
  },
];

const HomeSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-40 overflow-hidden rounded-xl">
      <img
        src={slides[index].img}
        alt="banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {slides[index].title}
      </div>
    </div>
  );
};

export default HomeSlider;
