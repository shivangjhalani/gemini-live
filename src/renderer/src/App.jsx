// src/renderer/src/App.jsx
import { useState, useRef, useEffect } from 'react'
import './assets/main.css'

function App() {
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)

  // This effect runs when the 'stream' state changes to update the video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const handleStartCapture = async () => {
    try {
      // Use the standard getDisplayMedia API. This will trigger the native
      // screen picker and return the stream directly.
      const capturedStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
            // It's often a good idea to suggest ideal frame rates
            frameRate: { ideal: 30, max: 60 }
        },
        audio: false // We will handle microphone audio later
      })

      console.log('Stream acquired:', capturedStream)

      // Update the state with the new stream
      setStream(capturedStream)
    } catch (error) {
      // The user likely canceled the screen picker
      if (error.name === 'NotAllowedError') {
        console.log('Screen capture cancelled by user.')
      } else {
        console.error('Error capturing screen:', error)
      }
      // Clear any previous stream if capture fails
      setStream(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Gemini Screen Capture Test (React)</h1>
      <p className="text-base text-gray-600 mb-6 text-center">Click the button to select and display your primary screen.</p>
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={handleStartCapture}
          className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          Start Screen Capture
        </button>
      </div>
      <video
        className="w-full max-w-3xl aspect-video rounded-lg border border-gray-300 shadow-lg mt-8"
        ref={videoRef}
        autoPlay
        playsInline
      ></video>
    </div>
  )
}

export default App
