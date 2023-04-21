require("ts-node/register");

const {
  withBaseMods: withWindowsBaseMods,
  //   withWindowsBaseMods,
  //   withWindowsFooBar,
} = require("./plugins/withWindows");

module.exports = ({ config }) => {
  // Add a windows config plugin
  //   withWindowsFooBar(config, (config) => {
  //     config.modResults.foo = "hello";
  //     if (!config.extra) config.extra = {};
  //     config.extra.helloFromWindows = "hello";
  //     return config;
  //   });

  return withWindowsBaseMods(config);
};
