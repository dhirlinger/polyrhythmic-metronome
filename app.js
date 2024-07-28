//PolyRhthmic Metronome written by Doug Hirlinger 
//Original Scheduling Concept comes from Chris Wilson's metronome 
//and his article 'A Tale of Two Clocks' https://web.dev/articles/audio-scheduling
//I had a light bulb moment after studying Simple Metronome by Grant James  https://grantjam.es/

let voice = new Voice();

let topFloat = 3;
let botFloat = 5;
let botVolume = 1;
let topVolume = 1;
let playSub = false;

let tempo = document.getElementById('tempo');
let topNumMuteInput = document.getElementById('top-num-mute');
let botNumMuteInput = document.getElementById('bot-num-mute');
let topNumMute = false;
let botNumMute = false; 
let topNumVol = document.getElementById('top-num-vol');
let botNumVol = document.getElementById('bot-num-vol');
let playSubInput = document.getElementById('subdivision');
let topNumInput = document.getElementById('top-num');
let botNumInput = document.getElementById('bot-num');
let playPauseIcon = document.getElementById('play-pause-icon');
let playButton = document.getElementById('play-button');

//automation variables
let step1OnOff = document.getElementById('step-1-on-off');
let step3OnOff = document.getElementById('step-3-on-off');
let step4OnOff = document.getElementById('step-4-on-off');
let step1CyclesInput = document.getElementById('step-1-cycles');
let step2CyclesInput = document.getElementById('step-2-cycles');
let step3CyclesInput = document.getElementById('step-3-cycles');
let step4CyclesInput = document.getElementById('step-4-cycles');
let step1TopNumMuteInput = document.getElementById('step-1-top-num-mute');
let step2TopNumMuteInput = document.getElementById('step-2-top-num-mute');
let step3TopNumMuteInput = document.getElementById('step-3-top-num-mute');
let step4TopNumMuteInput = document.getElementById('step-4-top-num-mute');
let step1TopNumInput = document.getElementById('step-1-top-num');
let step2TopNumInput = document.getElementById('step-2-top-num');
let step3TopNumInput = document.getElementById('step-3-top-num');
let step4TopNumInput = document.getElementById('step-4-top-num');
let step1BotNumInput = document.getElementById('step-1-bot-num');
let step2BotNumInput = document.getElementById('step-2-bot-num');
let step3BotNumInput = document.getElementById('step-3-bot-num');
let step4BotNumInput = document.getElementById('step-4-bot-num');
let step1BotNumMuteInput = document.getElementById('step-1-bot-num-mute');
let step2BotNumMuteInput = document.getElementById('step-2-bot-num-mute');
let step3BotNumMuteInput = document.getElementById('step-3-bot-num-mute');
let step4BotNumMuteInput = document.getElementById('step-4-bot-num-mute');
let step1playSubInput = document.getElementById('step-1-subdivision');
let step2playSubInput = document.getElementById('step-2-subdivision');
let step3playSubInput = document.getElementById('step-3-subdivision');
let step4playSubInput = document.getElementById('step-4-subdivision');
//automation vars refer to the cycle on/off boxes.
let automation = false;
let automation3 = false;
let automation4 = false;
//cycles refer to the cycles number box value 
//which is how many times through the polyrhythmic cycle before going to the next cycle.
let params = {
     cycles1 : 2,
     cycles2 : 2,
     cycles3 : 2,
     cycles4 : 2,
     step1TopNum : 3,
     step1BotNum : 5,
     step2TopNum : 4,
     step2BotNum : 5,
     step3TopNum : 4,
     step3BotNum : 3,
     step4TopNum : 6,
     step4BotNum : 5,
     step1TopNumMute : false,
     step1BotNumMute : false,
     step2TopNumMute : false,
     step2BotNumMute : false,
     step3TopNumMute : false,
     step3BotNumMute : false,
     step4TopNumMute : false,
     step4BotNumMute : false,
     step1playSub : false,
     step2playSub : false,
     step3playSub : false,
     step4playSub : false
}

playButton.addEventListener('click', function() {
    voice.startStop();

    if (voice.isRunning) {
        playPauseIcon.className = 'pause';
    }
    else {
        playPauseIcon.className = 'play';
    }
});

tempo.oninput = () => {
    if (tempo.value > 19 && tempo.value < 399) {
        voice.tempo = tempo.value * topFloat;
    } 
};

topNumInput.oninput = () => {
   if(topNumInput.value > 0) {
       topFloat = topNumInput.value;
       inputMargin(topNumInput);
   }
};

botNumInput.oninput = () => {
   if(botNumInput.value > 0) {
        botFloat = botNumInput.value;
        inputMargin(botNumInput);
   }
};

topNumMuteInput.oninput = () =>{
    topNumMute = topNumMuteInput.checked;
}

topNumVol.oninput = () => {
    if (topNumVol.checked) {
        topVolume = .5;
    } else {
        topVolume = 1.;
    }    
}

botNumMuteInput.oninput = () =>{
    botNumMute = botNumMuteInput.checked;
}

botNumVol.oninput = () => {
    if (botNumVol.checked) {
        botVolume = .5;
    } else {
        botVolume = 1.;
    }    
}

playSubInput.oninput = () => {
    if(playSubInput.checked) { 
        playSub = true;
    } else 
    { playSub = false; }
}

//jQuery to toggle the automation area
jQuery(document).ready(function(){
    jQuery('#automation #title').click(function(){
        jQuery('#a-panel').slideToggle('slow');
    });
});

//automation
step1OnOff.oninput = () => {
    if(step1OnOff.checked) {
        automation = true;
        step3OnOff.disabled = step4OnOff.disabled = false;
    } else { 
        automation = false;
        step3OnOff.disabled = step4OnOff.disabled = true;
        voice.reset();
    }
}

step1CyclesInput.oninput = () =>{
    if (step1CyclesInput.value > 0 && step1CyclesInput.value < 21 ) { 
        params.cycles1 = step1CyclesInput.value;
    } 
}

step1TopNumInput.oninput = () =>{
    if (step1TopNumInput.value > 0 && step1TopNumInput.value< 25) {
    params.step1TopNum = step1TopNumInput.value;
    }
}

step1BotNumInput.oninput = () =>{
    if (step1BotNumInput.value > 0 && step1BotNumInput.value< 25) {
    params.step1BotNum = step1BotNumInput.value;
    }
}

step1BotNumMuteInput.oninput = () => {
    params.step1BotNumMute = step1BotNumMuteInput.checked;
}

step1TopNumMuteInput.oninput = () => {
    params.step1TopNumMute = step1TopNumMuteInput.checked;
}

step1playSubInput.oninput = () => {
    params.step1playSub = step1playSubInput.checked;
}

step2CyclesInput.oninput = () =>{
    if (step2CyclesInput.value > 0 && step2CyclesInput.value < 21 ) { 
    params.cycles2 = step2CyclesInput.value;
        }
}

step2TopNumInput.oninput = () =>{
    if (step2TopNumInput.value > 0 && step2TopNumInput.value< 25) {
    params.step2TopNum = step2TopNumInput.value;
    }
}

step2BotNumInput.oninput = () =>{
    if (step2BotNumInput.value > 0 && step2BotNumInput.value< 25) {
    params.step2BotNum = step2BotNumInput.value;
    }
}

step2BotNumMuteInput.oninput = () => {
    params.step2BotNumMute = step2BotNumMuteInput.checked;
}

step2TopNumMuteInput.oninput = () => {
    params.step2TopNumMute = step2TopNumMuteInput.checked;
}

step2playSubInput.oninput = () => {
    params.step2playSub = step2playSubInput.checked;
}

step3OnOff.oninput = () => {
    if (step3OnOff.checked) {
        automation3 = true;
    } else {
        automation3 = false;
    }
}

step3CyclesInput.oninput = () =>{
    if (step3CyclesInput.value > 0 && step3CyclesInput.value < 21 ) { 
        params.cycles3 = step3CyclesInput.value;
    } 
}

step3TopNumInput.oninput = () =>{
    if (step3TopNumInput.value > 0 && step3TopNumInput.value< 25) {
    params.step3TopNum = step3TopNumInput.value;
    }
}

step3BotNumInput.oninput = () =>{
    if (step3BotNumInput.value > 0 && step3BotNumInput.value< 25) {
    params.step3BotNum = step3BotNumInput.value;
    }
}

step3BotNumMuteInput.oninput = () => {
    params.step3BotNumMute = step3BotNumMuteInput.checked;
}

step3TopNumMuteInput.oninput = () => {
    params.step3TopNumMute = step3TopNumMuteInput.checked;
}

step3playSubInput.oninput = () => {
    params.step3playSub = step3playSubInput.checked;
}

step4OnOff.oninput = () => {
    if (step4OnOff.checked) {
        automation4 = true;
    } else {
        automation4 = false;
    }
}
step4CyclesInput.oninput = () =>{
    if (step4CyclesInput.value > 0 && step4CyclesInput.value < 21 ) { 
        params.cycles4 = step4CyclesInput.value;
    } 
}

step4TopNumInput.oninput = () =>{
    if (step4TopNumInput.value > 0 && step4TopNumInput.value< 25) {
    params.step4TopNum = step4TopNumInput.value;
    }
}

step4BotNumInput.oninput = () =>{
    if (step4BotNumInput.value > 0 && step4BotNumInput.value< 25) {
    params.step4BotNum = step4BotNumInput.value;
    }
}

step4BotNumMuteInput.oninput = () => {
    params.step4BotNumMute = step4BotNumMuteInput.checked;
}

step4TopNumMuteInput.oninput = () => {
    params.step4TopNumMute = step4TopNumMuteInput.checked;
}

step4playSubInput.oninput = () => {
    params.step4playSub = step4playSubInput.checked;
}
//adjust left margin css of number input elements for 2 digit numbers
function inputMargin(el) {
    if (el.value > 9) {
      jQuery(el).addClass('double-digi');
    } else {
        jQuery(el).removeClass('double-digi');
    }
}

