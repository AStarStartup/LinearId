// Copyright AStartup. MIT License. You can find a copy of the license at 
// http://github.com/AStarStartup/LinearId

const { LIDNext } = require('../dist');
const { randomInt } = require('crypto');

export function LIDNextCJS() {
  return LIDNext(randomInt);
}
