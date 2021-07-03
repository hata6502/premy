export default {
  mode: "production",
  entry: {
    index: "./src/index.ts",
  },
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.svg$/,
        type: "asset/inline",
      },
    ],
  },
  output: {
    library: {
      type: "module",
    },
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
};
