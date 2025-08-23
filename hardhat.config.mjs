import "@nomicfoundation/hardhat-toolbox";

export default {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "0xf73edfcf38d5ce48db785dc3599bbe62ec47965e1a7c6d19800b597ad7b91fa0",
        "0x08669e814d58bafbde6f6229d9b01720c625b15eda85725bcd69d8a1e1bdb588",
        "0x486dc9a68b8da891b578b9021757429f0f4b0872130839901dfc6aa510f9ded5",
      ],
    },
  },
};
