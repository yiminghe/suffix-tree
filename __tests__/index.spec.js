import SuffixTree from '../src/';

describe('suffix-tree', () => {
  it('works', () => {
    const s = 'abcabxabcd';
    const st = new SuffixTree(s);
    expect(st.printTree()).toMatchSnapshot();
  });
});
