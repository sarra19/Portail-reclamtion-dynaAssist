import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaSignOutAlt, FaVideo, FaVideoSlash } from 'react-icons/fa';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { motion } from 'framer-motion';
import Canvas from './Whiteboard';
import HeaderAuth from "components/Header/HeaderAuth";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import PresentationViewer from './PptViewer';
import { useHistory } from 'react-router-dom';
const VideoRoomPPT = () => {
    const [roomId, setRoomId] = useState('');
    const [peers, setPeers] = useState([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const socketRef = useRef();
    const userVideoRef = useRef();
    const peersRef = useRef([]);
    const streamRef = useRef();
    const isMountedRef = useRef(true); // Track mounted state
    const [backendResponse, setBackendResponse] = useState(null);
    const history = useHistory();

    const handleLeaveMeeting = () => {
        history.push('/chat'); // Redirection vers la page "chat"
    };
    useEffect(() => {
        isMountedRef.current = true;

        socketRef.current = io.connect('http://localhost:8800');

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                if (!isMountedRef.current) return;

                streamRef.current = stream;
                if (userVideoRef.current) {
                    userVideoRef.current.srcObject = stream;
                }

                socketRef.current.emit('join room', roomId);

                const handleAllUsers = (users) => {
                    if (!isMountedRef.current) return;

                    const newPeers = [];
                    users.forEach(userId => {
                        const peer = createPeer(userId, socketRef.current.id, stream);
                        peersRef.current.push({
                            peerID: userId,
                            peer,
                        });
                        newPeers.push(peer);
                    });
                    setPeers(newPeers);
                };

                const handleUserJoined = (payload) => {
                    if (!isMountedRef.current) return;

                    const peer = addPeer(payload.signal, payload.callerID, stream);
                    peersRef.current.push({
                        peerID: payload.callerID,
                        peer,
                    });
                    setPeers(prev => [...prev, peer]);
                };

                const handleSignalResponse = (payload) => {
                    if (!isMountedRef.current) return;

                    const item = peersRef.current.find(p => p.peerID === payload.id);
                    if (item) item.peer.signal(payload.signal);
                };

                socketRef.current.on('all users', handleAllUsers);
                socketRef.current.on('user joined', handleUserJoined);
                socketRef.current.on('receiving returned signal', handleSignalResponse);

                return () => {
                    socketRef.current.off('all users', handleAllUsers);
                    socketRef.current.off('user joined', handleUserJoined);
                    socketRef.current.off('receiving returned signal', handleSignalResponse);
                };
            })
            .catch(err => {
                console.error("Error accessing media devices:", err);
            });

        return () => {
            isMountedRef.current = false;

            // Stop all media tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            // Destroy peer connections
            peersRef.current.forEach(({ peer }) => {
                if (peer && peer.destroy) {
                    peer.destroy();
                }
            });
            peersRef.current = [];

            // Disconnect socket
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            setPeers([]);
        };
    }, [roomId]);

    const toggleMic = () => {
        if (!streamRef.current) return;
        const audioTracks = streamRef.current.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMicOn(prev => !prev);
    };

    const toggleCamera = () => {
        if (!streamRef.current) return;
        const videoTracks = streamRef.current.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsCameraOn(prev => !prev);
    };

    const createPeer = (userToSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('sending signal', { userToSignal, callerID, signal });
            }
        });

        peer.on('error', err => {
            console.error('Peer error:', err.message);
        });

        return peer;
    };

    const addPeer = (incomingSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            if (socketRef.current?.connected) {
                socketRef.current.emit('returning signal', { signal, callerID });
            }
        });

        peer.on('error', err => {
            console.error('Peer error:', err.message);
        });

        peer.signal(incomingSignal);
        return peer;
    };

    const handleRoomCreate = () => {
        const newRoomId = Math.random().toString(36).substring(7);
        setRoomId(newRoomId);
    };

    const handleRoomJoin = (e) => {
        e.preventDefault();
    };


    return (
        <div className="flex flex-col min-h-screen bg-orangelight-dys2">
            <HeaderAuth />
            <IndexNavbar />

            <div className="min-h-screen bg-gradient-to-r from-orange-dys via-blueGray-800 to-orange-dys text-white flex flex-col items-center justify-center p-4 md:p-8">
                {!roomId ? (
                    <motion.div
                        className="w-50 max-w-md bg-white text-blueGray-800 rounded-xl shadow-xl p-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h2 className="text-3xl font-bold text-center mb-8 text-blueGray-800">
                            Créer ou rejoindre une Salle de réunion
                        </h2>
                        <div className="flex flex-col gap-6">
                            <button
                                onClick={handleRoomCreate}
                                className="w-full bg-orange-dys text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:bg-orange-dys-2 transition-all duration-300"
                            >
                                Créer une nouvelle salle
                            </button>
                            <div className="relative flex items-center my-4">
                                <div className="flex-grow border-t border-blueGray-300"></div>
                                <span className="flex-shrink mx-4 text-blueGray-500">or</span>
                                <div className="flex-grow border-t border-blueGray-300"></div>
                            </div>
                            <form onSubmit={handleRoomJoin} className="flex flex-col gap-6">
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value)}
                                        placeholder="Entrez l'Id de la salle"
                                        className="w-full p-4 border border-blueGray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-dys focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blueGray-800 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:bg-blueGray-700 transition-all duration-300"
                                >
                                    Rejoindre une salle existante
                                </button>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="w-full max-w-6xl bg-white text-blueGray-800 rounded-xl shadow-2xl overflow-hidden"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-blueGray-800 text-white p-4 md:p-6">
                            <h2 className="text-xl md:text-2xl font-semibold text-center">
                                Salle ID: <span className="text-orange-dys font-mono">{roomId}</span>
                            </h2>
                        </div>

                        <div className="p-4 md:p-6">
                            {/* Video container with flex row layout */}
                            <div className="flex flex-row  gap-4 mb-6 h-64">
                                {/* Your video */}
                                <div className="flex-1 relative bg-blueGray-100 rounded-lg overflow-hidden shadow-md">
                                    <video
                                        playsInline
                                        muted
                                        ref={userVideoRef}
                                        autoPlay
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-orange-dys text-white px-2 py-1 rounded text-sm font-medium">
                                        You
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-blueGray-800 bg-opacity-80 text-white px-2 py-1 rounded text-xs">
                                        {isMicOn ? "Mic: On" : "Mic: Off"} | {isCameraOn ? "Camera: On" : "Camera: Off"}
                                    </div>
                                </div>

                                {/* Participant video or waiting message */}
                                {peers.length > 0 ? (
                                    peers.map((peer, index) => (
                                        <div key={index} className="flex-1 relative bg-blueGray-100 rounded-lg overflow-hidden shadow-md">
                                            <video
                                                playsInline
                                                autoPlay
                                                ref={ref => {
                                                    if (ref) {
                                                        peer.on('stream', stream => {
                                                            ref.srcObject = stream;
                                                        });
                                                    }
                                                }}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 left-2 bg-blueGray-800 text-white px-2 py-1 rounded text-sm font-medium">
                                                Participant {index + 1}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex-1 flex items-center justify-center bg-blueGray-100 rounded-lg shadow-inner">
                                        <div className="text-center p-4">
                                            <div className="text-blueGray-400 mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-blueGray-500">En attente des participants...</p>
                                            <p className="text-blueGray-400 text-sm mt-1">Partagez l'Id de la salle pour inviter d'autres personnes</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex flex-wrap justify-center gap-4 mt-6">
                                <button
                                    onClick={toggleMic}
                                    className={`flex items-center  mr-2 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 ${isMicOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                        } text-white`}
                                >
                                    {isMicOn ? (
                                        <FaMicrophone className="mr-2" />
                                    ) : (
                                        <FaMicrophoneSlash className="mr-2" />
                                    )}
                                    {isMicOn ? "Mute" : "Unmute"}
                                </button>
                                <button
                                    onClick={toggleCamera}
                                    className={`flex items-center px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 ${isCameraOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                        } text-white`}
                                >
                                    {isCameraOn ? (
                                        <FaVideo className="mr-2" />
                                    ) : (
                                        <FaVideoSlash className="mr-2" />
                                    )}
                                    {isCameraOn ? "Fermer Caméra" : "Ouvrir Caméra"}
                                </button>

                                <button
                                    onClick={handleLeaveMeeting}
                                    className="flex items-center px-6 py-3 bg-red-500 ml-2 text-white rounded-lg font-medium shadow-md hover:bg-gray-900 transition-all duration-300"
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Quitter la réunion
                                </button>
                            </div>

                            {/* Presentation Viewer */}
                            <div className="mt-8 bg-blueGray-50 rounded-xl shadow-lg overflow-hidden">
                                <div className="p-2 bg-blueGray-800 text-white px-5 py-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-dys" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="font-semibold">Visionneuse de présentation</h3>
                                </div>
                                <div className="p-4 min-h-[400px]">
                                    <PresentationViewer roomId={roomId} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default VideoRoomPPT;