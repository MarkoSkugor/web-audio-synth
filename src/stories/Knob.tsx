import { useEffect, useRef, useState } from 'react';
import { gsap } from "gsap";
import Draggable from "gsap/Draggable";

import './knob.scss';

gsap.registerPlugin(Draggable);

interface KnobProps {
    label: string;
    units?: string;
    precision: number;
    initialValue: number;
    minValue: number;
    maxValue: number;
    valueChanged?: (value: number) => void;
}

export const Knob = ({
    label,
    units,
    precision,
    initialValue,
    minValue,
    maxValue,
    valueChanged = () => {}
  }: KnobProps) => {
    const [value, setValue] = useState(initialValue.toFixed(precision));
    const knobRef = useRef<HTMLDivElement>(null);
    const range = Math.abs(minValue - maxValue)
    let draggableInstance: globalThis.Draggable;

    useEffect(() => {
        gsap.set(knobRef.current, {
            rotation: calculateRotation()
          });

          Draggable.create(knobRef.current, {
            type: 'rotation',
            throwProps: false,
            edgeResistance: 0.85,
            onDrag: calculateValue,
            bounds: {
              minRotation: -150,
              maxRotation: 150
            }
          });
          draggableInstance = Draggable.get(knobRef.current);
    }, []);

    const calculateValue = () => {
        let rotation = draggableInstance.rotation / 300 + .5;

        if (rotation <= 0) {
            rotation = 0;
        }

        if (rotation >= 1) {
            rotation = 1;
        }

        const newValue = ((rotation * range) + minValue).toFixed(precision);

        setValue(newValue);

        if (valueChanged) {
          valueChanged(parseFloat(newValue));
        }
      }

    const calculateRotation = () => {
        const rotation = ((parseFloat(value) - minValue)/range - .5) * 300;

        return rotation;
    }

    return (
        <div className='knob__container'>
            <span className='knob__label'>
                {label}
            </span>
            <div ref={knobRef} className='knob'></div>
            <span className='knob__value'>
                {value}{units}
            </span>
        </div>
    );
};
