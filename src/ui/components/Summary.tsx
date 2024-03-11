import { ReactNative as RN } from "@metro/common";
import type { SummaryProps } from "@types";
import { getAssetIDByName } from "@ui/assets";
import { TableRow } from "./Table";

export default function Summary({
  label,
  icon,
  noPadding = false,
  noAnimation = false,
  children
}: SummaryProps) {
  const [hidden, setHidden] = React.useState(true);

  return (
    <>
      <TableRow
        label={label}
        icon={icon ? getAssetIDByName(icon) : undefined}
        trailing={<TableRow.Arrow />}
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
          <RN.View style={!noPadding && { paddingHorizontal: 15 }}>
            {children}
          </RN.View>
        </>
      )}
    </>
  );
}
