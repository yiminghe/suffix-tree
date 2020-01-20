import SuffixTee from '../src/';

describe('suffix-tree', () => {
  it('works', () => {
    const s = 'abcabxabcd';
    const st = new SuffixTee(s);
    expect(st.printTree()).toMatchSnapshot();
  });
});
