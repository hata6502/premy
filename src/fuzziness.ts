export const fuzzinesses = [1, 1.0625, 1.25, 2];

let xorshiftState = 2463534242;
const xorshift = () => {
  xorshiftState ^= xorshiftState << 13;
  xorshiftState ^= xorshiftState >>> 17;
  xorshiftState ^= xorshiftState << 5;
  return xorshiftState;
};

export const noisemap = [...Array(256).keys()].map(() =>
  [...Array(256).keys()].map(() => xorshift() / 0x100000000 + 0.5)
);
