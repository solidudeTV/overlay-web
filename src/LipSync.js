import React, { useState, useEffect, useRef } from 'react';
import { Text, Container, Sprite, Graphics, useTick } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import TweenMax, { TimelineMax, Back } from "gsap/TweenMax";
import PixiPlugin from "gsap/PixiPlugin";

import audioInfo from './audio.json';
import image from './nomouth.png';

PixiPlugin.registerPIXI(PIXI);

let fullText = audioInfo.text || 'oops';
const lipSpeedMod = 1.25;
let animPhase;

const LipSync = ({audioRef}) => {
  const faceRef = useRef(null);
  const textBubbleRef = useRef(null);

  function tweenFace(reverse) {
    let [start, end] = [{
      x: -64,
      rotation: -180,
    }, {
      x: 64,
      rotation: 0,
    }];

    if (reverse) {
      ([start, end] = [end, start]);
    }

    const newTween = TweenMax.fromTo(
      faceRef.current,
      1,
      { pixi: start },
      {
        pixi: end,
        ease: Back.easeInOut,
        onComplete() {
          console.error(`animPhase: ${animPhase}`);
          if (animPhase === 'in') {
            animPhase = 'speak';
            audioRef.current.play();

            TweenMax.fromTo(
              textBubbleRef.current,
              1,
              {
                pixi: { alpha: 0 },
              },
              {
                pixi: { alpha: 1 },
              }
            );
          } else if (animPhase === 'out') {
            animPhase = 'done';
            const t1 = new TimelineMax({delay: 2});
            t1.add(TweenMax.to(
              textBubbleRef.current,
              1,
              {
                pixi: { autoAlpha: 0 },
              }
            ));
            t1.play();
          }
        },
      }
    );

    return newTween;
  }

  const [volume, setVolume] = useState(0);
  const [revealedText, setRevealedText] = useState('');

  useTick(delta => {
    const audio = audioRef.current;

    if (animPhase === 'speak') {
      if (audio.paused) {
        animPhase = 'out';
        tweenFace(true);
      } else {
        const sampleIdx = Math.floor(audio.currentTime * audioInfo.samplesPerSecond);
        setVolume(audioInfo.samples[sampleIdx]);

        const roughCompletion = audio.currentTime / audio.duration * lipSpeedMod;
        setRevealedText(fullText.substr(0, Math.floor(fullText.length * roughCompletion)));
      }
    }
  });

  useEffect(() => {
    tweenFace();
    animPhase = 'in';
  }, [audioRef]);

  return (
      <Container y={100} >
      <Container
    pivot={{x:64, y:64}}
    y={300}
    ref={faceRef}>
          <Sprite
            image={image}
            x={0}
            y={0} >
          <Graphics
            draw={g => {
              g.clear();
              g.lineStyle(0);
              g.beginFill(0x101010, 1);
              g.drawEllipse(61, 90, 20, (volume * 20) || 1);
              g.endFill();
            }} />
      </Sprite>
        </Container>
      <Container alpha={0} ref={textBubbleRef}>
        <Graphics
          draw={g => {
            g.clear();
            g.lineStyle(0);
            g.beginFill(0xEEEEEE, 1);
            g.drawRoundedRect(150, 50, 500, 300, 15);
            g.endFill();
          }}
            />
        <Text
          text={revealedText}
          anchor={0}
          x={150}
          y={50}
          style={
            new PIXI.TextStyle({
              align: 'left',
              fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
              fontSize: 50,
              fontWeight: 400,
              wordWrap: true,
              wordWrapWidth: 500,
              fill: '#000000',
            })
          } />
      </Container>
      </Container>
  );
};

export default LipSync;
