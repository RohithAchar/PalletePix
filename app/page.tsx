"use client";

import React, { useState, useRef, useEffect } from "react";
// @ts-expect-error older version of colorthief
import ColorThief from "colorthief";
// @ts-expect-error older version of tinycolor
import tinycolor from "tinycolor2";
import toast, { Toaster } from "react-hot-toast";

import { getContrastingTextColor, rgbToHex } from "@/lib/utility";

const Home = () => {
  const [image, setImage] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [label, setLabel] = useState<string>("Please upload image...");
  const [shades, setShades] = useState<string[]>([]);
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    const DEFAULT_COLORS = [
      "#424874",
      "#FF9494",
      "#8D7B68",
      "#2C3639",
      "#40514E",
      "#311D3F",
    ];
    const storedColors = JSON.parse(
      localStorage.getItem("dominantColors") || "[]"
    );

    if (!storedColors.length) {
      localStorage.setItem("dominantColors", JSON.stringify(DEFAULT_COLORS));
      setDominantColors(DEFAULT_COLORS);
      generateShades(DEFAULT_COLORS[selectedIndex]);
    } else {
      setDominantColors(storedColors);
      generateShades(storedColors[selectedIndex]);
    }
    setLabel("Click to copy palette");
  }, []);

  const handleColorClick = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied to clipboard!`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = () => {
    setLabel("Analyzing image...");
    let dominantColorsHEX = [];
    if (imageRef.current) {
      const colorThief = new ColorThief();
      const dominantColorsRGB = colorThief.getPalette(imageRef.current, 6);
      dominantColorsHEX = dominantColorsRGB.map((color: number[]) =>
        rgbToHex(color[0], color[1], color[2])
      );
      setDominantColors(dominantColorsHEX);
      localStorage.setItem("dominantColors", JSON.stringify(dominantColorsHEX));
    }
    generateShades(dominantColorsHEX[selectedIndex]);
    setLabel("Click to copy palette");
  };

  const generateShades = (color: string) => {
    const shades = [];
    for (let i = 1; i <= 4; i++) {
      shades.push(
        tinycolor(color)
          .lighten(i * 10)
          .toString()
      );
    }
    shades.push(tinycolor(color).toString());
    for (let i = 1; i <= 3; i++) {
      shades.push(
        tinycolor(color)
          .darken(i * 10)
          .toString()
      );
    }
    setShades(shades);
  };

  return (
    <div className="text-center bg-[#F5EFFF] h-screen flex justify-center items-center">
      <div className="p-6 mx-auto w-full max-w-[850px]">
        <Toaster position="top-center" reverseOrder={false} />
        <h1 className="text-5xl md:text-8xl font-semibold text-center">
          PalettePix
        </h1>
        <p className="text-sm md:text-base text-[#333333] pt-2">
          Create magical palettes from your pictures with PalettePix! 📸🎨
        </p>
        <div className="relative mt-10">
          <input
            onChange={handleFileUpload}
            type="file"
            name="file"
            id="file"
            className="hidden"
          />
          <label
            htmlFor="file"
            className="bg-[#A594F9] text-base font-medium text-[#F5EFFF] px-28 py-5 rounded-full shadow-md cursor-pointer"
          >
            Upload Picture
          </label>
        </div>
        {image && (
          <>
            <img
              ref={imageRef}
              src={image}
              alt="Uploaded"
              crossOrigin="anonymous"
              onLoad={handleImageLoad}
              hidden
            />
          </>
        )}
        <div className="flex gap-2 mt-8">
          {dominantColors.map((color, index) => (
            <div
              key={index}
              style={{ backgroundColor: color }}
              onClick={() => {
                setSelectedIndex(index);
                generateShades(color);
              }}
              className={`h-12 w-full border border-gray-400 rounded-full mt-4 transition ${
                selectedIndex === index &&
                "ring-2 " + getContrastingTextColor(color)
              }`}
            />
          ))}
        </div>
        <p className="text-sm opacity-70 mt-4">{label}</p>
        <div className="space-y-4 mt-4">
          {shades.map((shade, index) => (
            <div
              key={index}
              style={{
                backgroundColor: shade,
                color: getContrastingTextColor(shade),
              }}
              onClick={() => handleColorClick(shade)}
              className="flex text-sm justify-center items-center rounded-full h-11 w-full border border-gray-400 cursor-pointer transition"
            >
              {shade}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
