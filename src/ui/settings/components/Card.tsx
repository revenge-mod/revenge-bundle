import { ESCAPE_REGEX } from "@lib/constants";
import { ReactNative as RN, stylesheet } from "@metro/common";
import { findByProps } from "@metro/filters";
import { getAssetIDByName } from "@ui/assets";
import { rawColors, semanticColors } from "@ui/color";
import { Forms } from "@ui/components";

const { FormRow, FormSwitch, FormRadio } = Forms;
const { hideActionSheet } = findByProps("openLazy", "hideActionSheet");
const { showSimpleActionSheet } = findByProps("showSimpleActionSheet");

// TODO: These styles work weirdly. iOS has cramped text, Android with low DPI probably does too. Fix?
const { TextStyleSheet } = findByProps("TextStyleSheet");
const styles = stylesheet.createThemedStyleSheet({
  card: {
    backgroundColor: semanticColors?.BACKGROUND_SECONDARY,
    borderRadius: 12,
  },
  header: {
    padding: 0,
    backgroundColor: semanticColors?.BACKGROUND_TERTIARY,
    borderRadius: 12,
  },
  headerChildren: {
    flexDirection: "column",
    justifyContent: "center",
  },
  headerLabel: {
    color: semanticColors?.TEXT_NORMAL,
    ...TextStyleSheet["text-md/semibold"],
  },
  headerSubtitle: {
    color: semanticColors?.TEXT_MUTED,
    ...TextStyleSheet["text-sm/semibold"],
  },
  actions: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  icon: {
    width: 22,
    height: 22,
    marginLeft: 5,
    tintColor: semanticColors?.INTERACTIVE_NORMAL,
  },
  iconContainer: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: semanticColors?.BACKGROUND_ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  smallerIcon: {
    width: 22,
    height: 22,
    tintColor: semanticColors?.INTERACTIVE_NORMAL,
  },
  highlight: {
    backgroundColor: "#F0" + rawColors.YELLOW_300.slice(1),
  },
});

interface Action {
  icon: string;
  onPress: () => void;
}

interface OverflowAction extends Action {
  label: string;
  isDestructive?: boolean;
}

export interface CardWrapper<T> {
  item: T;
  index: number;
  highlight: string;
}

interface CardProps {
  index?: number;
  headerLabel: string;
  headerSublabel?: string;
  headerIcon?: string;
  toggleType?: "switch" | "radio";
  toggleValue?: boolean;
  onToggleChange?: (v: boolean) => void;
  descriptionLabel?: string;
  actions?: Action[];
  overflowTitle?: string;
  overflowActions?: OverflowAction[];
  highlight: string;
}

const highlighter = (str: string, highlight: string) => {
  if (!highlight) return str;

  return str
    .split(
      new RegExp("(" + highlight.replace(ESCAPE_REGEX, "\\$&") + ")", "gi")
    )
    .map((x, i) =>
      i % 2 === 1 ? <RN.Text style={styles.highlight}>{x}</RN.Text> : x
    );
};

export default function Card(props: CardProps) {
  let pressableState = props.toggleValue ?? false;

  return (
    <RN.View style={[styles.card, { marginTop: props.index !== 0 ? 10 : 0 }]}>
      <FormRow
        style={styles.header}
        label={
          <RN.View style={styles.headerChildren}>
            <RN.Text style={styles.headerLabel}>
              {highlighter(props.headerLabel, props.highlight)}
            </RN.Text>
            {props.headerSublabel && (
              <RN.Text style={styles.headerSubtitle}>
                {highlighter(props.headerSublabel, props.highlight)}
              </RN.Text>
            )}
          </RN.View>
        }
        leading={
          props.headerIcon && (
            <RN.View style={styles.iconContainer}>
              <RN.Image
                source={getAssetIDByName(props.headerIcon)}
                style={styles.smallerIcon}
              />
            </RN.View>
          )
        }
        trailing={
          props.toggleType &&
          (props.toggleType === "switch" ? (
            <FormSwitch
              style={RN.Platform.OS === "android" && { marginVertical: -15 }}
              value={props.toggleValue}
              onValueChange={props.onToggleChange}
            />
          ) : (
            <RN.Pressable
              onPress={() => {
                pressableState = !pressableState;
                props.onToggleChange?.(pressableState);
              }}
            >
              <FormRadio selected={props.toggleValue} />
            </RN.Pressable>
          ))
        }
      />
      <FormRow
        label={
          props.descriptionLabel &&
          highlighter(props.descriptionLabel, props.highlight)
        }
        trailing={
          <RN.View style={styles.actions}>
            {props.overflowActions && (
              <RN.TouchableOpacity
                onPress={() =>
                  showSimpleActionSheet({
                    key: "CardOverflow",
                    header: {
                      title: props.overflowTitle,
                      icon: props.headerIcon && (
                        <FormRow.Icon
                          style={{ marginRight: 8 }}
                          source={getAssetIDByName(props.headerIcon)}
                        />
                      ),
                      onClose: () => hideActionSheet(),
                    },
                    options: props.overflowActions?.map((i) => ({
                      ...i,
                      icon: getAssetIDByName(i.icon),
                    })),
                  })
                }
              >
                <RN.Image
                  style={styles.icon}
                  source={getAssetIDByName("ic_more_24px")}
                />
              </RN.TouchableOpacity>
            )}
            {props.actions?.map(({ icon, onPress }) => (
              <RN.TouchableOpacity onPress={onPress}>
                <RN.Image style={styles.icon} source={getAssetIDByName(icon)} />
              </RN.TouchableOpacity>
            ))}
          </RN.View>
        }
      />
    </RN.View>
  );
}
