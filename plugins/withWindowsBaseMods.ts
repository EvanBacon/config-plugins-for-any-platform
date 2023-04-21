import {
  ConfigPlugin,
  ExportedConfig,
  Mod,
  WarningAggregator,
  withMod,
} from "@expo/config-plugins";
import {
  ForwardedBaseModOptions,
  provider,
  withGeneratedBaseMods,
} from "@expo/config-plugins/build/plugins/createBaseMod";
import { promises } from "fs";
import path from "path";

// @ts-ignore
const addWarningWindows = WarningAggregator.addWarningForPlatform.bind(
  this,
  // @ts-ignore
  "windows"
);

const { readFile, writeFile } = promises;

type WindowsModConfig = {
  /** Dangerously make a modification before any other android mods have been run. */
  dangerous?: Mod<unknown>;

  foobar?: Mod<FooBar>;
};

type WindowsModName = keyof Required<WindowsModConfig>;

// Demo file type
type FooBar = { foo: string };

// ExperimentalFeatures.props
// NuGet.Config

const defaultProviders = {
  dangerous: provider<unknown>({
    getFilePath() {
      return "";
    },
    async read() {
      return {};
    },
    async write() {},
  }),
  // Append a rule to supply a mock file to mods on `mods.windows.foobar`
  foobar: provider<FooBar>({
    isIntrospective: true,
    getFilePath({ modRequest: { platformProjectRoot } }) {
      return path.join(platformProjectRoot, "foobar.json");
    },
    async read(filePath) {
      try {
        return JSON.parse(await readFile(filePath, "utf-8"));
      } catch {
        addWarningWindows(
          "foobar",
          "Could not read foobar.json, using default."
        );
        return { foo: "bar" };
      }
    },
    async write(filePath: string, { modResults, modRequest: { introspect } }) {
      if (introspect) {
        return;
      }
      await writeFile(filePath, JSON.stringify(modResults));
    },
  }),
};

type WindowsDefaultProviders = typeof defaultProviders;

export function withWindowsBaseMods(
  config: ExportedConfig,
  {
    providers,
    ...props
  }: ForwardedBaseModOptions & {
    providers?: Partial<WindowsDefaultProviders>;
  } = {}
): ExportedConfig {
  return withGeneratedBaseMods<WindowsModName>(config, {
    ...props,
    // @ts-expect-error
    platform: "windows",
    providers: providers ?? getWindowsModFileProviders(),
  });
}

export function getWindowsModFileProviders() {
  return defaultProviders;
}

/** Provides the FooBar file for modification. */
export const withWindowsFooBar: ConfigPlugin<Mod<FooBar>> = (
  config,
  action
) => {
  return withMod(config, {
    // @ts-expect-error
    platform: "windows",
    mod: "foobar",
    action,
  });
};
