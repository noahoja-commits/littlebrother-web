"use client";

import React, { useState } from "react";
import { Camera, MapPin, Calendar, Smartphone, Info, Loader2, FileImage } from "lucide-react";
import exifr from "exifr";

interface ExifData {
  Make?: string;
  Model?: string;
  DateTimeOriginal?: Date | string;
  latitude?: number;
  longitude?: number;
  Software?: string;
  FNumber?: number;
  ExposureTime?: number;
  ISO?: number;
  FocalLength?: number;
  ImageWidth?: number;
  ImageHeight?: number;
  [key: string]: unknown;
}

export default function ExifTool() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExifData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rawTags, setRawTags] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setData(null);
    setRawTags(null);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      // Parse full EXIF, TIFF, GPS, IPTC, and XMP locally in client
      const output = await exifr.parse(file, {
        gps: true,
        tiff: true,
        exif: true,
        iptc: true,
        xmp: true
      });

      if (!output || Object.keys(output).length === 0) {
        setError("No EXIF metadata found in this image. Most social platforms (Twitter, Instagram, WhatsApp) strip EXIF on upload.");
      } else {
        setData(output);
        setRawTags(output);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError("Failed to decode EXIF tags: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur">
        <h2 className="text-xl font-bold text-sky-400 flex items-center gap-2">
          <Camera className="w-5 h-5" /> Image EXIF & GPS Metadata Extractor
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Inspect camera hardware, lens details, timestamps, device serials, and extract embedded GPS coordinates from JPEG/TIFF/HEIC photographs.
        </p>

        <div className="mt-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-950/60 hover:bg-slate-900/60 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileImage className="w-8 h-8 text-sky-400 mb-2" />
              <p className="text-xs text-slate-300 font-medium">
                Click to upload image or drag & drop (JPEG, PNG, HEIC, TIFF)
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Processed 100% locally in browser memory for complete privacy
              </p>
            </div>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>Original LittleBrother `exifRead` ported to modern edge client parser.</span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 bg-slate-900/40 rounded-xl border border-slate-800">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <span className="ml-3 text-xs font-mono text-slate-400">Parsing EXIF header markers...</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs p-4 rounded-xl font-mono">
          [!] {error}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Hardware & Time Info */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 pb-3 border-b border-slate-800">
              <Smartphone className="w-4 h-4 text-sky-400" /> Camera & Capture Specs
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">Camera Brand</span>
                <span className="text-slate-200 font-bold">{data.Make ? String(data.Make) : "N/A"}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">Camera Model</span>
                <span className="text-slate-200 font-bold">{data.Model ? String(data.Model) : "N/A"}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">Capture Timestamp</span>
                <span className="text-sky-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {data.DateTimeOriginal ? String(data.DateTimeOriginal) : "N/A"}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">Software / Firmware</span>
                <span className="text-slate-300 truncate block">{data.Software ? String(data.Software) : "N/A"}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">Aperture / ISO</span>
                <span className="text-slate-300">
                  {data.FNumber ? `f/${data.FNumber}` : "N/A"} | ISO {data.ISO ? String(data.ISO) : "N/A"}
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">Dimensions</span>
                <span className="text-slate-300">
                  {data.ImageWidth && data.ImageHeight ? `${data.ImageWidth} x ${data.ImageHeight} px` : "N/A"}
                </span>
              </div>
            </div>

            {imagePreview && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg border border-slate-800 object-contain" />
              </div>
            )}
          </div>

          {/* GPS Coordinates & Map */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Embedded GPS Coordinates
                </h3>
                {data.latitude && data.longitude ? (
                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                    GPS PRESENT
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-400">
                    NO GPS DATA
                  </span>
                )}
              </div>

              {data.latitude && data.longitude ? (
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Exact Coordinates:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                    </span>
                  </div>

                  <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-video">
                    <iframe
                      title="EXIF Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.longitude - 0.02}%2C${data.latitude - 0.01}%2C${data.longitude + 0.02}%2C${data.latitude + 0.01}&layer=mapnik&marker=${data.latitude}%2C${data.longitude}`}
                      className="opacity-80 contrast-125 filter"
                    />
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block w-full text-center bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg transition"
                  >
                    Open Location in Google Maps
                  </a>
                </div>
              ) : (
                <div className="mt-8 text-center text-xs text-slate-500 p-8 border border-dashed border-slate-800 rounded-lg">
                  No GPS coordinates embedded. The photo was taken with location services disabled or was scrubbed.
                </div>
              )}
            </div>

            {/* All raw tags expandable */}
            {rawTags && (
              <details className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
                <summary className="text-sky-400 cursor-pointer hover:underline">
                  View All Raw Tags ({Object.keys(rawTags).length})
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto bg-slate-950 p-2 rounded text-[11px] text-slate-300">
                  <pre>{JSON.stringify(rawTags, null, 2)}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
