// src/renderer/src/App.jsx
import { useState, useRef, useEffect } from 'react'
import './assets/main.css'

function App() {
  const videoRef = useRef(null)
  const [screenStream, setScreenStream] = useState(null)
  const [audioStream, setAudioStream] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)

  // This effect hook manages the video element's source.
  // It now only displays the screen capture, as the user doesn't need to hear their own audio.
  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream
    } else if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [screenStream])

  const startConversation = async () => {
    try {
      // Request screen capture stream
      const videoStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30, max: 60 } },
        audio: false // We request audio separately for better control
      })

      // Request microphone audio stream
      const micStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      })

      console.log('Screen stream acquired:', videoStream)
      console.log('Audio stream acquired:', micStream)

      // Set the streams in state
      setScreenStream(videoStream)
      setAudioStream(micStream)
      setIsCapturing(true)
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        console.log('Permission denied by user.')
      } else {
        console.error('Error starting capture:', error)
      }
      // Clean up in case of partial success or error
      stopConversation()
    }
  }

  const stopConversation = () => {
    // Stop all tracks for the screen stream
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
    }
    // Stop all tracks for the audio stream
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop())
    }
    // Reset state
    setScreenStream(null)
    setAudioStream(null)
    setIsCapturing(false)
    console.log('Capture stopped.')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Gemini Live Conversation
        </h1>
        <p className="text-base text-gray-600 mb-6">
          {isCapturing
            ? 'Your screen and microphone are being captured.'
            : 'Click the button to start sharing for your conversation.'}
        </p>
        <div className="flex justify-center flex-wrap gap-4 mb-8">
          {!isCapturing ? (
            <button
              onClick={startConversation}
              className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              Start Conversation
            </button>
          ) : (
            <button
              onClick={stopConversation}
              className="px-6 py-2 rounded-full bg-red-600 text-white font-semibold shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
            >
              Stop Conversation
            </button>
          )}
        </div>
      </div>
      <video
        className="w-full max-w-3xl aspect-video rounded-lg border border-gray-300 bg-black shadow-lg"
        ref={videoRef}
        autoPlay
        playsInline
        muted // Mute the preview to prevent audio feedback
      ></video>
    </div>
  )
}

export default App
