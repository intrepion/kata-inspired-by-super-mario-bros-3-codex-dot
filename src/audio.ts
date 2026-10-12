let context:AudioContext|undefined;
export function tone(event:string,enabled:boolean){
 if(!enabled)return;
 try{context??=new AudioContext();void context.resume();const o=context.createOscillator(),gain=context.createGain();o.connect(gain);gain.connect(context.destination);const now=context.currentTime;
 const notes:Record<string,number>={jump:420,mote:880,seal:1100,sail:650,heart:700,beacon:990,stomp:180,spring:560,hurt:110,retry:140,checkpoint:760,win:1040,bump:210};
 o.type=event==='hurt'?'sawtooth':'sine';o.frequency.setValueAtTime(notes[event]??440,now);o.frequency.exponentialRampToValueAtTime((notes[event]??440)*1.4,now+.1);gain.gain.setValueAtTime(.035,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.18);o.start(now);o.stop(now+.2);
 }catch{/* Audio is optional on unsupported or denied devices. */}
}
