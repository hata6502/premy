const config = {
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
      },
    ],
  },
  output: {
    // Prevent to use mjs extension.
    filename: "[name].js",
    library: {
      type: "module",
    },
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
};

export default config;
