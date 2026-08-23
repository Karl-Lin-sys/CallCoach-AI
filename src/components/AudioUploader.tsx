import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Mic, UploadCloud, Square, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AudioUploaderProps {
  onAudioReady: (file: File) => void;
  isLoading: boolean;
}

export default function AudioUploader({ onAudioReady, isLoading }: AudioUploaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.webm', '.ogg'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onAudioReady(acceptedFiles[0]);
      }
    },
    disabled: isLoading || isRecording,
  });

  const startRecording = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        onAudioReady(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Could not access microphone. Please allow permissions.');
    }
  };

  const stopRecording = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Upload Sales Call</h2>
        <p className="text-slate-500">Upload an audio file or record directly to get AI-powered insights.</p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors cursor-pointer",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100",
          (isLoading || isRecording) && "opacity-60 cursor-not-allowed",
          isRecording && "border-red-400 bg-red-50"
        )}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-blue-600 font-medium">Analyzing with Gemini AI...</p>
            <p className="text-slate-500 text-sm mt-2">This may take a minute or two for longer calls.</p>
          </div>
        ) : isRecording ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 animate-pulse">
              <Mic className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-2xl font-mono text-slate-700 mb-6">{formatTime(recordingTime)}</div>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-sm"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop Recording
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-slate-700 font-medium mb-1">Drag and drop audio file here</p>
            <p className="text-slate-500 text-sm mb-6">or click to browse from your computer (MP3, WAV, M4A)</p>
            
            <div className="flex items-center gap-4 w-full justify-center">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-slate-400 text-sm font-medium uppercase">OR</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <button
              onClick={startRecording}
              className="mt-6 flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm"
            >
              <Mic className="w-4 h-4" />
              Record Microphone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
