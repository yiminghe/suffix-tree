import SuffixTee from '../src/';

describe('suffix-tree', () => {
  it('works', () => {
    const s = 'abcdabce';
    const st = new SuffixTee(s);
    expect(st.printTree()).toMatchSnapshot();
  });
});
