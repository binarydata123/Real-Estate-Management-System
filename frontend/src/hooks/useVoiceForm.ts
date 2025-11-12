/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { UseFormGetValues, UseFormTrigger } from "react-hook-form";
import {
  propertyTypeOptions,
  commercialCategoryOptions,
  residentialCategoryOptions,
  unitAreaTypeOptions,
  plotDimensionUnitOptions,
  facingOptions,
  propertyAgeOptions,
  furnishingOptions,
  powerBackupOptions,
  transactionTypeOptions,
  reraStatusOptions,
  overlookingOptions,
  waterSourceOptions,
  featuresOptions,
  amenitiesOptions,
} from "@/schemas/Agent/propertySchema";

interface VoiceField {
  name: string;
  label: string;
  desc: string;
  fieldType: string;
  step?: number;
  required?: boolean;
}

export function useVoiceForm(
  fields: VoiceField[],
  setValue: any,
  trigger: UseFormTrigger<any>,
  getValues: UseFormGetValues<any>,
  currentStep: number,
  filteredOverlookingOptions: any,
  filteredFeatures: any,
  filteredAmenities: any
) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [voiceReady, setVoiceReady] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [firstTimeMessageSpoken, setFirstTimeMessageSpoken] = useState(false);

  const lastAnswerRef = useRef<string | null>(null);
  const repeatCountRef = useRef<number>(0);

  // 🔊 Speak with OpenAI TTS
  const speakWithOpenAI = async (text: string) => {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: text,
      }),
    });

    const audio = new Audio(URL.createObjectURL(await response.blob()));
    // await audio.play();
    // ✅ Wait until audio finishes playing
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.play().catch(() => resolve()); // resolve even if play fails
    });
  };

  // 🎙️ Start speech recognition
  const startListening = (filteredFields: VoiceField[]) => {
    if (isProcessing) return;
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    recognitionRef.current = new (window as any).webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = async (event: any) => {
      if (isProcessing) return;
      setIsProcessing(true);

      const speechResult = event.results[0][0].transcript.trim().toLowerCase();

      const field = filteredFields[currentFieldIndex];

      // 🧠 Skip speaking for file fields (user uploads manually)
      // if (field.fieldType === "file") {
      //   console.log("📁 File field detected — waiting for manual upload.");
      //   setIsProcessing(false);
      //   recognitionRef.current.stop();
      //   return;
      // }

      // 🧠 Check if user repeated same answer twice
      if (lastAnswerRef.current === speechResult) {
        repeatCountRef.current += 1;
      } else {
        repeatCountRef.current = 1;
        lastAnswerRef.current = speechResult;
      }

      if (repeatCountRef.current >= 2) {
        await speakWithOpenAI(
          `You already said that. Please provide a different answer for ${field.label}.`
        );

        // Don't move forward — wait for new input
        setIsProcessing(false);
        startListening(filteredFields);
        return;
      }

      // 🆕 NEW LOGIC — Handle "skip all fields" but validate required ones
      if (
        speechResult === "skip all fields" ||
        speechResult === "all fields skip"
      ) {
        // Find all required fields that are empty
        const requiredFields = filteredFields.filter(
          (f) => f.required && !getValues(f.name)
        );

        if (requiredFields.length > 0) {
          // 🧠 Speak required fields one by one
          await speakWithOpenAI(
            `Some required fields are missing. Let's fill them before continuing.`
          );

          for (const missingField of requiredFields) {
            await speakWithOpenAI(
              `${missingField.label} is required. Please provide a value.`
            );
            await new Promise<void>((resolve) => {
              // Wait for user to answer for this required field
              const tempRecognition = new (
                window as any
              ).webkitSpeechRecognition();
              tempRecognition.lang = "en-US";
              tempRecognition.onresult = async (evt: any) => {
                const answer = evt.results[0][0].transcript
                  .trim()
                  .toLowerCase();
                setValue(missingField.name, answer);
                await trigger(missingField.name);
                tempRecognition.stop();
                resolve();
              };
              tempRecognition.start();
            });
          }

          await speakWithOpenAI(
            `All required fields are now filled. You can continue to the next step.`
          );
        } else {
          // ✅ Safe to skip all
          await speakWithOpenAI(
            `Okay, skipping all fields in step ${currentStep}. You can continue to the next step.`
          );
        }

        recognitionRef.current.stop();
        setCurrentFieldIndex(filteredFields.length);
        setIsProcessing(false);
        return;
      }

      if (
        speechResult.toLowerCase() === "skip" ||
        speechResult.toLowerCase() === "skip this field"
      ) {
        // Speak confirmation for skipping
        await speakWithOpenAI(`Okay, skipping ${field.label}.`);

        // Move to the next field
        if (currentFieldIndex < filteredFields.length - 1) {
          setCurrentFieldIndex((prev) => prev + 1);
        } else {
          await speakWithOpenAI(
            `All Step ${currentStep} fields are completed. You can continue to the next step.`
          );
          recognitionRef.current.stop();
        }

        setIsProcessing(false);
        return; // Exit early
      }

      // ✅ Improved checkbox handling with option matching
      if (field.fieldType === "checkbox") {
        const currentValues: string[] = getValues(field.name) || [];
        const spokenValue = speechResult.toLowerCase().trim();

        // ✅ If user says "next" or "done", move to next field
        if (["next", "done", "go next", "continue"].includes(spokenValue)) {
          await speakWithOpenAI(`Okay, moving to next field.`);
          if (currentFieldIndex < filteredFields.length - 1) {
            setCurrentFieldIndex((prev) => prev + 1);
          } else {
            await speakWithOpenAI(
              `All Step ${currentStep} fields are completed. You can continue to the next step.`
            );
            recognitionRef.current.stop();
          }
          setIsProcessing(false);
          return;
        }

        let optionsList: { label: string; value: string }[] = [];

        switch (field.name) {
          case "overlooking":
            optionsList = overlookingOptions;
            break;
          case "water_source":
            optionsList = waterSourceOptions;
            break;
          case "features":
            optionsList = featuresOptions;
            break;
          case "amenities":
            optionsList = amenitiesOptions;
            break;
          default:
            optionsList = [];
        }

        // ✅ Try to match spoken value with an option
        const matchedOption = optionsList.find(
          (opt) => opt.value.toLowerCase() === spokenValue
        );

        if (matchedOption) {
          if (!currentValues.includes(matchedOption.value)) {
            const newValues = [...currentValues, matchedOption.value];
            setValue(field.name, newValues, {
              shouldDirty: true,
              shouldValidate: true,
            });
          } else {
            await speakWithOpenAI(
              `${matchedOption.value} is already selected. You can say another option or say "next" to continue.`
            );
          }
        } else {
          await speakWithOpenAI(
            `I could not find a matching option for ${spokenValue}. Please try again.`
          );
        }

        // 👂 Keep listening for more values in the same field
        setIsProcessing(false);
        startListening(filteredFields);
        return;
      } else if (field.fieldType !== "checkbox") {
        setValue(field.name, speechResult);
      }
      //  else {
      //   setValue(field.name, speechResult);
      // }
      // Check if field type is checkbox (Step 3)
      // if (field.fieldType === 'checkbox') {
      //     const currentValues: string[] = getValues(field.name) || [];
      //     const newValues = [...currentValues, speechResult]; // append value
      //     setValue(field.name, newValues);
      // } else {
      //     // normal field
      //     setValue(field.name, speechResult);
      // }

      const isValid = await trigger(field.name);

      if (!isValid || !getValues(field.name)) {
        await speakWithOpenAI(
          `${field.label} is required. Please say the ${field.label} again.`
        );
        setIsProcessing(false);
        startListening(filteredFields);
        return;
      }

      if (currentFieldIndex < filteredFields.length - 1) {
        setCurrentFieldIndex((prev) => prev + 1);
      } else {
        await speakWithOpenAI(
          `All Step ${currentStep} fields are completed. You can continue to the next step.`
        );
        recognitionRef.current.stop();
      }

      setIsProcessing(false);
    };

    recognitionRef.current.start();
  };

  // 📢 Speak only current step’s fields
  useEffect(() => {
    if (!voiceReady) return;

    const filteredFields = fields.filter(
      (f) => !f.step || f.step === currentStep
    );

    if (currentFieldIndex >= filteredFields.length) return;

    const speakField = async () => {
      lastAnswerRef.current = null;
      repeatCountRef.current = 0;
      // First-time instruction
      if (!firstTimeMessageSpoken) {
        await speakWithOpenAI(
          "Welcome! I will read each field. Speak your answer clearly. Say 'skip' to skip a field, or 'skip all fields' to skip remaining fields.I will repeat your answer to confirm. Let’s begin."
        );
        setFirstTimeMessageSpoken(true);
      }

      // Speak the current field label only
      //await speakWithOpenAI(filteredFields[currentFieldIndex].label);

      const field = filteredFields[currentFieldIndex];

      if (field.name === "type") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${propertyTypeOptions.map(
            (data) => data.value
          )}`
        );
      } else if (field.name === "category") {
        const currentValues = getValues(field.name);
        if (currentValues === "commercial") {
          await speakWithOpenAI(
            `Please Choose the ${field.label} ${commercialCategoryOptions.map(
              (data) => data.value
            )}`
          );
        } else {
          await speakWithOpenAI(
            `Please Choose the ${field.label} ${residentialCategoryOptions.map(
              (data) => data.value
            )}`
          );
        }
      } else if (field.name === "unit_area_type") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${unitAreaTypeOptions.map(
            (data) => data.value
          )}`
        );
      } else if (field.name === "plot_dimension_unit") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${plotDimensionUnitOptions.map(
            (data) => data.value
          )}`
        );
      } else if (field.name === "is_corner_plot") {
        await speakWithOpenAI(`Please Choose the ${field.label} yes no`);
      } else if (field.name === "facing") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${facingOptions.map(
            (data) => data.value
          )}`
        );
      } else if (field.name === "property_age") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${propertyAgeOptions.map(
            (data) => data.value
          )}`
        );
      } else if (field.name === "furnishing") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${furnishingOptions.map(
            (data) => data.value
          )}`
        );
      } else if (field.name === "power_backup") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${powerBackupOptions.map(
            (data) => data.value
          )}`
        );
      } else if (field.name === "gated_community") {
        await speakWithOpenAI(`Please Choose the ${field.label} yes no`);
      } else if (field.name === "transaction_type") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${transactionTypeOptions.map(
            (data) => data.value
          )}`
        );
      } else if (field.name === "rera_status") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${reraStatusOptions.map(
            (data) => data.value
          )}`
        );
      } else if (field.name === "overlooking") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${filteredOverlookingOptions.map(
            (data: any) => data.value
          )}`
        );
      } else if (field.name === "water_source") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${waterSourceOptions.map(
            (data) => data.value
          )}`
        );
      } else if (field.name === "features") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${filteredFeatures.map(
            (data: any) => data.value
          )}`
        );
      } else if (field.name === "amenities") {
        await speakWithOpenAI(
          `Please Choose the ${field.label} ${filteredAmenities.map(
            (data: any) => data.value
          )}`
        );
      } else {
        await speakWithOpenAI(`Please Enter ${field.label}`);
      }

      // Start listening for user answer
      startListening(filteredFields);
    };

    speakField();

    //const field = filteredFields[currentFieldIndex];

    // 🧩 Skip auto-speaking for file fields
    // if (field.fieldType === "file") {
    //   console.log("Skipping voice for file upload field:", field.label);
    //   return;
    // }

    // speakWithOpenAI(`${field.label}. ${field.desc}`).then(() => {
    //   startListening(filteredFields);
    // });
  }, [voiceReady, currentFieldIndex, currentStep]);

  // 🟢 Enable voice after first user click
  // useEffect(() => {
  //   const enableVoice = () => {
  //     setVoiceReady(true);
  //     window.removeEventListener("click", enableVoice);
  //   };
  //   window.addEventListener("click", enableVoice);
  // }, []);
  // 🟢 Start voice input manually
  // const startVoice = async () => {
  //   setVoiceReady(true);
  //   setIsListening(true);
  //   const filteredFields = fields.filter(
  //     (f) => !f.step || f.step === currentStep
  //   );
  //   setCurrentFieldIndex(0);
  //   await speakWithOpenAI(`Voice input enabled for step ${currentStep}.`);
  //   speakWithOpenAI(`${filteredFields[0].label}. ${filteredFields[0].desc}`).then(() => {
  //     startListening(filteredFields);
  //   });
  // };

  // 🔴 Stop listening manually
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceReady(false);
    }
  };

  // 🎚️ Toggle from parent
  const toggleVoiceListening = (enable: boolean) => {
    if (enable) setVoiceReady(true);
    else if (!enable) stopListening();
  };
  return {
    toggleVoiceListening,
  };
}
