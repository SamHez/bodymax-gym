import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from '../lib/toast';

export function CameraCapture({ onCapture, initialImage }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(initialImage || null);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState(null); // 'camera' or 'upload' or null
    const [isCameraActive, setIsCameraActive] = useState(false);

    // Sync state if initialImage changes externally
    useEffect(() => {
        if (initialImage) {
            setCapturedImage(initialImage);
        }
    }, [initialImage]);

    const startCamera = async () => {
        try {
            setError(null);
            setMode('camera');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsCameraActive(true);
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Could not access camera. Please check permissions.");
            setMode(null);
        }
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraActive(false);
        }
    }, [stream]);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            
            // Safety check: Ensure video has metadata/dimensions
            if (video.readyState < 2 || video.videoWidth === 0) {
                toast.error("Camera feed not ready. Please try again in a second.");
                return;
            }

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas size to match video aspect ratio or fixed size
            const size = Math.min(video.videoWidth, video.videoHeight);
            canvas.width = size;
            canvas.height = size;

            // Draw square crop from center
            const startX = (video.videoWidth - size) / 2;
            const startY = (video.videoHeight - size) / 2;

            context.drawImage(video, startX, startY, size, size, 0, 0, size, size);

            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedImage(imageData);
            onCapture(imageData);
            stopCamera();
            setMode(null);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            setCapturedImage(imageData);
            onCapture(imageData);
            setMode(null);
        };
        reader.readAsDataURL(file);
    };

    const triggerUpload = () => {
        setMode('upload');
        fileInputRef.current?.click();
    };

    const reset = () => {
        stopCamera();
        setCapturedImage(null);
        onCapture(null);
        setMode(null);
    };

    const cancelMode = () => {
        stopCamera();
        setMode(null);
    };

    return (
        <div className="space-y-4">
            <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-surface rounded-[2rem] overflow-hidden border-4 border-text/5 shadow-inner group">
                {capturedImage ? (
                    <div className="relative w-full h-full">
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        <button 
                            onClick={reset}
                            className="absolute top-4 right-4 p-2 bg-error/20 hover:bg-error/40 text-error rounded-full backdrop-blur-md transition-all"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>
                    </div>
                ) : mode === 'camera' ? (
                    <div className="relative w-full h-full">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover mirror"
                        />
                        <button 
                            onClick={cancelMode}
                            className="absolute top-4 right-4 p-2 bg-text/10 hover:bg-text/20 text-text rounded-full backdrop-blur-md transition-all"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text/20 p-8 text-center bg-surface/50">
                        <Camera size={48} strokeWidth={1} className="mb-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            No active identity set<br/>Choose method below
                        </p>
                    </div>
                )}

                {/* Overlays */}
                {error && (
                    <div className="absolute inset-0 bg-error/10 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                        <AlertCircle size={32} className="text-error mb-2" />
                        <p className="text-xs font-bold text-error uppercase tracking-widest">{error}</p>
                        <button onClick={() => setError(null)} className="mt-4 text-[10px] font-bold uppercase underline">Dismiss</button>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
            />

            <div className="flex flex-col gap-3">
                {!capturedImage && !mode && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={startCamera}
                            className="p-4 bg-accent/10 border border-accent/20 text-accent rounded-2xl text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-2 hover:bg-accent/20 transition-all"
                        >
                            <Camera size={20} /> Use Camera
                        </button>
                        <button
                            type="button"
                            onClick={triggerUpload}
                            className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-2 hover:bg-primary/20 transition-all"
                        >
                            <Upload size={20} /> Upload File
                        </button>
                    </div>
                )}

                {mode === 'camera' && isCameraActive && (
                    <button
                        type="button"
                        onClick={capturePhoto}
                        className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-premium hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Check size={18} strokeWidth={3} /> Authorize Capture
                    </button>
                )}

                {capturedImage && (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={reset}
                            className="flex-1 py-3 bg-surface border border-text/5 text-text/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:text-text/60 transition-all"
                        >
                            <RefreshCw size={14} /> Reset Identity
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Add CSS for mirroring the video feed
const style = document.createElement('style');
style.textContent = '.mirror { transform: scaleX(-1); }';
document.head.appendChild(style);
