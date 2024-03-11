import type { RowVariant } from "@/def";
import { stylesheet } from "@/lib/metro/common";
import { findByProps } from "@/lib/metro/filters";
import { without } from "@/lib/utils";
import { ReactNative as RN } from "@lib/preinit";
import type {
  ImageSourcePropType,
  TextProps,
  ViewProps,
  ViewStyle
} from "react-native";
import { Forms, Redesign } from ".";
import { semanticColors } from "../color";

interface RowProps {
  label: React.ReactNode;
  subLabel?: React.ReactNode;
  icon?: ImageSourcePropType;
  disabled?: boolean;
  variant?: RowVariant;
  trailing?: React.ReactNode;
  style?: ViewStyle;
  start?: boolean;
  end?: boolean;
}

const { useInMainTabsExperiment } = findByProps(
  "useInMainTabsExperiment",
  "isInMainTabsExperiment"
);

// ...

const addStyle = (style: any | undefined, obj: object) => {
  if (!style) return obj;
  return [...(Array.isArray(style) ? style : [style]), obj];
};

export const useRedesign = (
  component: keyof typeof Redesign,
  experiment = true
) => (experiment ? useInMainTabsExperiment() : true) && component in Redesign;
export const useRedesignStyle = () => useInMainTabsExperiment();

const makeRedesignProps = (props: RowProps): any => ({
  ...without(props, "icon"),
  icon: props.icon && (
    <Redesign.TableRow.Icon source={props.icon} variant={props.variant} />
  )
});

const makeOldProps = ({
  label,
  subLabel,
  disabled,
  variant,
  style,
  icon,
  trailing
}: RowProps): any => {
  const { FormRow } = Forms;

  const styles = stylesheet.createThemedStyleSheet({
    arrow: {
      width: 8,
      height: 24,
      tintColor: semanticColors.INTERACTIVE_NORMAL,
      marginStart: 14
    },
    danger: {
      color: semanticColors.TEXT_DANGER,
      tintColor: semanticColors.TEXT_DANGER
    }
  });

  return {
    label: label,
    subLabel: subLabel,
    disabled: disabled,
    style: variant === "danger" ? addStyle(style, styles.danger) : style,
    leading: icon && (
      <FormRow.Icon
        source={icon}
        style={variant === "danger" && styles.danger}
      />
    ),
    trailing: trailing
  };
};

// Rows

type TableRowProps = RowProps & { arrow?: boolean; onPress?: () => void };
type TableRowIconProps = {
  source: ImageSourcePropType;
  variant?: string;
};
type TableRowTrailingTextProps = { text: React.ReactNode };

const _TableRow = ((props: TableRowProps) => {
  const { FormRow } = Forms;

  if (useRedesign("TableRow"))
    return <Redesign.TableRow {...makeRedesignProps(props)} />;
  return (
    <FormRow
      {...without(makeOldProps(props), "trailing")}
      trailing={
        <>
          {props.trailing}
          {props.arrow && <FormRow.Arrow />}
        </>
      }
      onPress={props.onPress}
    />
  );
}) as {
  (props: TableRowProps): React.ReactElement;
  Icon: (props: TableRowIconProps) => React.ReactElement;
  Arrow: () => React.ReactElement;
  TrailingText: (props: TableRowTrailingTextProps) => React.ReactElement;
};

export const TableRow = Object.assign(_TableRow, {
  Icon: function TableRowIcon(props: TableRowIconProps) {
    const { FormRow } = Forms;

    const Component = useRedesign("TableRow")
      ? Redesign.TableRow.Icon
      : FormRow.Icon;

    return <Component {...props} />;
  },
  Arrow: function Arrow() {
    const { FormRow } = Forms;

    const Component = useRedesign("TableRow")
      ? Redesign.TableRow.Arrow
      : FormRow.Arrow;

    return <Component />;
  },
  TrailingText: function TrailingText({ text }: TableRowTrailingTextProps) {
    const { TextStyleSheet } = findByProps("TextStyleSheet");

    const styles = stylesheet.createThemedStyleSheet({
      text: {
        ...TextStyleSheet["text-md/medium"],
        color: semanticColors.TEXT_MUTED
      }
    });

    if (useRedesign("TableRow"))
      return <Redesign.TableRow.TrailingText text={text} />;
    return <RN.Text style={styles.text}>{text}</RN.Text>;
  }
});

export function TableSwitchRow(
  props: RowProps & {
    value?: boolean;
    onValueChange: (value: boolean) => void;
  }
) {
  const { FormSwitchRow } = Forms;

  if (useRedesign("TableSwitchRow"))
    return <Redesign.TableSwitchRow {...makeRedesignProps(props)} />;
  return (
    <FormSwitchRow
      {...makeOldProps(props)}
      value={props.value}
      onValueChange={props.onValueChange}
    />
  );
}

export function TableCheckboxRow(
  props: RowProps & {
    checked?: boolean;
    onPress?: (checked: boolean) => void;
  }
) {
  const { FormCheckboxRow } = Forms;

  if (useRedesign("TableCheckboxRow"))
    return <Redesign.TableCheckboxRow {...makeRedesignProps(props)} />;
  return (
    <FormCheckboxRow
      {...makeOldProps(props)}
      selected={props.checked}
      onPress={props.onPress}
    />
  );
}

export function TableRadioRow(
  props: RowProps & {
    value?: string;
    selected?: string;
    onPress?: () => void;
  }
) {
  const { FormRadioRow } = Forms;

  if (useRedesign("TableRadioRow"))
    return <Redesign.TableRadioRow {...makeRedesignProps(props)} />;
  return (
    <FormRadioRow
      {...makeOldProps(props)}
      selected={props.selected}
      onPress={props.onPress}
    />
  );
}

// Misc

export function TableInput(props: {
  label: string;
  /** Description will only appear in Redesign components */
  description?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  returnKeyType?: "search" | "done";
  error?: string;
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  /** Encases the TableInput inside a TableRow (if available) */
  inRow?: boolean;
  /** Leading text will only appear in Redesign components */
  leadingText?: string;
  /** Leading icon will only appear in Redesign components */
  leadingIcon?: React.FC<any>;
  /** Trailing text will only appear in Redesign components */
  trailingText?: string;
  /** Trailing icon will only appear in Redesign components */
  trailingIcon?: React.FC<any>;
  onChange?: (value: string) => void;
  onSubmitEditing?: () => void;
}) {
  const { FormInput } = Forms;

  if (useRedesign("TextInput")) {
    const el = (
      <Redesign.TextInput
        {...without(props, "disabled", "error", "value")}
        isDisabled={props.disabled}
        status={props.error ? "error" : "default"}
        errorMessage={props.error}
        // im sure this is fineeeee...
        defaultValue={props.value}
      />
    );

    if (props.inRow && useRedesign("TableRow", false))
      return <Redesign.TableRow label={el} />;
    return el;
  }

  return (
    <FormInput
      {...without(
        props,
        "description",
        "leadingText",
        "leadingIcon",
        "trailingText",
        "trailingIcon",
        "label"
      )}
      title={props.label.toUpperCase()}
    />
  );
}

export function TableGroup(props: React.PropsWithChildren<{ title: string }>) {
  const { FormSection } = Forms;

  if (useRedesign("TableRowGroup"))
    return (
      <RN.View style={{ paddingTop: 24 }}>
        <Redesign.TableRowGroup {...props} />
      </RN.View>
    );

  return <FormSection {...props} />;
}
