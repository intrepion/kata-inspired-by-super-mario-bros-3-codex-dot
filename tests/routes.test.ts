import {test} from 'node:test';import assert from 'node:assert/strict';import {createGame,step,DT} from '../src/simulation.ts';
// Scripted simulation assistance: observes the public simulation and chooses input.
// This proves route feasibility; it is NOT evidence of visible browser completion.
for(let index=0;index<7;index++)test(`trail ${index+1} can be restored by movement inputs alone`,()=>{
 const g=createGame(index);let heldFor=0,cooldown=0;
 for(let frame=0;frame<120*45&&g.status==='playing';frame++){
  const p=g.player;cooldown=Math.max(0,cooldown-DT);
  const ground=g.level.platforms.find(s=>s.h>50&&p.x+p.w/2>=s.x&&p.x+p.w/2<s.x+s.w);
  const edge=ground&&ground.x+ground.w<g.level.width&&ground.x+ground.w-p.x<85;
  const enemy=g.level.enemies.some(e=>e.alive&&e.x>p.x&&e.x-p.x<130);
  const fire=g.level.hazards.some(h=>h.x>p.x&&h.x-p.x<115);
  if(p.grounded&&cooldown===0&&(edge||enemy||fire)){heldFor=.5;cooldown=.8;}
  step(g,{left:false,right:true,jump:heldFor>0});heldFor=Math.max(0,heldFor-DT);
 }
 assert.equal(g.status,'won',`x=${g.player.x}, deaths=${g.deaths}`);assert.ok(g.deaths<4);if(index===6)assert.equal(g.beacons,3);
});
