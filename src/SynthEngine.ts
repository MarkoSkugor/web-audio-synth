class SynthEngine {
    settings = {
      master: {
        level: 1,
      },
      oscillator: {
        waveForm: 'square',
      },
      amp: {
        attack: 0.1,
        release: 1.5,
      },
      filter: {
        cutoff: 350,
        resonance: 0,
        envelope: .25,
        attack: 0.1,
        release: .5,
      },
      reverb: {
        level: .25,
      },
    };
    audioContext!: AudioContext;
    oscillatorNode!: OscillatorNode;
    filterNode1!: BiquadFilterNode;
    filterNode2!: BiquadFilterNode;
    reverbNode!: ConvolverNode;
    reverbDryGain!: GainNode;
    reverbWetGain!: GainNode;
    volumeNode!: GainNode;
    compressorNode!: DynamicsCompressorNode;

    constructor() {
      this.initializeAudioContext();
      this.initializeOscillatorNode();
      this.initializeFilterNode();
      this.initializeGainNode();
      this.initializeReverb();
      this.initializeCompressor();

      // connect nodes
      this.oscillatorNode.connect(this.filterNode1);
      this.filterNode1.connect(this.filterNode2);
      this.filterNode2.connect(this.reverbNode);
      this.filterNode2.connect(this.reverbDryGain);
      this.reverbNode.connect(this.reverbWetGain);
      this.reverbWetGain.connect(this.volumeNode);
      this.reverbDryGain.connect(this.volumeNode);
      this.volumeNode.connect(this.compressorNode);
      this.compressorNode.connect(this.audioContext.destination);
      // start oscillator
      this.oscillatorNode.start();
    }

    setLevel(value: number) {
      this.settings.master.level = value;
    }

    setReverb(value: number) {
      this.settings.reverb.level = value;

      // equal-power crossfade
      const drySignalGain = Math.cos(value * 0.5 * Math.PI);
      const wetSignalGain = Math.cos((1.0 - value) * 0.5 * Math.PI);

      this.reverbDryGain.gain.value = drySignalGain;
      this.reverbWetGain.gain.value = wetSignalGain;
    }

    setAmpAttack(value: number) {
      this.settings.amp.attack = value + .01;
    }

    setAmpRelease(value: number) {
      this.settings.amp.release = value;
    }

    setFilterCutoff(value: number) {
      this.settings.filter.cutoff = value;
    }

    setFilterResonance(value: number) {
      this.settings.filter.resonance = value;
    }

    setFilterEnvelope(value: number) {
      this.settings.filter.envelope = value;
    }

    setFilterAttack(value: number) {
      this.settings.filter.attack = value;
    }

    setFilterRelease(value: number) {
      this.settings.filter.release = value;
    }

    setWaveForm(waveForm: OscillatorType) {
      this.settings.oscillator.waveForm = waveForm;
      this.oscillatorNode.type = waveForm;
    }

    initializeAudioContext() {
      // create web audio api context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.audioContext = new (window.AudioContext || (window as any)["webkitAudioContext"])();
    }

    initializeOscillatorNode() {
      // create Oscillator node
      this.oscillatorNode = this.audioContext.createOscillator();
      // set custom wave type
      this.oscillatorNode.type = this.settings.oscillator.waveForm as OscillatorType;
      // set frequency value in hertz
      this.oscillatorNode.frequency.value = 440;
    }

    initializeGainNode() {
      // create Gain node
      this.volumeNode = this.audioContext.createGain();
      // set gain to 0 (no output)
      this.volumeNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    }

    initializeFilterNode() {
      this.filterNode1 = this.audioContext.createBiquadFilter();
      this.filterNode2 = this.audioContext.createBiquadFilter();
      this.filterNode1.type = 'lowpass';
      this.filterNode2.type = 'lowpass';
    }

    initializeReverb() {
      this.reverbNode = this.audioContext.createConvolver();
      this.reverbWetGain = this.audioContext.createGain();
      this.reverbDryGain = this.audioContext.createGain();

      const irRoomRequest = new XMLHttpRequest();

      // get sound of room we want to emulate
      irRoomRequest.open("GET", "/reverb-impulse-1.wav", true);
      irRoomRequest.responseType = "arraybuffer";
      irRoomRequest.onload = () => {
        this.audioContext.decodeAudioData(
          irRoomRequest.response,
          (buffer) => {
            this.reverbNode.buffer = buffer;
          },
        );
      }
      irRoomRequest.send();

      this.setReverb(this.settings.reverb.level);
    }

    initializeCompressor() {
      this.compressorNode = this.audioContext.createDynamicsCompressor();
    }

    triggerFilterEnvelope() {
      const now = this.audioContext.currentTime;

      this.filterNode1.frequency.cancelScheduledValues(now);
      this.filterNode2.frequency.cancelScheduledValues(now);
      this.filterNode1.frequency.setValueAtTime(this.filterNode1.frequency.value, now);
      this.filterNode2.frequency.setValueAtTime(this.filterNode2.frequency.value, now);
      this.filterNode1.Q.value = this.settings.filter.resonance;
      this.filterNode2.Q.value = this.settings.filter.resonance;
      this.filterNode1.frequency.linearRampToValueAtTime(
        this.settings.filter.cutoff + ((15000 - this.settings.filter.cutoff) * this.settings.filter.envelope),
        now + this.settings.filter.attack,
      );
      this.filterNode2.frequency.linearRampToValueAtTime(
        this.settings.filter.cutoff + ((15000 - this.settings.filter.cutoff) * this.settings.filter.envelope),
        now + this.settings.filter.attack,
      );
      this.filterNode1.frequency.setTargetAtTime(
        this.settings.filter.cutoff,
        now + this.settings.filter.attack,
        this.settings.filter.release / 10,
      );
      this.filterNode2.frequency.setTargetAtTime(
        this.settings.filter.cutoff,
        now + this.settings.filter.attack,
        this.settings.filter.release / 10,
      );
      this.filterNode1.frequency.setValueAtTime(this.settings.filter.cutoff, now + this.settings.filter.attack + this.settings.filter.release);
      this.filterNode2.frequency.setValueAtTime(this.settings.filter.cutoff, now + this.settings.filter.attack + this.settings.filter.release);
    }

    triggerAmpEnvelope() {
      const now = this.audioContext.currentTime;

      this.volumeNode.gain.cancelScheduledValues(now);
      this.volumeNode.gain.setValueAtTime(this.volumeNode.gain.value, now);
      this.volumeNode.gain.linearRampToValueAtTime(
        this.settings.master.level,
        now + this.settings.amp.attack,
      );
      this.volumeNode.gain.setTargetAtTime(
        0.0,
        now + this.settings.amp.attack,
        this.settings.amp.release / 10,
      );
      this.volumeNode.gain.setValueAtTime(0, now + this.settings.amp.attack + this.settings.amp.release);
    }

    playTone(frequency: number) {
      this.oscillatorNode.frequency.value = frequency;

      this.triggerFilterEnvelope();
      this.triggerAmpEnvelope();
    }
  }

  export { SynthEngine };
