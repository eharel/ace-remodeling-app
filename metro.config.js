const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude dotenv from React Native bundle (it's Node.js only)
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /node_modules\/dotenv\/.*/,
];

module.exports = config;
