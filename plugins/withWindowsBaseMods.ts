import {
  ConfigPlugin,
  ExportedConfig,
  Mod,
  ModConfig,
  WarningAggregator,
  withMod,
} from "@expo/config-plugins";
import {
  ForwardedBaseModOptions,
  provider,
  withGeneratedBaseMods,
} from "@expo/config-plugins/build/plugins/createBaseMod";
import { promises } from "fs";

// import { Entitlements, Paths } from '../ios';
// import { ensureApplicationTargetEntitlementsFileConfigured } from '../ios/Entitlements';
// import { InfoPlist } from '../ios/WindowsConfig.types';
// import { getPbxproj } from '../ios/utils/Xcodeproj';
// import { getInfoPlistPathFromPbxproj } from '../ios/utils/getInfoPlistPath';
const addWarningWindows = WarningAggregator.addWarningForPlatform.bind(
  this,
  "windows"
);

const { readFile, writeFile } = promises;

type WindowsModName = keyof Required<ModConfig>["ios"];

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
    getFilePath({ modRequest: { projectRoot } }) {
      return projectRoot;
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
