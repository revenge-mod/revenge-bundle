import { ReactNative as RN } from "@metro/common";
import { SummaryProps } from "@types";
import { getAssetIDByName } from "@ui/assets";
import { Forms } from "@ui/components";

export default function Summary({
  label,
  icon,
  noPadding = false,
  noAnimation = false,
  children,
}: SummaryProps) {
  const { FormRow, FormDivider } = Forms;
  const [hidden, setHidden] = React.useState(true);

  return (
    <>
      <FormRow
        label={label}
        leading={icon && <FormRow.Icon source={getAssetIDByName(icon)} />}
        trailing={
          <FormRow.Arrow
            style={{ transform: [{ rotate: `${hidden ? 180 : 90}deg` }] }}
          />
        }
        onPress={() => {
          setHidden(!hidden);
          if (!noAnimation)
            RN.LayoutAnimation.configureNext(
              RN.LayoutAnimation.Presets.easeInEaseOut
            );
        }}
      />
      {!hidden && (
        <>
          <FormDivider />
          <RN.View style={!noPadding && { paddingHorizontal: 15 }}>
            {children}
          </RN.View>
        </>
      )}
    </>
  );
}
