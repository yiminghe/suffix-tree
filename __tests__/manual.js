import SuffixTee from '../src/';
import fs from 'fs';
import path from 'path';

const s = 'abcdabce';
const st = new SuffixTee(s);

fs.writeFileSync(path.join(__dirname, 'test.dot'), st.printTree());

console.log('done!');
