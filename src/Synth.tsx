import { useEffect, useState } from 'react';
import './synth.scss';

import { SynthEngine } from './SynthEngine';
import { Button } from './stories/Button';
import { Knob } from './stories/Knob';
import { Keyboard } from './stories/Keyboard';

const generateOctave: (a: number) => Record<string, number> = (a: number) => {
    return {
        b: a *  Math.pow(2, 2/12),
        aSharp: a *  Math.pow(2, 1/12),
        a: a,
        gSharp: a *  Math.pow(2, -1/12),
        g: a *  Math.pow(2, -2/12),
        fSharp: a *  Math.pow(2, -3/12),
        f: a *  Math.pow(2, -4/12),
        e: a *  Math.pow(2, -5/12),
        dSharp: a *  Math.pow(2, -6/12),
        d: a *  Math.pow(2, -7/12),
        cSharp: a *  Math.pow(2, -8/12),
        c: a *  Math.pow(2, -9/12),
    }
};

export const Synth = () => {
    const initializeScale = () => {
        const A4 = 440;
        const newScale = [];

        for (let i = -4; i < 6; i++) {
          const a = A4 * Math.pow(2, i);
          const octave = generateOctave(a);
          newScale.push(octave);
        }

        return newScale;
    };
    const [started, setStarted] = useState(false);
    const [waveForm, setWaveForm] = useState<OscillatorType>('square');
    const [startingOctave, setStartingOctave] = useState(3);
    const [isKeyboardView, setIsKeyboardView] = useState(false);
    const [scale] = useState<Record<string, number>[]>(initializeScale());
    const [synthEngine, setSynthEngine] = useState<SynthEngine>();

    useEffect(() => {
        synthEngine?.setWaveForm(waveForm);
    }, [waveForm]);

    const start = () => {
        const engine = new SynthEngine();
        engine.setWaveForm(waveForm);
        setSynthEngine(engine);
        setStarted(true);
    };

    const onKeyPressed = (octave: number, note: string) => {
        synthEngine?.playTone(scale[octave][note]);
    };

    if (!started) {
        return (
            <Button onClick={start}>Click To Begin</Button>
        );
    }

    return (
        <div className='synth'>
            <div className='section section__keyboard-visibility'>
            <span className='section__label'>View</span>
            <Button
                disabled={!isKeyboardView}
                onClick={() => setIsKeyboardView(false)}
            >
                Controls
            </Button>
            <Button
                disabled={isKeyboardView === true}
                onClick={() => setIsKeyboardView(true)}
            >
                Keyboard
            </Button>
            </div>
        <div className='synth__container'>
          <div className={`flex justify-center ${isKeyboardView ? 'hidden' : ''}`}>
            <div className='synth__controls'>
              <div className='flex justify-center'>
                <div className='section section__octave-buttons'>
                  <span className='section__label'>Octave</span>
                  <Button
                    disabled={startingOctave === 7}
                    onClick={() => setStartingOctave(startingOctave + 1)}
                    aria-label='up'
                  >
                    &#9651;
                  </Button>
                  <Button
                    disabled={startingOctave === 0}
                    onClick={() => setStartingOctave(startingOctave - 1)}
                    aria-label='down'
                  >
                    &#9661;
                  </Button>
                </div>
                <div className='section'>
                  <span className='section__label'>Master</span>
                  <Knob
                    label='Level'
                    precision={2}
                    initialValue={1}
                    minValue={0}
                    maxValue={1}
                    valueChanged={(value) => synthEngine?.setLevel(value)}
                  ></Knob>
                  <Knob
                    label='Reverb'
                    precision={2}
                    initialValue={.25}
                    minValue={0}
                    maxValue={1}
                    valueChanged={(value) => synthEngine?.setReverb(value)}
                  ></Knob>
                </div>
                <div className='section'>
                  <span className='section__label'>Amp Envelope</span>
                  <Knob
                    label='Attack'
                    units='s'
                    precision={2}
                    initialValue={0.1}
                    minValue={0.01}
                    maxValue={10}
                    valueChanged={(value) => synthEngine?.setAmpAttack(value)}
                  ></Knob>
                  <Knob
                    label='Release'
                    units='s'
                    precision={2}
                    initialValue={1.5}
                    minValue={0.1}
                    maxValue={10}
                    valueChanged={(value) => synthEngine?.setAmpRelease(value)}
                  ></Knob>
                </div>
              </div>
              <div className='flex justify-center'>
                <div className='section'>
                  <span className='section__label'>Filter Envelope</span>
                  <Knob
                    label='Attack'
                    units='s'
                    precision={2}
                    initialValue={0.1}
                    minValue={0.01}
                    maxValue={10}
                    valueChanged={(value) => synthEngine?.setFilterAttack(value)}
                  ></Knob>
                  <Knob
                    label='Release'
                    units='s'
                    precision={2}
                    initialValue={.5}
                    minValue={0.01}
                    maxValue={10}
                    valueChanged={(value) => synthEngine?.setFilterRelease(value)}
                  ></Knob>
                </div>
                <div className='section'>
                  <span className='section__label'>Filter</span>
                  <Knob
                    label='Cutoff'
                    units='Hz'
                    precision={0}
                    initialValue={350}
                    minValue={20}
                    maxValue={15000}
                    valueChanged={(value) => synthEngine?.setFilterCutoff(value)}
                  ></Knob>
                  <Knob
                    label='Resonance'
                    precision={2}
                    initialValue={0}
                    minValue={0}
                    maxValue={10}
                    valueChanged={(value) => synthEngine?.setFilterResonance(value)}
                  ></Knob>
                  <Knob
                    label='Envelope'
                    precision={2}
                    initialValue={.25}
                    minValue={0}
                    maxValue={1}
                    valueChanged={(value) => synthEngine?.setFilterEnvelope(value)}
                  ></Knob>
                </div>
              </div>
            </div>
            <div className='section'>
              <span className='section__label'>Waveform</span>
              <Button
                disabled={waveForm === 'sine'}
                onClick={() => setWaveForm('sine')}
              >
                Sine
              </Button>
              <Button
                disabled={waveForm === 'square'}
                onClick={() => setWaveForm('square')}
              >
                Square
              </Button>
              <Button
                disabled={waveForm === 'triangle'}
                onClick={() => setWaveForm('triangle')}
              >
                Triangle
              </Button>
              <Button
                disabled={waveForm === 'sawtooth'}
                onClick={() => setWaveForm('sawtooth')}
              >
                Sawtooth
              </Button>
            </div>
          </div>
          <div className={`synth__keyboard ${isKeyboardView ? '' : 'hidden'}`}>
            <Keyboard
              numOctaves={2}
              startingOctave={startingOctave}
              onKeyPressed={onKeyPressed}
            >
            </Keyboard>
          </div>
        </div>
      </div>
    );
}
