import { useState } from "react";

export function Carousel({ images, currentIndex }) {
    const [index, setIndex] = useState(currentIndex);

    const prevSlide = () => setIndex(index > 0 ? index - 1 : images.length - 1);
    const nextSlide = () => setIndex(index < images.length - 1 ? index + 1 : 0);

    return (
        <div className="relative w-full max-w-md">
            <img src={images[index]} alt="Screenshot" className="w-full rounded-lg" />
            <button className="absolute left-2 top-1/2 bg-gray-700 text-white p-2 rounded-full" onClick={prevSlide}>◀</button>
            <button className="absolute left-2 top-1/2 bg-gray-700 text-white p-2 rounded-full" onClick={nextSlide}>▶</button>
        </div>
    );
}