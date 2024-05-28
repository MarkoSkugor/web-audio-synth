import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Draggable from "gsap/Draggable";

import './switch.scss';

gsap.registerPlugin(Draggable);

interface SwitchProps {
    label: string;
    initialValue: boolean;
}

export const Switch = ({
    label,
    initialValue
}: SwitchProps) => {
    const [value, setValue] = useState(initialValue);
    const switchRef = useRef<HTMLDivElement>(null);
    const switchThumbRef = useRef<HTMLDivElement>(null);
    let draggableInstance: globalThis.Draggable;
    const calculateValue = () => {
        setValue((draggableInstance.x / (draggableInstance.minX + draggableInstance.maxX)) > 0.5);
    };

    useEffect(() => {
        Draggable.create(switchThumbRef.current, {
            type: 'x',
            // throwProps: true,
            throwProps: false,
            bounds: switchRef.current,
            onDrag: calculateValue,
          });
        draggableInstance = Draggable.get(switchThumbRef.current);
    }, []);

    return (
        <div className='switch__container'>
            <span className='switch__label'>
                {label}
            </span>
            <div
                ref={switchRef}
                className={`switch switch--${value ? 'active' : 'inactive'}`}
            >
                <div ref={switchThumbRef} className='switch__thumb'></div>
            </div>
        </div>
    );
}