import { Plugin } from "@types";
import { useProxy } from "@lib/storage";
import { plugins } from "@lib/plugins";
import settings from "@lib/settings";
import AddonPage from "@ui/settings/components/AddonPage";
import PluginCard from "@ui/settings/components/PluginCard";
import { lang } from "..";

export default function Plugins() {
    useProxy(settings)

    return (
        <AddonPage<Plugin>
            items={plugins}
            safeModeMessage={lang.format("plugin.safemode", {})}
            card={PluginCard}
            keyGetter={(i) =>
                [
                    i.id,
                    i.manifest.name,
                    i.manifest.description,
                    i.manifest.authors?.map((x) => x.name),
                ].flat()
            }
        />
    )
}