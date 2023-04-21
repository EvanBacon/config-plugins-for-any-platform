import { createPlatformPluginSupport } from "./createPlatformPluginSupport";

import {
  ForwardedBaseModOptions,
  provider,
  withGeneratedBaseMods,
} from "@expo/config-plugins/build/plugins/createBaseMod";

import path from "path";
import fs from "fs";

type FooBar = {};

const { addWarning, withBaseMods, getModFileProviders, ...plugins } =
  createPlatformPluginSupport("windows", {
    // Append a rule to supply a mock file to mods on `mods.windows.foobar`
    foobar: provider<FooBar>({
      isIntrospective: true,
      getFilePath({ modRequest: { platformProjectRoot } }) {
        return path.join(platformProjectRoot, "foobar.json");
      },
      async read(filePath) {
        try {
          return JSON.parse(await fs.promises.readFile(filePath, "utf-8"));
        } catch {
          addWarning("foobar", "Could not read foobar.json, using default.");
          return { foo: "bar" };
        }
      },
      async write(
        filePath: string,
        { modResults, modRequest: { introspect } }
      ) {
        if (introspect) {
          return;
        }
        await fs.promises.writeFile(filePath, JSON.stringify(modResults));
      },
    }),
  });

const typedPlugins = plugins as {
  withWindowsDangerous: any;
  withWindowsFoobar: any;
};

console.log(typedPlugins);

export { withBaseMods, getModFileProviders };
