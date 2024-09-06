import { constants, tokens } from "@metro/common";
import { createStyles } from "@ui/styles";
import { Platform, ScrollView, Text, TextInput, TextStyle, ViewStyle } from "react-native";

export interface CodeblockProps {
    selectable?: boolean;
    style?: TextStyle;
    backgroundStyle?: ViewStyle;
    children?: string;
}

const useStyles = createStyles({
    background: {
        backgroundColor: tokens.colors.BACKGROUND_SECONDARY,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: tokens.colors.BACKGROUND_TERTIARY,
        padding: 10,
    },
    codeBlock: {
        fontFamily: constants.Fonts.CODE_NORMAL,
        fontSize: 12,
        textAlignVertical: "center",
        color: tokens.colors.TEXT_NORMAL,
    },
});

// iOS doesn't support the selectable property on RN.Text...
const InputBasedCodeblock = ({ style, children }: CodeblockProps) => <TextInput editable={false} multiline style={[useStyles().codeBlock, style && style]} value={children} />;
const TextBasedCodeblock = ({ selectable, style, children }: CodeblockProps) => <Text selectable={selectable} style={[useStyles().codeBlock, style && style]}>{children}</Text>;

export default function Codeblock({ selectable, style, backgroundStyle, children }: CodeblockProps) {
    const styles = useStyles();
    if (!selectable) {
        return <ScrollView style={[backgroundStyle, styles.background]}>
            <TextBasedCodeblock style={style} children={children} />
        </ScrollView>;
    } else {
        return <ScrollView style={[backgroundStyle, styles.background]}>
            {Platform.select({
                ios: <InputBasedCodeblock style={style} children={children} />,
                default: <TextBasedCodeblock style={style} children={children} selectable />,
            })}
        </ScrollView>;
    }

}
