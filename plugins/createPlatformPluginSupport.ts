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

type WindowsModConfig = {
  /** Dangerously make a modification before any other android mods have been run. */
  dangerous?: Mod<unknown>;

  foobar?: Mod<FooBar>;
};

// Demo file type
type FooBar = { foo: string };

export function createPlatformPluginSupport(
  platform: string,
  providers: Record<string, ReturnType<typeof provider>>
) {
  // @ts-ignore
  const addWarning = WarningAggregator.addWarningForPlatform.bind(
    this,
    // @ts-ignore
    platform
  );

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
    ...providers,
    //   // Append a rule to supply a mock file to mods on `mods.windows.foobar`
    //   foobar: provider<FooBar>({
    //     isIntrospective: true,
    //     getFilePath({ modRequest: { platformProjectRoot } }) {
    //       return path.join(platformProjectRoot, "foobar.json");
    //     },
    //     async read(filePath) {
    //       try {
    //         return JSON.parse(await readFile(filePath, "utf-8"));
    //       } catch {
    //         addWarning("foobar", "Could not read foobar.json, using default.");
    //         return { foo: "bar" };
    //       }
    //     },
    //     async write(filePath: string, { modResults, modRequest: { introspect } }) {
    //       if (introspect) {
    //         return;
    //       }
    //       await writeFile(filePath, JSON.stringify(modResults));
    //     },
    //   }),
  };

  function withBaseMods(
    config: ExportedConfig,
    {
      providers,
      ...props
    }: ForwardedBaseModOptions & {
      providers?: Partial<typeof defaultProviders>;
    } = {}
  ): ExportedConfig {
    return withGeneratedBaseMods<keyof Required<WindowsModConfig>>(config, {
      ...props,
      // @ts-expect-error
      platform,
      providers: providers ?? getModFileProviders(),
    });
  }

  function getModFileProviders() {
    return defaultProviders;
  }

  //   /** Provides the FooBar file for modification. */
  //   const withWindowsFooBar: ConfigPlugin<Mod<FooBar>> = (config, action) => {
  //     return withMod(config, {
  //       // @ts-expect-error
  //       platform,
  //       mod: "foobar",
  //       action,
  //     });
  //   };

  const helpers = {};

  Object.entries(defaultProviders).map(([name, value]) => {
    const withUnknown: ConfigPlugin<Mod<unknown>> = (config, action) => {
      return withMod(config, {
        // @ts-expect-error
        platform,
        mod: name,
        action,
      });
    };

    const funcName = `with${upperFirst(platform)}${upperFirst(name)}`;

    // Ensure the name makes sense in the stack trace, this helps a lot with debugging.
    Object.defineProperty(withUnknown, "name", {
      value: funcName,
    });

    helpers[funcName] = withUnknown;

    // return withUnknown;
  });

  return {
    withBaseMods,
    getModFileProviders,
    addWarning,
    // [ withWindowsDangerous, withWindowsFooBar ]
    ...helpers,
  };
}

function upperFirst(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
