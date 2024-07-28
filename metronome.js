class Voice
{
    constructor(tempo = 120)
    {
        this.audioContext = null;
        this.notesInQueue = [];         // notes that have been put into the web audio and may or may not have been played yet {note, time}
        this.currentQuarterNote = 0;
        this.tempo = tempo * 3;
        this.lookahead = 25;          // How frequently to call scheduling function (in milliseconds)
        this.scheduleAheadTime = 0.1;   // How far ahead to schedule audio (sec)
        this.nextNoteTime = 0.0;     // when the next note is due
        this.isRunning = false;
        this.intervalID = null;
        this.beatsPerBar = 15; 
        this.botFloat = 5;
        this.topFloat = 3;
        this.osc3Volume = 0.5;
        //automation
        this.activeCycle = 0;
        this.currentLoop = 0;
        this.currentLoopMax = 2;
    }

    nextNote()
    {
        // Advance current note and time by a quarter note (crotchet if you're posh)
        let secondsPerBeat = 60.0 / this.tempo; // Notice this picks up the CURRENT tempo value to calculate beat length.
        this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time
    
        this.currentQuarterNote++;    // Advance the beat number, wrap to zero
        if (this.currentQuarterNote == this.beatsPerBar) {
            this.currentQuarterNote = 0;
        }
    }

    scheduleNote(beatNumber, time)
    {
        // push the note on the queue, even if we're not playing.
        this.notesInQueue.push({ note: beatNumber, time: time });
        
        // create 3 oscillators
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const osc3 = this.audioContext.createOscillator();
        const envelope1 = this.audioContext.createGain();
        const envelope2 = this.audioContext.createGain();
        const envelope3 = this.audioContext.createGain();
        const stereo1 = this.audioContext.createStereoPanner();
        const stereo2 = this.audioContext.createStereoPanner();
        const stereo3 = this.audioContext.createStereoPanner();
        
           //beatNumber is current subdivision(currentQuarterNote), beatsPerBar is number of subdivisions per ratio
           //this is because tempo is bpm * top num
           // if (beatNumber % this.beatsPerBar == 0) {
            if (beatNumber == 0 ) {
                //first sub 0 index
                this.automation();
                this.botFloat = botFloat;
                this.topFloat = topFloat;
                //if tempo change it happens here
                if (tempo.value > 19 && tempo.value < 399) {
                    this.tempo = tempo.value * this.topFloat;
                }
                //update subdivision 
                this.beatsPerBar = this.botFloat * this.topFloat;
                //osc1 is top number, osc 2 is bottom number, osc 3 is downbeat and subdivisions
                osc1.frequency.value = 1200;
                osc2.frequency.value = 800;
                osc3.frequency.value = 450;
                this.osc3Volume = 0.5
            } else if (beatNumber % this.topFloat == 0){
                osc1.frequency.value = 0;
                osc2.frequency.value = 800;
                let sub = playSub === true ? osc3.frequency.value = 1500 : osc3.frequency.value = 0;
                this.osc3Volume = 0.2;
            } else if (beatNumber % this.botFloat == 0) {
                osc1.frequency.value = 1200;
                osc2.frequency.value = 0;
                let sub = playSub === true ? osc3.frequency.value = 1500 : osc3.frequency.value = 0;
                this.osc3Volume = 0.2;
            } else {
                osc1.frequency.value = 0;
                osc2.frequency.value = 0;
                let sub = playSub === true ? osc3.frequency.value = 1500 : osc3.frequency.value = 0;
                this.osc3Volume = 0.2;
            }
            if (beatNumber === this.beatsPerBar - 1) {
                this.advance(); //automation
            }

            stereo1.pan.value = -1.0; 
            stereo2.pan.value = 1.0; 
            stereo3.pan.value = 0.0; 
            envelope1.gain.value = topVolume;
            envelope2.gain.value = botVolume;
            envelope3.gain.value = this.osc3Volume;
            envelope1.gain.exponentialRampToValueAtTime(topVolume, time + 0.001);
            envelope2.gain.exponentialRampToValueAtTime(botVolume, time + 0.001);
            envelope3.gain.exponentialRampToValueAtTime(this.osc3Volume, time + 0.001);
       
        
        envelope1.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        envelope2.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        envelope3.gain.exponentialRampToValueAtTime(0.001, time + 0.01);

        if (!topNumMute){
            osc1.connect(envelope1).connect(stereo1);
            stereo1.connect(this.audioContext.destination);
        }
        if (!botNumMute) {
            osc2.connect(envelope2).connect(stereo2);
            stereo2.connect(this.audioContext.destination);
        }
        osc3.connect(envelope3).connect(stereo3);
        stereo3.connect(this.audioContext.destination);
    
        osc1.start(time);
        osc1.stop(time + 0.05);
        osc2.start(time);
        osc2.stop(time + 0.05);
        osc3.start(time);
        osc3.stop(time + 0.05);
    
    }

    scheduler()
    {
        // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime ) {
            this.scheduleNote(this.currentQuarterNote, this.nextNoteTime);
            this.nextNote();
        }
    }

    start()
    {
        if (this.isRunning) return;

        if (this.audioContext == null)
        {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        this.isRunning = true;

        this.currentQuarterNote = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.05;

        this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
    }

    stop()
    {
        this.isRunning = false;

        clearInterval(this.intervalID);

        this.reset();
    }

    startStop()
    {
        if (this.isRunning) {
            this.stop();
        }
        else {
            this.start();
        }
    }

    automation() {
        if (!automation){ 
            document.getElementById("automation-status").style.visibility = "hidden";
            return; 
        } else {
            this.cycles();
            document.getElementById("automation-status").style.visibility = "visible";
            document.getElementById("status").innerHTML = `cycle: ${this.activeCycle} loop: ${this.currentLoop}/${this.currentLoopMax}`;
        }
    }

    advance() {
        if(automation) {
            if (this.currentLoopMax == this.currentLoop) {this.nextCycle()};
        } else {
            return;
        }
    }

    cycles() {
        if (this.activeCycle == 0) {
            this.activeCycle = 1;
        }
        this.checkMax();
        this.currentLoop++;
        this.update();
        
    }

    nextCycle() {
        
        switch(this.activeCycle) {
            case 0: 
                console.log('Error: nextCycle()');
                break;
            case 1: 
                let next1 = automation ? this.step() : this.reset();
                break;
            case 2: 
                let next2 = automation3 ? this.step() : this.reset();
                break;
            case 3: 
                let next3 = automation4 ? this.step() : this.reset();
                break;
            case 4: 
                console.log('case 4');
                let next4 = automation ? this.step() : this.reset();
                break;
            default: 
                console.log('nextCycle switch default error');
        }
    }

    step() {
        if (this.activeCycle == 4) {
            this.activeCycle = 1; 
            this.currentLoop = 0; 
        }  else {
            this.activeCycle++; 
            this.currentLoop = 0; 
        }
    }
    
    reset() {
        this.activeCycle = 0;
        this.currentLoop = 0;
    }
    
    backCheck() {
        let next = automation ? this.step() : this.reset();
    }

    checkMax() {
        if (!automation) {
            console.log('Error checkMax()');
            return;
        } else if (this.activeCycle == 0) {
            return; 
        } else {
            this.currentLoopMax = params['cycles'+this.activeCycle];
        }
    }
    update() {
        let a = this.activeCycle;
        topNumInput.value = topFloat = params['step'+a+'TopNum'];
        botNumInput.value = botFloat = params['step'+a+'BotNum'];
        playSubInput.checked = playSub = params['step'+a+'playSub'];
        topNumMuteInput.checked = topNumMute = params['step'+a+'TopNumMute']
        botNumMuteInput.checked = botNumMute = params['step'+a+'BotNumMute']
        inputMargin(topNumInput);
        inputMargin(botNumInput);
    }
   
}