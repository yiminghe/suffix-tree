// https://stackoverflow.com/questions/9452701/ukkonens-suffix-tree-algorithm-in-plain-english
// https://www.cnblogs.com/xubenben/p/3486007.html

const LIMIT = 1 << 30;
let id = 0;

interface STNext {
  [o: string]: STNode;
}

export class STNode {
  start: number;
  end?: number;
  next: STNext;
  tree: SuffixTee;
  link?: STNode;
  id: number;
  parent?: STNode;
  allEdgesLength: number;

  constructor(tree: SuffixTee, start?: number, end?: number) {
    this.start = start === undefined ? tree.position : start;
    this.end = end;
    this.next = Object.create(null);
    this.tree = tree;
    // this.link = undefined;
    // this.parent = undefined;
    this.id = ++id;
    this.allEdgesLength = 0;
  }

  getEdgeLength(): number {
    return this.start === -1 ? 0 : this.getEnd() - this.start;
  }

  getEnd(): number {
    return this.end === undefined ? this.tree.s.length : this.end;
  }

  getEdgeString(): string {
    return this.tree.s
      .slice(this.start, this.start + this.getEdgeLength())
      .join('');
  }

  addChild(c: string, node: STNode) {
    this.next[c] = node;
    node.parent = this;
  }
}

class SuffixTee {
  s: string[];
  root: STNode;
  position: number;
  linkNode?: STNode;
  remainder: number;
  activeNode: STNode;
  activeLength: number;
  activeEdge: number;
  longestDupSubstrLength: number;
  longestDupSubstrEnd: number;

  constructor(str: string) {
    this.s = new Array(str.length);
    this.position = -1;
    this.linkNode = undefined;
    this.remainder = 0;
    this.activeLength = 0;
    this.activeEdge = 0;
    this.longestDupSubstrEnd = -1;
    this.longestDupSubstrLength = -1;
    this.activeNode = this.root = new STNode(this);

    for (const c of str) {
      this.addChar(c);
    }
  }

  addSuffixLink(node: STNode) {
    if (this.linkNode) {
      this.linkNode.link = node;
    }
    this.linkNode = node;
  }

  getActiveEdge() {
    return this.s[this.activeEdge];
  }

  walkDown(nextNode: STNode) {
    const { activeLength } = this;
    const nextEdgeLength = nextNode.getEdgeLength();
    if (activeLength >= nextEdgeLength) {
      this.activeEdge += nextEdgeLength;
      this.activeLength -= nextEdgeLength;
      this.activeNode = nextNode;
      return true;
    }
    return false;
  }

  addChar(c: string) {
    this.s[++this.position] = c;
    this.linkNode = undefined;
    this.remainder++;
    while (this.remainder > 0) {
      if (this.activeLength == 0) {
        this.activeEdge = this.position;
      }
      const activeC = this.getActiveEdge();
      if (!this.activeNode.next[activeC]) {
        let leaf = new STNode(this);
        this.activeNode.addChild(activeC, leaf);
        this.addSuffixLink(this.activeNode); //rule 2
      } else {
        let nextNode = this.activeNode.next[activeC];
        if (this.walkDown(nextNode)) {
          continue; //observation 2
        }
        if (this.s[nextNode.start + this.activeLength] === c) {
          //observation 1
          this.activeLength++;
          this.addSuffixLink(this.activeNode); // observation 3
          break;
        }
        let split = new STNode(
          this,
          nextNode.start,
          nextNode.start + this.activeLength,
        );
        this.activeNode.addChild(activeC, split);
        let leaf = new STNode(this);
        split.addChild(c, leaf);
        split.allEdgesLength +=
          this.activeNode.allEdgesLength + split.getEdgeLength();
        if (split.allEdgesLength > this.longestDupSubstrLength) {
          this.longestDupSubstrLength = split.allEdgesLength;
          this.longestDupSubstrEnd = split.getEnd();
        }
        nextNode.start += this.activeLength;
        split.addChild(this.s[nextNode.start], nextNode);
        this.addSuffixLink(split); //rule 2
      }
      this.remainder--;
      if (this.activeNode == this.root && this.activeLength > 0) {
        //rule 1
        this.activeLength--;
        this.activeEdge = this.position - this.remainder + 1;
      } else {
        this.activeNode = this.activeNode.link
          ? this.activeNode.link
          : this.root; //rule 3
      }
    }
  }

  getLongestDupSubstr(): string {
    return this.longestDupSubstrLength === -1
      ? ''
      : this.s
          .slice(
            this.longestDupSubstrEnd - this.longestDupSubstrLength,
            this.longestDupSubstrEnd,
          )
          .join('');
  }

  edgeString(node: STNode) {
    return this.s.slice(node.start, node.getEnd()).join('');
  }

  printLeaves(x: STNode, out: string[]) {
    if (Object.keys(x.next).length == 0) {
      out.push('\tnode' + x.id + ' [label="",shape=point]');
    } else {
      for (let child of Object.values(x.next)) {
        this.printLeaves(child, out);
      }
    }
  }

  printInternalNodes(x: STNode, out: string[]) {
    if (x != this.root && Object.keys(x.next).length > 0) {
      out.push(
        '\tnode' +
          x.id +
          ' [label="",style=filled,fillcolor=lightgrey,shape=circle,width=.07,height=.07]',
      );
    }
    for (let child of Object.values(x.next)) {
      this.printInternalNodes(child, out);
    }
  }

  printEdges(x: STNode, out: string[]) {
    for (let child of Object.values(x.next)) {
      out.push(
        '\tnode' +
          x.id +
          ' -> node' +
          child.id +
          ' [label="' +
          this.edgeString(child) +
          '",weight=3]',
      );
      this.printEdges(child, out);
    }
  }

  printSLinks(x: STNode, out: string[]) {
    if (x.link) {
      out.push(
        '\tnode' +
          x.id +
          ' -> node' +
          x.link.id +
          ' [label="",weight=1,style=dotted]',
      );
    }
    for (let child of Object.values(x.next)) this.printSLinks(child, out);
  }

  printTree() {
    const out: string[] = [];
    const root = this.root;
    out.push('digraph {');
    out.push('\trankdir = LR;');
    out.push('\tedge [arrowsize=0.4,fontsize=10]');
    out.push(
      '\tnode1 [label="",style=filled,fillcolor=lightgrey,shape=circle,width=.1,height=.1];',
    );
    out.push('//------leaves------');
    this.printLeaves(root, out);
    out.push('//------internal nodes------');
    this.printInternalNodes(root, out);
    out.push('//------edges------');
    this.printEdges(root, out);
    out.push('//------suffix links------');
    this.printSLinks(root, out);
    out.push('}');
    return out.join('\n');
  }
}

export default SuffixTee;
