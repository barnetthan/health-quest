import React, { useRef, useState, useEffect } from "react";
import OpenAI from "openai";

const CameraCapture = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [macros, setMacros] = useState<string | null>(null);

  // Start the camera on mount
  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // rear camera
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Could not access camera.");
      }
    };

    getCameraStream();
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/png");
    setPhoto(dataURL);

    analyzePhoto(dataURL);
  };

  const analyzePhoto = async (imageData: string) => {
    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "analyze the image and return the macronutrients",
              },
              {
                type: "input_image",
                image_url: imageData,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "macronutrients",
            description: "Extract macronutrients from the image.",
            schema: {
              type: "object",
              properties: {
                protein: {
                  type: "number",
                },
                carbs: {
                  type: "number",
                },
                fat: {
                  type: "number",
                },
              },
              required: ["protein", "fat", "carbs"],
              additionalProperties: false,
            },
          },
        },
      });
      const data = response;
      console.log("Analysis result:", response);
      // Assuming the response contains macros in a specific format
      setMacros(data.output_text);
      console.log("Macros:", data.output_text);
    } catch (error) {
      console.error("Error analyzing photo:", error);
      alert("Failed to analyze the photo.");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", maxWidth: "400px", borderRadius: "8px" }}
      />
      <button
        onClick={takePhoto}
        style={{ marginTop: "10px", padding: "10px 20px" }}
      >
        📸 Upload a meal
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {photo && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={photo}
            alt="Captured"
            style={{ width: "100%", maxWidth: "400px", borderRadius: "8px" }}
          />
        </div>
      )}
      {macros && (
        <div style={{ marginTop: "10px", textAlign: "left" }}>
          <h3>Meal Macros:</h3>
          <p>{macros}</p>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
