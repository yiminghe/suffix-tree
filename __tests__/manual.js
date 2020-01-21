import SuffixTee from '../src/';
import fs from 'fs';
import path from 'path';
import now from 'performance-now';

let s =
  fs
    .readFileSync(path.join(__dirname, 'data.txt'), {
      encoding: 'utf-8',
    })
    .trim()
    .slice(1, -1) + '$';
let st = new SuffixTee(s);
console.log(s.length);

fs.writeFileSync(path.join(__dirname, 'test.dot'), st.printTree());

console.log('done!');

(function() {
  const start = now();
  function dfs(n) {
    const values = Object.values(n.next);
    if (!values.length) {
      return null;
    }
    let ret = {
      max: n.getEdgeLength(),
      end: n.getEnd(),
    };
    let max = -1;
    let allNull = 1;
    for (var c of values) {
      let subRet = dfs(c);
      if (subRet) {
        allNull = 0;
        if (subRet.max > max) {
          max = subRet.max;
          ret.end = subRet.end;
        }
      }
    }
    if (allNull) {
      if (values.length >= 2) {
        return ret;
      }
      return null;
    }
    ret.max += max;
    return ret;
  }

  const ret = dfs(st.root);

  if (!ret || ret.end === -1) {
    console.log('no answer');
  } else {
    const { max, end } = ret;
    console.log(max, end, s.slice(end - max, end));
  }
  console.log(now() - start);
})();

(function() {
  const start = now();
  const max = st.maxCount;
  const end = st.maxNode && st.maxNode.getEnd();
  if (max === -1) {
    console.log('no answer');
  } else {
    console.log(max, end, s.slice(end - max, end));
  }
  console.log(now() - start);
})();
