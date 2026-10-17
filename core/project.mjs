import {compileProject as legacyCompile} from '../lib/project.mjs';
import {compileFilm} from './film.mjs';
// Compatible entry for capture/audio; the legacy API and REA baseline stay intact.
export {beatTime,eventTime} from '../lib/project.mjs';
export function compileProject(raw) {
  return raw?.schema === 'motion/1' ? compileFilm(raw).project : legacyCompile(raw);
}
