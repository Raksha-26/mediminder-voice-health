import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/utils/i18n';
import { useToast } from '@/hooks/use-toast';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, MessageCircle } from 'lucide-react';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  participant?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export const VideoCall: React.FC<VideoCallProps> = ({ isOpen, onClose, participant }) => {
  const { t } = useTranslation('en');
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (isOpen && !isConnected) {
      startCall();
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate connection delay
      setTimeout(() => {
        setIsConnected(true);
        toast({
          title: t('video_call_started'),
          description: `Connected with ${participant?.name}`,
        });
      }, 2000);

    } catch (error) {
      toast({
        title: "Camera Access Error",
        description: "Please allow camera and microphone access to start the call",
        variant: "destructive"
      });
    }
  };

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsConnected(false);
    setCallDuration(0);
    toast({
      title: t('call_ended'),
      description: "Call ended successfully",
    });
    onClose();
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        
        // Listen for screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && streamRef.current) {
            localVideoRef.current.srcObject = streamRef.current;
          }
        };
      } else {
        if (localVideoRef.current && streamRef.current) {
          localVideoRef.current.srcObject = streamRef.current;
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      toast({
        title: "Screen Share Error",
        description: "Could not start screen sharing",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="relative bg-black rounded-lg overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">{participant?.avatar || '👤'}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{participant?.name || 'Video Call'}</h3>
                  <p className="text-sm text-white/80">
                    {!isConnected ? t('joining_call') : formatDuration(callDuration)}
                  </p>
                </div>
              </div>
              
              {isConnected && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Connected</span>
                </div>
              )}
            </div>
          </div>

          {/* Video Area */}
          <div className="relative h-96">
            {/* Remote Video (Main) */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Remote Video Placeholder */}
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{participant?.avatar || '👤'}</span>
                  </div>
                  <p className="text-lg font-semibold">{participant?.name}</p>
                  <p className="text-sm text-white/60">{t('joining_call')}</p>
                </div>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <VideoOff className="w-6 h-6 text-white/60" />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isAudioOn ? "secondary" : "destructive"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={toggleAudio}
              >
                {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>

              <Button
                variant={isVideoOn ? "secondary" : "destructive"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>

              <Button
                variant={isScreenSharing ? "default" : "secondary"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={toggleScreenShare}
              >
                <Monitor className="w-6 h-6" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-14 h-14"
              >
                <MessageCircle className="w-6 h-6" />
              </Button>

              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={endCall}
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};