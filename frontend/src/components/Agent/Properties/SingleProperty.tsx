/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
//import { MicrophoneIcon, StopCircleIcon, SpeakerWaveIcon, PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { StopCircleIcon, SpeakerWaveIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import {getSinglePropertyDetail} from "@/lib/Agent/PropertyAPI";
import { useParams } from "next/navigation";

interface Images {
  _id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface Property {
  title: string;
  type: string;
  category: string;
  location: string;
  price: number;
  status: string;
  description: string;
  images: Images[];
  built_up_area: number;
  carpet_area: number;
  unit_area_type: string;
  plot_front_area?: number;
  plot_depth_area?: number;
  plot_dimension_unit?: string;
  is_corner_plot?: boolean;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  floor_number: number;
  total_floors: number;
  washrooms?: number;
  cabins?: number;
  conference_rooms?: number;
  facing: string;
  overlooking: string[];
  property_age: string;
  transaction_type: string;
  gated_community: boolean;
  furnishing: string;
  flooring_type: string;
  amenities: string[];
  features: string[];
  water_source: string[];
  power_backup: string;
  rera_status: string;
  owner_name: string;
  owner_contact: string;
}

// const propertyData: Property = {
//   title: "Elegant Family Home",
//   type: "residential",
//   category: "villa",
//   location: "Bangalore, India",
//   price: 25000000,
//   status: "available",
//   description:
//     "A spacious 4 BHK villa with modern amenities and landscaped garden.",
//   images: [
//     {
//       url: "https://images.unsplash.com/photo-1682142880086-220107f1a07f?auto=format&fit=crop&w=600&q=80",
//       isPrimary: true,
//     },
//     {
//       url: "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=600&q=80",
//     },
//     {
//       url: "https://images.unsplash.com/photo-1518709268801-9e6e0e4f0b0f?auto=format&fit=crop&w=600&q=80",
//     },
//     {
//       url: "https://images.unsplash.com/photo-1506748686217-9e8a1e2b1b3e?auto=format&fit=crop&w=600&q=80",
//     },
//     {
//       url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80",
//     },
//     {
//       url: "https://images.unsplash.com/photo-1604014237744-2b2d8d9a8a3d?auto=format&fit=crop&w=600&q=80",
//     },
//     {
//       url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80",
//     },
//     {
//       url: "https://images.unsplash.com/photo-1460890542533-03db2b4a0d2e?auto=format&fit=crop&w=600&q=80",
//     },
//   ],
//   built_up_area: 3500,
//   carpet_area: 2800,
//   unit_area_type: "sq.ft",
//   plot_front_area: 50,
//   plot_depth_area: 70,
//   plot_dimension_unit: "ft",
//   is_corner_plot: true,
//   bedrooms: 4,
//   bathrooms: 4,
//   balconies: 2,
//   floor_number: 1,
//   total_floors: 2,
//   facing: "North-East",
//   overlooking: ["Garden", "Pool"],
//   property_age: "5 years",
//   transaction_type: "resale",
//   gated_community: true,
//   furnishing: "Fully Furnished",
//   flooring_type: "Marble",
//   amenities: ["Gym", "Swimming Pool", "Club House"],
//   features: ["Modular Kitchen", "Home Automation"],
//   water_source: ["Borewell", "Municipal"],
//   power_backup: "Yes",
//   rera_status: "Registered",
//   owner_name: "John Doe",
//   owner_contact: "+91 9876543210",
// };

const SingleProperty: React.FC = () => {
  // const [selectedImage, setSelectedImage] = useState<Images>(
  //   propertyData.images[0]
  // );

  const [selectedImage, setSelectedImage] = useState<Images | null>(null);

  // --- AI Voice Assistant State & Logic ---
  const [isListening, setIsListening] = useState(false);
  const [assistantStatus, setAssistantStatus] = useState("idle"); // idle, listening, thinking, speaking
  const [assistantResponse, setAssistantResponse] = useState("");
  //const [isSummaryPaused, setIsSummaryPaused] = useState(false);
  const [error, setError] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const [propertyData, setPropertyData] = useState<Property | null>(null);

  const params = useParams();
  const propertyId = params.id;

  // --- Voice Loading Effect ---
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
      }
    };
    getProperty();

    // The voices are loaded asynchronously.
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Also call it directly in case they are already loaded.

    // Initialize AudioContext on user interaction (best practice)
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      document.removeEventListener('click', initAudioContext);
    };
    document.addEventListener('click', initAudioContext);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      document.removeEventListener('click', initAudioContext);
    };
    
  }, []);

  const getProperty = async () => {
    if (propertyId) {
      const id = Array.isArray(propertyId) ? propertyId[0] : propertyId;
      const response = await getSinglePropertyDetail(id);
      const data = response.data;
      setPropertyData(data);
      const primaryImg =
        data.images.find((img: Images) => img.isPrimary) ||
        data.images[0] ||
        null;
      setSelectedImage(primaryImg);
    } else {
      setPropertyData(null);
      setSelectedImage(null);
    }
  }

  const formatIndianPrice = (price: number): string => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(2)} crore`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(2)} lakh`;
    }
    return price.toLocaleString("en-IN");
  };


  const speak = async (text: string, onEndCallback?: () => void) => {
    if (!audioContextRef.current) {
      setError("Audio context not ready. Please click anywhere on the page first.");
      return;
    }
    setAssistantStatus("speaking");
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/assistant/speak`, { text }, { responseType: 'arraybuffer' });
      const audioBuffer = await audioContextRef.current.decodeAudioData(response.data);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = onEndCallback || (() => setAssistantStatus("idle"));
      source.start(0);
      audioSourceRef.current = source;
    } catch (err) {
      console.error("Error fetching or playing speech:", err);
      setError("Sorry, I couldn't generate the audio for that.");
      setAssistantStatus("idle");
    }
  };

  // --- Generate full property text ---
  const generateFullPropertyText = useCallback((property: Property): string => {
    let text = `Here are the full details of the property: ${property.title}, a ${property.category} located in ${property.location}.
    Price: ₹${formatIndianPrice(property.price)}, Status: ${property.status}.
    Description: ${property.description}.
    Built-up Area: ${property.built_up_area} ${property.unit_area_type}, Carpet Area: ${property.carpet_area} ${property.unit_area_type}.`;

    if (property.plot_front_area) text += ` Plot Front: ${property.plot_front_area} ${property.plot_dimension_unit}.`;
    if (property.plot_depth_area) text += ` Plot Depth: ${property.plot_depth_area} ${property.plot_dimension_unit}.`;
    if (property.is_corner_plot) text += ` Corner Plot: Yes.`;

    text += ` Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}, Balconies: ${property.balconies}, Floor Number: ${property.floor_number}, Total Floors: ${property.total_floors}.`;
    text += ` Facing: ${property.facing}, Overlooking: ${property.overlooking.join(", ")}.`;
    text += ` Property Age: ${property.property_age}, Transaction Type: ${property.transaction_type}, Gated Community: ${property.gated_community ? "Yes" : "No"}.`;
    text += ` Furnishing: ${property.furnishing}, Flooring Type: ${property.flooring_type}.`;
    text += ` Amenities: ${property.amenities.join(", ")}, Features: ${property.features.join(", ")}, Water Source: ${property.water_source.join(", ")}, Power Backup: ${property.power_backup}, RERA Status: ${property.rera_status}.`;
    text += ` Owner Name: ${property.owner_name}, Contact: ${property.owner_contact}.`;

    return text;
  }, []);

  // --- Handle Speak Full Property ---
  const handleSpeakFullProperty = useCallback(() => {
    if (!audioContextRef.current) {
      setError("Audio context not ready. Please click anywhere on the page first.");
      return;
    }
    if (assistantStatus === 'speaking') {
      stopAll();
      return;
    }
    if (propertyData) {
      const fullText = generateFullPropertyText(propertyData);
      speak(fullText, () => setAssistantStatus("idle"));
    }
  }, [assistantStatus, generateFullPropertyText, propertyData]);

  const handleQuestion = async (question: string) => {
    setAssistantStatus("thinking");
    setError("");
    setAssistantResponse("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/assistant/ask`, {
        question,
        propertyData,
      });

      if (response.data && response.data.answer) {
        setAssistantResponse(response.data.answer);
        speak(response.data.answer, () => setAssistantStatus("idle"));
      } else {
        throw new Error("No answer received from the assistant.");
      }
    } catch (err) {
      const errorMessage = "Sorry, I couldn't process that. Please try again.";
      setError(errorMessage);
      setAssistantStatus("idle");
      console.error("Error with AI Assistant:", err);
    }
  };

  const generateSummaryText = useCallback((property: Property): string => {
    return `Discover your dream home! The "${property.title}" is a stunning ${property.category} located in ${property.location}.
  Priced at just ${formatIndianPrice(property.price)}, this property offers ${property.bedrooms} spacious bedrooms,
  modern amenities like ${property.amenities.join(", ")}, and features such as ${property.features.join(", ")}.
  With a beautiful ${property.facing} facing and overlooking ${property.overlooking.join(", ")},
  it's perfect for families seeking comfort and luxury. Don't miss this opportunity—schedule a visit today!`;
  }, []);

  const handleSpeakSummary = useCallback(() => {
    if (!audioContextRef.current) {
      setError("Audio context not ready. Please click anywhere on the page first.");
      return;
    }
    if (assistantStatus === 'speaking') {
      stopAll();
      return;
    }

    // If idle, start speaking the summary
    let speechText = '';
    if (propertyData) {
      speechText = generateSummaryText(propertyData);
    }
    speak(speechText, () => { 
      setAssistantStatus("idle"); 
      //setIsSummaryPaused(false); 
    });
  }, [assistantStatus, generateSummaryText, speak]);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition; // For browser compatibility
    if (!SpeechRecognition) {
      setError("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = recognitionRef.current || new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setAssistantStatus("listening");
    };
    recognition.onresult = (event: any) => {
      const question = event.results[0][0].transcript;
      setIsListening(false); // Stop listening visually once a result is received
      handleQuestion(question);
    };
    recognition.onend = () => {
      setIsListening(false);
      setAssistantStatus((currentStatus) => (currentStatus === 'listening' ? 'idle' : currentStatus));
    };
    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        setError(`Error during recognition: ${event.error}`);
      }
      setAssistantStatus("idle");
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopAll = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    //setIsSummaryPaused(false);
    setAssistantStatus("idle");
  };

  useEffect(() => {
    // Cleanup function to stop speech and recognition when the component unmounts
    return () => stopAll(); // Cleanup on unmount
  }, []);

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${url}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      {/* Main Image */}
      {/* Main Image */}
      <div className="mb-4 relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
        {selectedImage?.url ? (
          <Image
            src={getImageUrl(selectedImage.url)}
            alt={selectedImage.alt || propertyData?.title || "Property Image"}
            fill
            className="rounded-lg border-4 border-blue-500 object-cover"
            priority={true}
          />
        ) : (
          <Image
            src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
            alt="Default Property Image"
            fill
            className="rounded-lg border-4 border-blue-500 object-cover"
            priority={true}
          />
        )}

        {/* Prev Button */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded"
          onClick={() => {
            if (!propertyData?.images?.length || !selectedImage) return;
            const idx = propertyData.images.findIndex(
              (img) => img._id === selectedImage._id
            );
            const prevIdx = (idx - 1 + propertyData.images.length) % propertyData.images.length;
            setSelectedImage(propertyData.images[prevIdx]);
          }}
        >
          ❮
        </button>

        {/* Next Button */}
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded"
          onClick={() => {
            if (!propertyData?.images?.length || !selectedImage) return;
            const idx = propertyData.images.findIndex(
              (img) => img._id === selectedImage._id
            );
            const nextIdx = (idx + 1) % propertyData.images.length;
            setSelectedImage(propertyData.images[nextIdx]);
          }}
        >
          ❯
        </button>
      </div>

      {/* Thumbnail Images */}
      {/* <div className="flex items-center gap-2 mt-2">
        {propertyData?.images.map((img) => (
          <Image
            key={img._id}
            src={getImageUrl(img.url)}
            alt={img.alt || propertyData.title}
            width={80}
            height={80}
            className={`w-20 h-20 object-cover rounded cursor-pointer border ${
              selectedImage?._id === img._id ? "border-blue-500" : "border-gray-200"
            }`}
            onClick={() => setSelectedImage(img)}
          />
        ))}
      </div> */}


      {/* Thumbnail Images */}
      {/* <div className="flex items-center gap-2 mb-6">
        <button
          onClick={handlePrevThumbs}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          Prev
        </button>
        {propertyData.images
          .slice(thumbStart, thumbStart + thumbsPerPage)
          .map((img, idx) => (
            <Image
              width={80}
              height={80}
              key={idx}
              src={img.url}
              alt={img.alt || propertyData.title}
              className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${selectedImage.url === img.url
                ? "border-blue-500"
                : "border-gray-200"
                }`}
              onClick={() => setSelectedImage(img)}
            />
          ))}
        <button
          onClick={handleNextThumbs}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          Next
        </button>
      </div> */}

      {/* Basic Info */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          {propertyData?.title}
        </h1>
        {/* AI Assistant Section */}
        {/* <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleListening}
                disabled={isListening || assistantStatus !== 'idle'}
                className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Ask a question"
              >
                <MicrophoneIcon className="h-6 w-6" />
              </button>
              <button
                onClick={handleSpeakSummary}
                // disabled={isListening || assistantStatus === 'thinking' || (assistantStatus === 'speaking' && !isSummaryPaused && assistantResponse)}
                className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Read Full Summary"
              >
                {assistantStatus === 'speaking' && !isSummaryPaused && !assistantResponse ? <PauseIcon className="h-6 w-6" /> :
                  assistantStatus === 'speaking' && isSummaryPaused && !assistantResponse ? <PlayIcon className="h-6 w-6" /> :
                    <SpeakerWaveIcon className="h-6 w-6" />}
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-700">AI Assistant</p>
              <div className="text-sm text-gray-500">
                {assistantStatus === 'listening' && <p>Listening for your question...</p>}
                {assistantStatus === 'thinking' && <p>Thinking...</p>}
                {assistantStatus === 'speaking' && assistantResponse && <p>Answering your question...</p>}
                {assistantStatus === 'speaking' && !assistantResponse && (
                  <p>
                    Reading property summary...
                    {isSummaryPaused && <span className="font-semibold text-orange-600"> (Paused)</span>}
                  </p>
                )}
                {assistantStatus === 'idle' && (
                  <p>
                    Click the <span className="text-blue-600 font-semibold">blue mic</span> to ask a question, or the{' '}
                    <span className="text-green-600 font-semibold">green speaker</span> to hear a full summary.
                  </p>
                )}
              </div>
            </div>
            {(assistantStatus === 'speaking' ||
              assistantStatus === 'thinking' ||
              isListening) && (
                <button onClick={stopAll} className="text-gray-500 hover:text-red-600" title="Stop">
                  <StopCircleIcon className="h-8 w-8" />
                </button>
              )}
          </div>
          {assistantResponse && <p className="mt-3 text-gray-800 bg-blue-50 p-3 rounded-md">{assistantResponse}</p>}
          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
        </div> */}

        {/* AI Assistant Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              {/* <button
                onClick={toggleListening}
                disabled={isListening || assistantStatus !== 'idle'}
                className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Ask a question"
              >
                <MicrophoneIcon className="h-6 w-6" />
              </button> */}
              <button
                onClick={handleSpeakFullProperty}
                className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                title="Read Full Property Details"
              >
                <SpeakerWaveIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-700">AI Assistant</p>
              <div className="text-sm text-gray-500">
                {assistantStatus === 'listening' && <p>Listening for your question...</p>}
                {assistantStatus === 'thinking' && <p>Thinking...</p>}
                {assistantStatus === 'speaking' && <p>Speaking...</p>}
                {assistantStatus === 'idle' && <p>Click the mic to ask a question or speaker to hear full property details.</p>}
              </div>
            </div>
            {(assistantStatus === 'speaking' || assistantStatus === 'thinking' || isListening) && (
              <button onClick={stopAll} className="text-gray-500 hover:text-red-600" title="Stop">
                <StopCircleIcon className="h-8 w-8" />
              </button>
            )}
          </div>
          {assistantResponse && <p className="mt-3 text-gray-800 bg-blue-50 p-3 rounded-md">{assistantResponse}</p>}
          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
          <p>
            Type:{" "}
            <span className="font-semibold text-gray-800">
              {propertyData?.type}
            </span>
          </p>
          <p>
            Category:{" "}
            <span className="font-semibold text-gray-800">
              {propertyData?.category}
            </span>
          </p>
          <p>
            Location:{" "}
            <span className="font-semibold text-gray-800">
              {propertyData?.location}
            </span>
          </p>
          <p>
            Price:{" "}
            <span className="font-semibold text-gray-800">
              ₹{propertyData?.price}
            </span>
          </p>
          <p>
            Status:{" "}
            <span className="font-semibold text-gray-800">
              {propertyData?.status}
            </span>
          </p>
        </div>
        <p className="text-gray-700 mt-4">{propertyData?.description}</p>
      </div>

      {/* Area & Configuration */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Area & Configuration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
          <p>
            Built-up Area: {propertyData?.built_up_area}{" "}
            {propertyData?.unit_area_type}
          </p>
          <p>
            Carpet Area: {propertyData?.carpet_area}{" "}
            {propertyData?.unit_area_type}
          </p>
          {propertyData?.plot_front_area && (
            <p>
              Plot Front: {propertyData.plot_front_area}{" "}
              {propertyData.plot_dimension_unit}
            </p>
          )}
          {propertyData?.plot_depth_area && (
            <p>
              Plot Depth: {propertyData.plot_depth_area}{" "}
              {propertyData.plot_dimension_unit}
            </p>
          )}
          {propertyData?.is_corner_plot && <p>Corner Plot: {propertyData?.is_corner_plot}</p>}
          <p>Bedrooms: {propertyData?.bedrooms}</p>
          <p>Bathrooms: {propertyData?.bathrooms}</p>
          <p>Balconies: {propertyData?.balconies}</p>
          <p>Floor Number: {propertyData?.floor_number}</p>
          <p>Total Floors: {propertyData?.total_floors}</p>
        </div>
      </div>

      {/* Facing & Overlooking */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Facing & Overlooking
        </h2>
        <p className="text-gray-700">Facing: {propertyData?.facing}</p>
        <p className="text-gray-700">
          Overlooking: {propertyData?.overlooking.join(", ")}
        </p>
      </div>

      {/* Additional Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Additional Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
          <p>Property Age: {propertyData?.property_age}</p>
          <p>Transaction Type: {propertyData?.transaction_type}</p>
          <p>Gated Community: {propertyData?.gated_community ? propertyData?.gated_community : "No"}</p>
          <p>Furnishing: {propertyData?.furnishing}</p>
          <p>Flooring Type: {propertyData?.flooring_type}</p>
          <p>Amenities: {propertyData?.amenities.join(", ")}</p>
          <p>Features: {propertyData?.features.join(", ")}</p>
          <p>Water Source: {propertyData?.water_source.join(", ")}</p>
          <p>Power Backup: {propertyData?.power_backup}</p>
          <p>RERA Status: {propertyData?.rera_status}</p>
        </div>
      </div>

      {/* Owner Details */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Owner Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
          <p>Name: {propertyData?.owner_name}</p>
          <p>Contact: {propertyData?.owner_contact}</p>
        </div>
      </div>
    </div>
  );
};

export default SingleProperty;
