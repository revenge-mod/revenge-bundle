import settings from "@lib/settings";
import { useProxy } from "@lib/storage";
import { ReactNative as RN } from "@metro/common";
import { ErrorBoundary, HelpMessage, Search } from "@ui/components";
import type { CardWrapper } from "@ui/settings/components/Card";

interface AddonPageProps<T> {
  items: Record<string, T & { id: string }>;
  safeModeMessage: string;
  safeModeExtras?: JSX.Element | JSX.Element[];
  card: React.ComponentType<CardWrapper<T>>;
  keyGetter: (item: T) => (string | undefined)[];
}

export default function AddonPage<T>({
  items,
  safeModeMessage,
  safeModeExtras,
  card: CardComponent,
  keyGetter
}: AddonPageProps<T>) {
  useProxy(settings);
  useProxy(items);
  const [search, setSearch] = React.useState("");

  return (
    <ErrorBoundary>
      <RN.FlatList
        ListHeaderComponent={
          <>
            {settings.safeMode?.enabled && (
              <RN.View style={{ marginBottom: 10 }}>
                <HelpMessage messageType={0}>{safeModeMessage}</HelpMessage>
                {safeModeExtras}
              </RN.View>
            )}
            <Search
              style={{ marginBottom: 10 }}
              onChangeText={(v: string) => setSearch(v.toLowerCase())}
              placeholder="Search"
            />
          </>
        }
        ListFooterComponent={<RN.View style={{ height: 48 }} />}
        style={{ paddingHorizontal: 10, paddingTop: 10 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        data={Object.values(items).filter((i) =>
          keyGetter(i).some((x) => x?.toLowerCase().includes(search))
        )}
        renderItem={({ item, index }) => (
          <CardComponent item={item} index={index} highlight={search} />
        )}
      />
    </ErrorBoundary>
  );
}
