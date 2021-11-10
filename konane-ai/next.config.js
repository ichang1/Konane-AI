const path = require("path");

module.exports = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles"), "**/.*scss"],
  },
  webpack(config) {
    // Ensures that web workers can import scripts.
    config.output.publicPath = "/_next/";
    return config;
  },
};
