import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,step} from '../src/simulation.ts';
test('Mica lands on the ground without sinking',()=>{const g=createGame(0);for(let i=0;i<240;i++)step(g,{left:false,right:false,jump:false},1/120);assert.equal(g.player.y,416);assert.equal(g.player.grounded,true);});
