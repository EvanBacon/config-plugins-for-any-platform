require("ts-node/register");
const {
  withWindowsBaseMods,
  withWindowsFooBar,
} = require("./plugins/withWindowsBaseMods");

module.exports = ({ config }) => {
  // Add a windows config plugin
  withWindowsFooBar(config, (config) => {
    config.modResults.foo = "hello";
    return config;
  });

  return withWindowsBaseMods(config);
};
