import { Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import React from "react";

type UploadLogoImgProps = {
    title: string;
    subtitle: string;
    preview: string | null;
    setPreview: (value: string) => void;
    size?: number;
};
export default function uploadLogoImg({
    title,
    subtitle,
    preview,
    setPreview,
    size = 120,
}: UploadLogoImgProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Upload className="text-blue-600 w-5 h-5" /> {title}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>

            <div className="flex items-center gap-10 mt-6">

                {/* PREVIEW BOX */}
                <div
                    className="relative group"
                    style={{ width: size, height: size }}
                >
                    <div className="w-full h-full border rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                        {preview ? (
                            <Image
                                src={preview}
                                alt="Preview"
                                width={size}
                                height={size}
                                className="object-contain"
                            />
                        ) : (
                            <span className="text-gray-400 text-sm">No Image</span>
                        )}
                    </div>

                    {/* DELETE BUTTON */}
                    {preview && (
                        <button
                            onClick={() => setPreview("")}
                            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow opacity-0 group-hover:opacity-100 transition"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* FILE UPLOAD */}
                <label
                    className="cursor-pointer w-56 px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg 
                    hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                >
                    <Upload className="w-5 h-5" /> Upload Image
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setPreview(URL.createObjectURL(file));
                        }}
                    />
                </label>
            </div>

            {/* DRAG & DROP AREA */}
            <div
                className="mt-6 border-2 border-dashed border-gray-300 rounded-xl p-5 text-center text-gray-500 hover:border-blue-500 hover:text-blue-600 transition cursor-pointer"
            >
                <p className="text-sm">Drag & Drop your image here</p>
            </div>
        </div>
    );
}
