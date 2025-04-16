import { useRef, useState, useEffect } from "react";
import OpenAI from "openai";

const CameraCapture = ({ onMacrosChange }: any) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    analyzePhoto(dataURL);
  };

  const analyzePhoto = async (imageData: string) => {
    setIsAnalyzing(true);
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
                detail: "high", // or "low" or "auto"
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
      const { protein, fat, carbs } = JSON.parse(data.output_text);
      // Call the parent callback to pass macros data
      onMacrosChange(fat, protein, carbs);
    } catch (error) {
      console.error("Error analyzing photo:", error);
      alert("Failed to analyze the photo.");
    } finally {
      setIsAnalyzing(false);
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
        className="btn btn-primary"
        style={{ marginTop: "10px" }}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? "Analyzing..." : "📸 Upload a meal"}
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default CameraCapture;
