import React from 'react';
import {
  useCall,
  useCallStateHooks,
  CallControls,
  SpeakerLayout,
  CallParticipantsList,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const VideoCallUI = () => {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Video Layout */}
      <div className="flex-1">
        <SpeakerLayout />
      </div>

      {/* Call Controls */}
      <div className="p-4 bg-gray-800">
        <CallControls />
      </div>

      {/* Participants */}
      <div className="text-white text-sm p-2">
        Participants: {participants.length}
      </div>
    </div>
  );
};

export default VideoCallUI;