import { SearchProps } from "@types";
import { stylesheet } from "@metro/common";
import { findByName } from "@metro/filters";

const Search = findByName("StaticSearchBarContainer");

const styles = stylesheet.createThemedStyleSheet({
    search: {
        margin: 0,
        padding: 0,
        borderBottomWidth: 0,
        backgroundColor: "none",
    }
});

export default ({ onChangeText, placeholder, style }: SearchProps) => <Search style={[styles.search, style]} placeholder={placeholder} onChangeText={onChangeText} />