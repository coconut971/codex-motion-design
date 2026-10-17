import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {compileProject, beatTime, eventTime} from '../lib/project.mjs';
import {synthesizeAudio} from '../scripts/audio.mjs';

const raw=JSON.parse(await readFile(new URL('../project.json',import.meta.url),'utf8'));
test('one beat grid determines frame and sample contacts without mutating JSON',()=>{
  const p=compileProject(raw);
  assert.equal(p.frameCount,240);assert.equal(beatTime(p,4),2);
  assert.equal(eventTime(p,'contact')*p.fps,60);
  const sound=synthesizeAudio(p),contact=sound.stats.cues.find(c=>c.id==='contact');
  assert.equal(contact.startSample,96000);assert.equal(raw.events[1].at,undefined);
  const retimed=structuredClone(raw);retimed.bpm=100;retimed.duration=10;
  const p2=compileProject(retimed),audio=synthesizeAudio(p2);
  assert.equal(eventTime(p2,'contact'),2.4);
  assert.equal(audio.stats.cues.find(c=>c.id==='contact').startSample,115200);
  assert.notDeepEqual(sound.buffer,audio.buffer);
});

test('descriptor rejects ambiguous timing, invalid cues and unencodable geometry',()=>{
  const bad=edit=>{const p=structuredClone(raw);edit(p);assert.throws(()=>compileProject(p));};
  bad(p=>p.events[1].id=p.events[0].id);
  bad(p=>p.events[0].beat=-1);bad(p=>p.events[0].beat=30);
  bad(p=>p.events.reverse());bad(p=>p.duration=8.01);
  bad(p=>p.width=1919);bad(p=>p.bpm=0);bad(p=>p.cuts=[3,2]);
  bad(p=>p.events[0].sound.pan=2);bad(p=>p.events[0].sound.hz=24000);
  assert.throws(()=>eventTime(compileProject(raw),'missing'));
});
