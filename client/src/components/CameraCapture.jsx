import { useEffect, useRef, useState } from 'react';

export default function CameraCapture({ onCapture, disabled }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError('Camera access is required for live selfie capture.');
      }
    };

    const startLocation = () => {
      if (!navigator.geolocation) {
        setLocError('Geolocation is not supported by this browser.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => setLocError('Location permission is required to punch attendance.'),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    };

    startCamera();
    startLocation();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !location) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const selfie = canvas.toDataURL('image/jpeg', 0.8);
    setPreview(selfie);
    onCapture?.({
      selfie,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  return (
    <div className="camera-panel">
      <div className="camera-frame">
        {!preview ? (
          <video ref={videoRef} playsInline muted className="camera-video" />
        ) : (
          <img src={preview} alt="Captured selfie" className="camera-video" />
        )}
      </div>

      <div className="camera-meta">
        {error && <p className="error-text">{error}</p>}
        {locError && <p className="error-text">{locError}</p>}
        {location && (
          <p className="muted">
            Location locked: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </p>
        )}
        {!location && !locError && <p className="muted">Fetching location…</p>}
      </div>

      <div className="btn-row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={capture}
          disabled={disabled || !ready || !location || !!error}
        >
          Capture live selfie
        </button>
        {preview && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setPreview('');
              onCapture?.(null);
            }}
          >
            Retake
          </button>
        )}
      </div>
    </div>
  );
}
