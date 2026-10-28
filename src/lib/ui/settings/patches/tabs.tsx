import { after } from "@lib/api/patcher";
import { deleteJsxCreate, onJsxCreate } from "@lib/api/react/jsx";
import { TableRow } from "@metro/common/components";
import { findByNameLazy, findByPropsLazy } from "@metro/wrappers";
import { registeredSections } from "@ui/settings";
import { Strings } from "@core/i18n";
import { CustomPageRenderer, wrapOnPress } from "./shared";
import { findInReactTree } from "@lib/utils";
import { logger } from "@lib/utils/logger";

const settingConstants = findByPropsLazy("SETTING_RENDERER_CONFIG");
const createListModule = findByPropsLazy("createList");
const SettingsOverviewScreen = findByNameLazy("SettingsOverviewScreen", false);

function useIsFirstRender() {
    let firstRender = false;
    React.useEffect(() => void (firstRender = true), []);
    return firstRender;
}

function createHarnessBoundary() {
    return class HarnessBoundary extends React.Component<{ children: JSX.Element; }, { errored: boolean; generation: number; }> {
        state = { errored: false, generation: 0 };
        static getDerivedStateFromError = () => ({ errored: true });

        componentDidCatch(error: unknown) {
            logger.warn("SettingHookHarness crashed, remounting it", error);
            if (this.state.generation < 3) this.setState(s => ({ errored: false, generation: s.generation + 1 }));
        }

        render() {
            if (this.state.errored) return null;
            return React.cloneElement(this.props.children, { key: this.state.generation });
        }
    };
}

export function patchTabsUI(unpatches: (() => void | boolean)[]) {
    const getRows = () => Object.values(registeredSections)
        .flatMap(sect => sect.map(row => ({
            [row.key]: {
                type: "pressable",
                // title was renamed to useTitle, both are here for compatibility (thanks kmiioo) https://codeberg.org/raincord/rain/pulls/52
                useTitle: row.title,
                title: row.title,
                icon: row.icon,
                IconComponent: () => <TableRow.Icon source={row.icon} />,
                usePredicate: row.usePredicate,
                useTrailing: row.useTrailing,
                onPress: wrapOnPress(row.onPress, null, row.render, row.title()),
                withArrow: true,
                ...row.rawTabsConfig
            }
        })))
        .reduce((a, c) => Object.assign(a, c));

    const origRendererConfig = settingConstants.SETTING_RENDERER_CONFIG;
    let rendererConfigValue = settingConstants.SETTING_RENDERER_CONFIG;

    Object.defineProperty(settingConstants, "SETTING_RENDERER_CONFIG", {
        enumerable: true,
        configurable: true,
        get: () => ({
            ...rendererConfigValue,
            VendettaCustomPage: {
                type: "route",
                useTitle: () => Strings.BUNNY,
                title: () => Strings.BUNNY,
                screen: {
                    route: "VendettaCustomPage",
                    getComponent: () => CustomPageRenderer
                }
            },
            BUNNY_CUSTOM_PAGE: {
                type: "route",
                useTitle: () => Strings.BUNNY,
                title: () => Strings.BUNNY,
                screen: {
                    route: "BUNNY_CUSTOM_PAGE",
                    getComponent: () => CustomPageRenderer
                }
            },
            ...getRows()
        }),
        set: v => rendererConfigValue = v,
    });

    const HarnessBoundary = createHarnessBoundary();
    const wrapHarness = (_: any, ret: JSX.Element) => <HarnessBoundary>{ret}</HarnessBoundary>;
    onJsxCreate("SettingHookHarness", wrapHarness);
    unpatches.push(() => deleteJsxCreate("SettingHookHarness", wrapHarness));

    unpatches.push(() => {
        Object.defineProperty(settingConstants, "SETTING_RENDERER_CONFIG", {
            value: origRendererConfig,
            writable: true,
            get: undefined,
            set: undefined
        });
    });

    try{
        unpatches.push(after("createList", createListModule, function(args, ret) {
            const [config] = args;
        
            if (config?.sections && Array.isArray(config.sections)) {
                const sections = config.sections;
            
                const accountSectionIndex = sections.findIndex((i: any) => i.settings?.includes("ACCOUNT"));
            
                if (accountSectionIndex !== -1) {
                    // Credit to @palmdevs - https://discord.com/channels/1196075698301968455/1243605828783571024/1307940348378742816

                    let index = accountSectionIndex + 1;
                
                    Object.keys(registeredSections).forEach(sect => {
                        const alreadyExists = sections.some((s: any) => s.label === sect);
                        if (!alreadyExists) {
                            sections.splice(index++, 0, {
                                label: sect,
                                title: sect,
                                settings: registeredSections[sect].map(a => a.key)
                            });
                        }
                    });
                }
            }
            return ret;
        },));

    }catch{
    unpatches.push(after("default", SettingsOverviewScreen, (_, ret) => {
        if (useIsFirstRender()) return; // :shrug:

        const { sections } = findInReactTree(ret, i => i.props?.sections).props;
        // Credit to @palmdevs - https://discord.com/channels/1196075698301968455/1243605828783571024/1307940348378742816
        let index = -~sections.findIndex((i: any) => i.settings.includes("ACCOUNT")) || 1;

        Object.keys(registeredSections).forEach(sect => {
            sections.splice(index++, 0, {
                label: sect,
                title: sect,
                settings: registeredSections[sect].map(a => a.key)
            });
        });
    }));
    }
};
