// https://stackoverflow.com/questions/9452701/ukkonens-suffix-tree-algorithm-in-plain-english
// https://www.cnblogs.com/xubenben/p/3486007.html

const LIMIT = 1 << 30;
let id = 0;

interface STNext {
  [o: string]: STNode;
}

class STNode {
  start: number;
  end: number;
  next: STNext;
  tree: SuffixTee;
  link?: STNode;
  id: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
    this.next = Object.create(null);
    this.tree = null as any;
    this.link = undefined;
    this.id = ++id;
  }

  getEdgeLength(): number {
    return Math.min(this.end, this.tree.position + 1) - this.start;
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

  constructor(str: string) {
    this.s = new Array(str.length);
    this.position = -1;
    this.linkNode = undefined;
    this.remainder = 0;
    this.activeLength = 0;
    this.activeEdge = 0;

    this.activeNode = this.root = this.newNode(-1, -1);

    for (const c of str) {
      this.addChar(c);
    }
  }

  newNode(start: number, end: number) {
    const n = new STNode(start, end);
    n.tree = this;
    return n;
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

  walkDown(next: STNode) {
    const { activeLength } = this;
    const nextEdgeLength = next.getEdgeLength();
    if (activeLength >= nextEdgeLength) {
      this.activeEdge += nextEdgeLength;
      this.activeLength -= nextEdgeLength;
      this.activeNode = next;
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
      if (!this.activeNode.next[this.getActiveEdge()]) {
        let leaf = this.newNode(this.position, LIMIT);
        this.activeNode.next[this.getActiveEdge()] = leaf;
        this.addSuffixLink(this.activeNode); //rule 2
      } else {
        let next = this.activeNode.next[this.getActiveEdge()];
        if (this.walkDown(next)) {
          continue; //observation 2
        }
        if (this.s[next.start + this.activeLength] === c) {
          //observation 1
          this.activeLength++;
          this.addSuffixLink(this.activeNode); // observation 3
          break;
        }
        let split = this.newNode(next.start, next.start + this.activeLength);
        this.activeNode.next[this.getActiveEdge()] = split;
        let leaf = this.newNode(this.position, LIMIT);
        split.next[c] = leaf;
        next.start += this.activeLength;
        split.next[this.s[next.start]] = next;
        this.addSuffixLink(split); //rule 2
      }
      this.remainder--;
      if (this.activeNode == this.root && this.activeLength > 0) {
        //rule 1
        this.activeLength--;
        this.activeEdge = this.position - this.remainder + 1;
      } else
        this.activeNode = this.activeNode.link
          ? this.activeNode.link
          : this.root; //rule 3
    }
  }

  edgeString(node: STNode) {
    return this.s
      .slice(node.start, Math.min(this.position + 1, node.end))
      .join('');
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
}

export default SuffixTee;
