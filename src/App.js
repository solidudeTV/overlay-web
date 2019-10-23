import React, { useRef } from 'react';
import { Stage } from '@inlet/react-pixi';
import LipSync from './LipSync';
import audioFile from './audio.mp3';

const App = (all) => {
  const audioRef = useRef(null);

  return (
    <div>
      <audio ref={audioRef}>
        <source src={audioFile} type="audio/mpeg"/>
      </audio>
      <Stage options={{ transparent: true }}>
        <LipSync audioRef={audioRef}/>
      </Stage>
    </div>
  );
};

export default App;
