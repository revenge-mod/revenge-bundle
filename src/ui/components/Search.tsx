import { SearchProps } from "@types";
import { ReactNative as RN, stylesheet } from "@metro/common";
import { findByName } from "@metro/filters";
import { Redesign } from ".";
import { getAssetIDByName } from "../assets";
import { semanticColors } from "../color";

const Search = findByName("StaticSearchBarContainer");

const styles = stylesheet.createThemedStyleSheet({
    search: {
        margin: 0,
        padding: 0,
        borderBottomWidth: 0,
        backgroundColor: "none",
    },
    redesignSearch: {
        paddingHorizontal: 8,
        marginBottom: 4
    },
    icon: {
        width: 16,
        height: 16,
        tintColor: semanticColors.INTERACTIVE_NORMAL,
    },
});

export default ({ onChangeText, placeholder, style }: SearchProps) => {
    if (Redesign.TextInput)
        return (
            <Redesign.TextInput
                style={[styles.redesignSearch, style]}
                size="sm"
                placeholder={placeholder}
                onChange={onChangeText}
                isClearable={true}
                leadingIcon={() => (
                    <RN.Image
                        source={getAssetIDByName("MagnifyingGlassIcon")}
                        style={styles.icon}
                    />
                )}
                returnKeyType="search"
            />
        );
        else
            return (
                <Search
                    style={[styles.search, style]}
                    placeholder={placeholder}
                    onChangeText={onChangeText}
                />
            );
}