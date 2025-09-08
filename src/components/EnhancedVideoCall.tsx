import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/utils/i18n';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, MessageCircle, Share, Settings } from 'lucide-react';

interface EnhancedVideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  participant?: {
    id: string;
    name: string;
    avatar?: string;
  };
  isDoctor?: boolean;
}

export const EnhancedVideoCall: React.FC<EnhancedVideoCallProps> = ({ 
  isOpen, 
  onClose, 
  participant,
  isDoctor = false 
}) => {
  const { toast } = useToast();
  const { currentUser, language } = useApp();
  const { t } = useTranslation(language);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; message: string; time: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      if (isDoctor) {
        // Doctor initiates the call
        initiateCall();
      } else {
        // Patient receives notification and auto-connects
        handleIncomingCall();
      }
    }

    return () => {
      cleanupCall();
    };
  }, [isOpen]);

  const initiateCall = async () => {
    setIsConnecting(true);
    
    try {
      // Request media permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Send notification to patient
      if (participant && !isDoctor) {
        toast({
          title: t('doctor_calling'),
          description: `${currentUser?.name} ${t('inviting_video_call')}`,
          duration: 5000,
        });
      }

      // Simulate WebRTC connection
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
        startCallTimer();
        
        // Simulate remote video stream
        if (remoteVideoRef.current) {
          // In real implementation, this would be the remote stream
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');
          
          // Create mock video feed
          const drawFrame = () => {
            if (ctx) {
              ctx.fillStyle = '#1a1a2e';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#16213e';
              ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
              ctx.fillStyle = '#ffffff';
              ctx.font = '20px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(participant?.name || 'Remote User', canvas.width / 2, canvas.height / 2);
            }
            
            if (isConnected) {
              requestAnimationFrame(drawFrame);
            }
          };
          
          drawFrame();
          const stream = canvas.captureStream(30);
          remoteVideoRef.current.srcObject = stream;
        }

        toast({
          title: t('call_connected'),
          description: t('video_call_started'),
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: t('call_failed'),
        description: t('camera_microphone_access_denied'),
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const handleIncomingCall = async () => {
    // Auto-accept incoming call from doctor
    toast({
      title: t('incoming_call'),
      description: `${participant?.name} ${t('inviting_video_call')}`,
    });
    
    setTimeout(() => {
      initiateCall();
    }, 1000);
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const cleanupCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setCallDuration(0);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    cleanupCall();
    toast({
      title: t('call_ended'),
      description: t('call_duration_was') + ' ' + formatDuration(callDuration),
    });
    onClose();
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        sender: currentUser?.name || 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-lg">{participant?.avatar || '👤'}</span>
              </div>
              <div>
                <h3 className="font-semibold">{participant?.name || 'Unknown'}</h3>
                <p className="text-sm text-gray-300">
                  {isConnecting ? t('connecting') : isConnected ? `${t('connected')} • ${formatDuration(callDuration)}` : t('disconnected')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowChat(!showChat)}
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex">
            {/* Video Area */}
            <div className="flex-1 relative bg-gray-900 min-h-[400px]">
              {/* Remote Video (Main) */}
              <div className="w-full h-full relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {!isConnected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-gray-300">{t('connecting_to_call')}</p>
                        </>
                      ) : (
                        <>
                          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-300">{t('waiting_for_connection')}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  size="sm"
                  variant={isVideoEnabled ? "secondary" : "destructive"}
                  onClick={toggleVideo}
                  className="rounded-full w-12 h-12"
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                
                <Button
                  size="sm"
                  variant={isAudioEnabled ? "secondary" : "destructive"}
                  onClick={toggleAudio}
                  className="rounded-full w-12 h-12"
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={endCall}
                  className="rounded-full w-12 h-12"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Chat Sidebar */}
            {showChat && (
              <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                <div className="p-3 border-b border-gray-700">
                  <h4 className="font-semibold">{t('chat')}</h4>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center">{t('no_messages_yet')}</p>
                  ) : (
                    messages.map((msg, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-primary">{msg.sender}</span>
                          <span className="text-xs text-gray-400">{msg.time}</span>
                        </div>
                        <p className="text-sm bg-gray-700 rounded p-2">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={t('type_message')}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400"
                    />
                    <Button size="sm" onClick={sendMessage}>
                      {t('send')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};