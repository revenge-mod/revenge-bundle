const { __PYON_LOADER__: bnPayload, __vendetta_loader: vdPayload } = globalThis as any;

interface LoaderIdentity {
    type: "vendetta" | "bunny";
    name: string;
    version: string;
    features: {
        loaderConfig: {
            path: string;
        };
        themes: {
            stored: any;
            storePath: string;
        } | null;
        rdt: {
            version: any;
            exports: any;
        } | null;
        sysColors: {
            palette: any;
        } | null;
        fonts: {
            version: number;
        } | null;
    };
}

export const LOADER_IDENTITY: LoaderIdentity = (() => {
    if (bnPayload) {
        return {
            type: "bunny",
            name: bnPayload.loaderName,
            version: bnPayload.loaderVersion,
            features: {
                loaderConfig: {
                    path: "loader.json",
                },
                themes: bnPayload.hasThemeSupport
                    ? {
                          stored: bnPayload.storedTheme,
                          storePath: "current-theme.json",
                      }
                    : null,
                rdt: {
                    version: window.__reactDevTools?.version,
                    exports: window.__reactDevTools?.exports,
                },
                sysColors: bnPayload.isSysColorsSupported
                    ? {
                          palette: bnPayload.sysColors,
                      }
                    : null,
                fonts: bnPayload.fontPatch
                    ? {
                          version: bnPayload.fontPatch,
                      }
                    : null,
            },
        };
    }
    return {
        type: "vendetta",
        name: vdPayload.name,
        version: "N/A",
        features: {
            loaderConfig: {
                path: "../vendetta_loader.json",
            },
            themes:
                vdPayload.features.themes != null
                    ? {
                          stored: window[vdPayload.features.themes.prop] || null,
                          storePath: "../vendetta_theme.json",
                      }
                    : null,
            rdt:
                vdPayload.features.devtools != null
                    ? {
                          exports: window[vdPayload.features.devtools.prop] || null,
                          version: vdPayload.features.devtools.version,
                      }
                    : null,
            sysColors: vdPayload.features.syscolors
                ? {
                      palette: window[vdPayload!.features.syscolors!.prop] || null,
                  }
                : null,
            fonts: null,
        },
    };
})();

export function getVendettaLoaderIdentity() {
    if (window.__vendetta_loader) return window.__vendetta_loader;

    const loader = {
        name: bnPayload.loaderName,
        features: {
            loaderConfig: LOADER_IDENTITY.features.loaderConfig != null,
            syscolors:
                LOADER_IDENTITY.features.sysColors != null
                    ? {
                          prop: "__vendetta_syscolors",
                      }
                    : undefined,
            themes:
                LOADER_IDENTITY.features.themes != null
                    ? {
                          prop: "__vendetta_theme",
                      }
                    : undefined,
        },
    };

    if (LOADER_IDENTITY.features.sysColors != null) {
        Object.defineProperty(globalThis, "__vendetta_syscolors", {
            get: () => LOADER_IDENTITY.features.sysColors?.palette,
            configurable: true,
        });
    }

    if (LOADER_IDENTITY.features.themes != null) {
        Object.defineProperty(globalThis, "__vendetta_theme", {
            get: () => {
                try {
                    const { default: ColorManager } = require("@lib/addons/themes/colors/manager");
                    const { selected } = ColorManager.preferences;
                    const manifest = ColorManager.getCurrentManifest();
                    if (selected == null || manifest == null) return null;

                    return {
                        id: ColorManager.getId(manifest, ColorManager.infos[selected].sourceUrl),
                        data: ColorManager.convertToVd(manifest),
                        selected: true,
                    };
                } catch {
                    return LOADER_IDENTITY.features.themes?.stored;
                }
            },
            configurable: true,
        });
    }

    Object.defineProperty(globalThis, "__vendetta_loader", {
        get: () => loader,
        configurable: true,
    });

    return loader;
}
