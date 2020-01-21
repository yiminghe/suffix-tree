# @yiminghe/suffix-tree
---

suffix tree

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/@yiminghe/suffix-tree.svg?style=flat-square
[npm-url]: http://npmjs.org/package/@yiminghe/suffix-tree
[travis-image]: https://img.shields.io/travis/yiminghe/suffix-tree.svg?style=flat-square
[travis-url]: https://travis-ci.org/yiminghe/suffix-tree
[coveralls-image]: https://img.shields.io/coveralls/yiminghe/suffix-tree.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/yiminghe/suffix-tree?branch=master
[gemnasium-image]: http://img.shields.io/gemnasium/yiminghe/suffix-tree.svg?style=flat-square
[gemnasium-url]: https://gemnasium.com/yiminghe/suffix-tree
[node-image]: https://img.shields.io/badge/node.js-%3E=10.0.0-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/@yiminghe/suffix-tree.svg?style=flat-square
[download-url]: https://npmjs.org/package/@yiminghe/suffix-tree

## usage

```javascript
import SuffixTree from '@yiminghe/suffix-tree';
const tree = new SuffixTree("abceabc$");
console.log(tree.getLongestDupSubstr()); // => abc
```

## API

### class SuffixTree

#### methods

- constructor(s:string)

construct a suffix tree using string s

- getLongestDupSubstr():string

Return any duplicated substring that has the longest possible length. 

#### members

- root: SuffixTree

root node of suffix tree

- next: `Map<string, SuffixTreeNode>`

map of next char to next SuffixTreeNode

### class SuffixTreeNode

#### members

- start: number

start position of string

#### methods

- getEdgeLength(): number

edge string length

- getEnd(): number

end position of string


