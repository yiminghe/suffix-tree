// https://stackoverflow.com/questions/9452701/ukkonens-suffix-tree-algorithm-in-plain-english

const LIMIT = 1<<30;

interface STNext {
  [o: string]: number;
}

class STNode {
  start: number;
  end: number;
  next: STNext;
  tree: SuffixTee;
  link: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
    this.next = {};
    this.tree = null as any;
    this.link = 0;
  }

  getEdgeLength(): number {
    return Math.min(this.end, this.tree.position + 1) - this.start;
  }
}

class SuffixTee {
  s: string;
  nodes: STNode[];
  root: number;
  position: number;
  currentNode: number;
  needSuffixLink: number;
  remainder: number;
  active_node: number;
  active_length: number;
  active_edge: number;

  constructor(str:string) {
    const len = str.length;
    this.s = '';
    this.nodes = new Array(2 * len + 2);
    this.root = 0;
    this.position = -1;
    this.currentNode = 0;
    this.needSuffixLink = 0;
    this.remainder = 0;

    this.active_node = 0;
    this.active_length = 0;
    this.active_edge = 0;

    this.active_node = this.root = this.newNode(-1, -1);

    for(const c of str){
      this.addChar(c);
    }
  }

  newNode(start: number, end: number) {
    const n = new STNode(start, end);
    n.tree = this;
    this.nodes[++this.currentNode] = n;
    return this.currentNode;
  }

  addSuffixLink(node: number) {
    if (this.needSuffixLink > 0)
      this.nodes[this.needSuffixLink].link = node;
    this.needSuffixLink = node;
  }

  getActiveEdge() {
    return this.s[this.active_edge];
  }

  walkDown(next: number) {
    const { active_length, nodes } = this;
    if (active_length >= nodes[next].getEdgeLength()) {
      this.active_edge += nodes[next].getEdgeLength();
      this.active_length -= nodes[next].getEdgeLength();
      this.active_node = next;
      return true;
    }
    return false;
  }

  addChar(c: string) {
    const { nodes } = this;
    ++this.position;
    this.s += c;
    this.needSuffixLink = -1;
    this.remainder++;
    while (this.remainder > 0) {
      if (this.active_length == 0) this.active_edge = this.position;
      if (!nodes[this.active_node].next.hasOwnProperty(this.getActiveEdge())) {
        let leaf = this.newNode(this.position, LIMIT);
        nodes[this.active_node].next[this.getActiveEdge()] = leaf;
        this.addSuffixLink(this.active_node); //rule 2
      } else {
        let next = nodes[this.active_node].next[this.getActiveEdge()];
        if (this.walkDown(next)) continue;   //observation 2
        if (this.s[nodes[next].start + this.active_length] == c) { //observation 1
          this.active_length++;
          this.addSuffixLink(this.active_node); // observation 3
          break;
        }
        let split = this.newNode(nodes[next].start, nodes[next].start + this.active_length);
        nodes[this.active_node].next[this.getActiveEdge()] = split;
        let leaf = this.newNode(this.position, LIMIT);
        nodes[split].next[c] = leaf;
        nodes[next].start += this.active_length;
        nodes[split].next[this.s[nodes[next].start]] = next;
        this.addSuffixLink(split); //rule 2
      }
      this.remainder--;
      if (this.active_node == this.root && this.active_length > 0) {  //rule 1
        this.active_length--;
        this.active_edge = this.position - this.remainder + 1;
      } else
        this.active_node = nodes[this.active_node].link > 0 ? nodes[this.active_node].link : this.root; //rule 3
    }
  }

  edgeString(node: number) {
    const nodes = this.nodes;
    return this.s.slice(nodes[node].start, Math.min(this.position + 1, nodes[node].end));
  }

  printTree() {
    const out: string[] = [];
    const root = this.root;
    out.push('digraph {');
    out.push('\trankdir = LR;');
    out.push('\tedge [arrowsize=0.4,fontsize=10]');
    out.push('\tnode1 [label="",style=filled,fillcolor=lightgrey,shape=circle,width=.1,height=.1];');
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

  printLeaves(x: number, out: string[]) {
    const { nodes } = this;
    if (Object.keys(nodes[x].next).length == 0)
      out.push('\tnode' + x + ' [label="",shape=point]');
    else {
      for (let child of Object.values(nodes[x].next))
        this.printLeaves(child, out);
    }
  }

  printInternalNodes(x: number, out: string[]) {
    const { nodes } = this;
    if (x != this.root && Object.keys(nodes[x].next).length > 0)
      out.push('\tnode' + x + ' [label="",style=filled,fillcolor=lightgrey,shape=circle,width=.07,height=.07]');

    for (let child of Object.values(nodes[x].next))
      this.printInternalNodes(child, out);
  }

  printEdges(x: number, out: string[]) {
    const { nodes } = this;
    for (let child of Object.values(nodes[x].next)) {
      out.push('\tnode' + x + ' -> node' + child + ' [label="' + this.edgeString(child) + '",weight=3]');
      this.printEdges(child, out);
    }
  }

  printSLinks(x: number, out: string[]) {
    const { nodes } = this;
    if (nodes[x].link > 0)
      out.push('\tnode' + x + ' -> node' + nodes[x].link + ' [label="",weight=1,style=dotted]');
    for (let child of Object.values(nodes[x].next))
      this.printSLinks(child, out);
  }
}

export default SuffixTee;



