import { useEffect } from 'react';
import './keyboard.scss';

interface KeyboardProps {
    startingOctave?: number;
    numOctaves?: number;
    onKeyPressed?: (octave: number, note: string) => void;
}

export const Keyboard = ({
    startingOctave = 1,
    numOctaves = 1,
    onKeyPressed = () => {}
  }: KeyboardProps) => {
    const KEY_MAP: Record<string, string> = {
        a: 'c',
        w: 'cSharp',
        s: 'd',
        e: 'dSharp',
        d: 'e',
        f: 'f',
        t: 'fSharp',
        g: 'g',
        y: 'gSharp',
        h: 'a',
        u: 'aSharp',
        j: 'b',
        k: 'c',
        o: 'cSharp',
        l: 'd',
        p: 'dSharp',
    };
    const keyboardOctaves = [];
    const renderKeyboardOctave = (octave: number) => {
        return (
            <div key={octave} className='keyboard__octave'>
                <button id={`c${octave}`} onClick={() => onKeyPressed(octave, 'c')}></button>
                <button id={`cSharp${octave}`} onClick={() => onKeyPressed(octave, 'cSharp')}></button>
                <button id={`d${octave}`} onClick={() => onKeyPressed(octave, 'd')}></button>
                <button id={`dSharp${octave}`} onClick={() => onKeyPressed(octave, 'dSharp')}></button>
                <button id={`e${octave}`} onClick={() => onKeyPressed(octave, 'e')}></button>
                <button id={`f${octave}`} onClick={() => onKeyPressed(octave, 'f')}></button>
                <button id={`fSharp${octave}`} onClick={() => onKeyPressed(octave, 'fSharp')}></button>
                <button id={`g${octave}`} onClick={() => onKeyPressed(octave, 'g')}></button>
                <button id={`gSharp${octave}`} onClick={() => onKeyPressed(octave, 'gSharp')}></button>
                <button id={`a${octave}`} onClick={() => onKeyPressed(octave, 'a')}></button>
                <button id={`aSharp${octave}`} onClick={() => onKeyPressed(octave, 'aSharp')}></button>
                <button id={`b${octave}`} onClick={() => onKeyPressed(octave, 'b')}></button>
            </div>
        );
    };
    const triggerKeyPressActiveState = (key: string, octave: number) => {
        const keyElement = document.getElementById(`${KEY_MAP[key]}${octave}`);

        if (keyElement) {
          keyElement.classList.add('active');
          setTimeout(() => {
            keyElement.classList.remove('active');
          }, 100);
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', ({ key }) => {
            if (KEY_MAP[key]) {
                let octave = startingOctave;
                if ('kolp'.indexOf(key) !== -1) octave += 1;
                onKeyPressed(octave, KEY_MAP[key])
                triggerKeyPressActiveState(key, octave);
            }
        });
    }, []);

    for (let i = 0; i < numOctaves; i++) {
        keyboardOctaves.push(renderKeyboardOctave(i + startingOctave));
    }

    return (
        <div className="keyboard__container">
            {keyboardOctaves}
        </div>
    );
};
