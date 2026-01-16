import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const SpritePlayer = ({ 
  src, 
  frameWidth, 
  frameHeight, 
  frameCount, 
  fps = 10, 
  loop = true,          // Should it loop?
  onFinish = null,      // Function to call when animation ends
  scale = 1,
  onClick
}) => {
  const [frame, setFrame] = useState(0);

  // Reset frame to 0 whenever the "src" changes (new animation starts)
  useEffect(() => {
    setFrame(0);
  }, [src]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFrame((prevFrame) => {
        const nextFrame = prevFrame + 1;

        // Check if we reached the end
        if (nextFrame >= frameCount) {
          if (loop) {
            return 0; // Loop back to start
          } else {
            // STOP at the last frame
            if (onFinish) onFinish(); // Tell the parent we are done
            return frameCount - 1;    // Hold last frame
          }
        }
        return nextFrame;
      });
    }, 1000 / fps);

    return () => clearInterval(intervalId);
  }, [fps, frameCount, loop, onFinish, src]);

  const spriteStyle = {
    width: `${frameWidth}px`,
    height: `${frameHeight}px`,
    backgroundImage: `url(${src})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `-${frame * frameWidth}px 0px`,
    imageRendering: 'pixelated',
    transform: `scale(${scale})`,
    transformOrigin: 'center',
    cursor: 'pointer' 
  };

  return <div style={spriteStyle} onClick={onClick} />;
};



// Import your images here. 
// If using Create React App / Vite, standard imports work:
import idleImg from './assets/IdleCat.png';
import sleepImg from './assets/toSleep.png';
import wakeImg from './assets/wakeUp.png';

function App() {
  // States: 'IDLE', 'SLEEPING', 'WAKING'
  const [catState, setCatState] = useState('IDLE');
  
  // We use a ref for the timer so we can clear it easily
  const inactivityTimer = useRef(null);

  const resetTimer = () => {
    // 1. Clear existing timer
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    // 2. Only start the "Go to Sleep" timer if we are currently IDLE
    // (We don't want to interrupt the waking animation or if he is already asleep)
    if (catState === 'IDLE') {
      inactivityTimer.current = setTimeout(() => {
        setCatState('SLEEPING');
      }, 5000); // 5 seconds
    }
  };

  //mouse movement on the whole window
  useEffect(() => {
    window.addEventListener('mousemove', resetTimer);
    
    // Kickstart the timer on load
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [catState]); // Re-bind listener when state changes so logic stays fresh


  //animation on click wake up
  const handleCatClick = () => {
    // Only wake up if he is sleeping
    if (catState === 'SLEEPING') {
      setCatState('WAKING');
    }
  };

  //Animation waking to idle
  const handleAnimationFinish = () => {
    //waking goes to idle
    if (catState === 'WAKING') {
      setCatState('IDLE');
    }
  };

    // --- SPRITE CONFIG ---
    // Define the sprite sheet configurations
  const spriteConfig = {
    IDLE: {
      src: idleImg,
      frames: 11, 
      loop: true
    },
    SLEEPING: {
      src: sleepImg,
      frames: 4, 
      loop: false 
    },
    WAKING: {
      src: wakeImg,
      frames: 4, 
      loop: false 
    }
  };

  const currentConfig = spriteConfig[catState];

  return (
    <div className='root'>
    <div className="title">Sprite Player</div>
    <div className="instructions">
      <p>Instructions:</p>
      <p>• The cat will go to sleep after 5 seconds of inactivity (no mouse movement).</p>
      <p>• Click on the cat to wake it up!</p>
    </div>
    <div className="sprite" style={{ height: '100vh', display: 'flex', justifyContent: 'center' , alignItems: 'center'}}>
      
      <SpritePlayer
        key={catState}
        src={currentConfig.src}
        frameCount={currentConfig.frames}
        loop={currentConfig.loop}
        
        // Triggers when non-looping animations end (Wake -> Idle)
        onFinish={handleAnimationFinish} 
        onClick={handleCatClick}

        // Adjust these to match your actual PNG dimensions!
        frameWidth={32} 
        frameHeight={32}
        scale={8} // Making it big so you can see it
        fps={8}
      />

    </div>
    
    </div>
  );
}

export default App;