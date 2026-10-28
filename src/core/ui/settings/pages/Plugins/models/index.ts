import { Author } from "@lib/addons/types";
import { ImageSourcePropType } from "react-native";

interface Badge {
    source: ImageSourcePropType;
    color?: string;
    onPress?: () => void;
}

export interface UnifiedPluginModel {
    id: string;
    name: string;
    description?: string;
    authors?: Author[];
    icon?: string;
    getBadges(): Badge[];
    isEnabled(): boolean;
    usePluginState(): void;
    isInstalled(): boolean;
    toggle(start: boolean): Promise<void> | void;
    resolveSheetComponent(): Promise<{ default: React.ComponentType<any>; }>;
    getPluginSettingsComponent(): React.ComponentType<any> | null | undefined;
}
