// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

import { LIDNext } from './';
import { randomInt } from 'crypto';

export function LIDNextMJS() {
  return LIDNext(randomInt);
}
