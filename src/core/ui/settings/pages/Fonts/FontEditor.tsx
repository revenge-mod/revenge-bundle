import { formatString, Strings } from "@core/i18n";
import { Observable } from "@gullerya/object-observer";
import FontManager from "@lib/addons/fonts/FontManager";
import { FontManifest, OldFontDefinition } from "@lib/addons/fonts/types";
import ColorManager from "@lib/addons/themes/colors/ColorManager";
import { findAssetId } from "@lib/api/assets";
import { useObservable } from "@lib/api/storage";
import { safeFetch } from "@lib/utils";
import { NavigationNative } from "@metro/common";
import { ActionSheet, BottomSheetTitleHeader, Button, IconButton, Stack, TableRow, TableRowGroup, Text, TextInput } from "@metro/common/components";
import { findByPropsLazy } from "@metro/wrappers";
import { ErrorBoundary } from "@ui/components";
import { useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

const actionSheet = findByPropsLazy("hideActionSheet");

function guessFontName(urls: string[]) {
    const fileNames = urls.map(url => {
        const { pathname } = new URL(url);
        const fileName = pathname.replace(/\.[^/.]+$/, "");
        return fileName.split("/").pop();
    }).filter(Boolean) as string[];

    const shortest = fileNames.reduce((shortest, name) => {
        return name.length < shortest.length ? name : shortest;
    }, fileNames[0] || "");

    return shortest?.replace(/-[A-Za-z]*$/, "") || null;
}

function RevengeFontsExtractor({ fonts, setName }: {
    fonts: Record<string, string>;
    setName: (name: string) => void;
}) {
    const currentTheme = ColorManager.getCurrentManifest();
    // @ts-ignore
    const themeFonts = currentTheme!.fonts as Record<string, string>;

    const [fontName, setFontName] = useState(guessFontName(Object.values(themeFonts)));
    const [error, setError] = useState<string | undefined>(undefined);

    return <View style={{ padding: 8, paddingBottom: 16, gap: 12 }}>
        <TextInput
            autoFocus
            size="md"
            label={Strings.FONT_NAME}
            value={fontName}
            placeholder={fontName || "Whitney"}
            onChange={setFontName}
            errorMessage={error}
            state={error ? "error" : void 0}
        />
        <Text variant="text-xs/normal" color="text-muted">
            {formatString("THEME_EXTRACTOR_DESC", {
                fonts: Object.keys(themeFonts).join(Strings.SEPARATOR)
            })}
        </Text>
        <Button
            size="md"
            variant="primary"
            text={Strings.EXTRACT}
            disabled={!fontName}
            onPress={() => {
                if (!fontName) return;
                try {
                    FontManager.validate({
                        spec: 3,
                        id: fontName.toLowerCase(),
                        display: { name: fontName },
                        main: themeFonts
                    }, null);

                    setName(fontName);
                    Object.assign(fonts, themeFonts);
                    actionSheet.hideActionSheet();
                } catch (e) {
                    setError(String(e));
                }
            }}
        />
    </View>;
}

function JsonFontImporter({ fonts, setName, setId, setSource }: {
    fonts: Record<string, string>;
    setName: (name: string) => void;
    setId: (id: string) => void;
    setSource: (source: string) => void;
}) {
    const [fontLink, setFontLink] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    return <View style={{ padding: 8, paddingBottom: 16, gap: 12 }}>
        <TextInput
            autoFocus
            size="md"
            label={"Font Link"}
            value={fontLink}
            placeholder={"https://link.to/font/pack.json"}
            onChange={setFontLink}
            errorMessage={error}
            state={error ? "error" : void 0}
        />
        <Button
            size="md"
            variant="primary"
            text={"Import"}
            disabled={!fontLink || saving}
            loading={saving}
            onPress={() => {
                setSaving(true);

                (async () => {
                    const res = await safeFetch(fontLink, { cache: "no-store" });
                    const json = await res.json() as FontManifest | OldFontDefinition;
                    FontManager.validate(json, fontLink);

                    setId(json.spec === 3 ? json.id : json.name.toLowerCase());
                    setName(json.spec === 3 ? json.display.name : json.name);
                    setSource(fontLink);

                    Object.assign(fonts, json.main);
                })()
                    .then(() => actionSheet.hideActionSheet())
                    .catch(e => setError(String(e)))
                    .finally(() => setSaving(false));

            }}
        />
    </View>;
}

function EntryEditorActionSheet(props: {
    fontEntries: Record<string, string>;
    name: string;
}) {
    const [familyName, setFamilyName] = useState<string>(props.name);
    const [fontUrl, setFontUrl] = useState<string>(props.fontEntries[props.name]);

    return <View style={{ padding: 8, paddingBottom: 16, gap: 12 }}>
        <TextInput
            autoFocus
            size="md"
            label={"Family Name (to override)"}
            value={familyName}
            placeholder={"ggsans-Bold"}
            onChange={setFamilyName}
        />
        <TextInput
            size="md"
            label={"Font URL"}
            value={fontUrl}
            placeholder={"https://link.to/the/font.ttf"}
            onChange={setFontUrl}
        />
        <Button
            size="md"
            variant="primary"
            text={"Apply"}
            onPress={() => {
                delete props.fontEntries[props.name];
                props.fontEntries[familyName] = fontUrl;
            }}
        />
    </View>;
}

function promptActionSheet(
    Component: any,
    fontEntries: Record<string, string>,
    props: any
) {
    actionSheet.openLazy(
        () => <ErrorBoundary>
            <ActionSheet>
                <BottomSheetTitleHeader title="Import Font" />
                <Component fonts={fontEntries} {...props} />
            </ActionSheet>
        </ErrorBoundary>,
        "FontEditorActionSheet"
    );
}

function NewEntryRow({ fontEntry }: { fontEntry: Record<string, string>; }) {
    const nameRef = useRef<string>();
    const urlRef = useRef<string>();

    const [nameSet, setNameSet] = useState(false);
    const [error, setError] = useState<string | undefined>();

    return <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-start" }}>
        <View style={{ flex: 1 }}>
            <TextInput
                isRound
                size="md"
                label={nameSet ? nameRef.current : void 0}
                placeholder={nameSet ? "https://path.to/the/file.ttf" : "PostScript name (e.g. ggsans-Bold)"}
                leadingIcon={() => nameSet ? null : <TableRow.Icon source={findAssetId("PlusSmallIcon")} />}
                leadingText={nameSet ? nameRef.current : ""}
                onChange={(text: string) => (nameSet ? urlRef : nameRef).current = text}
                errorMessage={error}
                state={error ? "error" : void 0}
            />
        </View>
        {nameSet && <IconButton
            size="md"
            variant="secondary"
            onPress={() => {
                nameRef.current = "";
                setNameSet(false);
            }}
            icon={findAssetId("TrashIcon")}
        />}
        <IconButton
            size="md"
            variant="primary"
            onPress={() => {
                if (!nameSet && nameRef.current) {
                    setNameSet(true);
                } else if (nameSet && nameRef.current && urlRef.current) {
                    try {
                        const parsedUrl = new URL(urlRef.current);
                        if (!parsedUrl.protocol || !parsedUrl.host) {
                            throw "Invalid URL";
                        }

                        fontEntry[nameRef.current] = urlRef.current;
                        nameRef.current = undefined;
                        urlRef.current = undefined;
                        setNameSet(false);
                    } catch (e) {
                        setError(String(e));
                    }
                }
            }}
            icon={findAssetId(nameSet ? "PlusSmallIcon" : "ArrowLargeRightIcon")}
        />
    </View>;
}

export default function FontEditor(props: { id?: string; }) {
    const [id, setId] = useState<string | undefined>(props.id);
    const [name, setName] = useState<string | undefined>("");
    const [source, setSource] = useState<string>();
    const [importing, setIsImporting] = useState<boolean>(false);

    const fontEntries = useMemo(() => {
        return Observable.from(props.id ? { ...FontManager.getManifest(props.id).main } : {});
    }, [props.id]);

    useObservable([fontEntries]);

    const navigation = NavigationNative.useNavigation();

    return <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
        <Stack style={{ paddingVertical: 24, paddingHorizontal: 12 }} spacing={12}>
            {!props.id
                ? <TableRowGroup title="Import">
                    {/** @ts-ignore */}
                    {ColorManager.getCurrentManifest()?.fonts && <TableRow
                        label={Strings.LABEL_EXTRACT_FONTS_FROM_THEME}
                        subLabel={Strings.DESC_EXTRACT_FONTS_FROM_THEME}
                        icon={<TableRow.Icon source={findAssetId("HammerIcon")} />}
                        onPress={() => promptActionSheet(RevengeFontsExtractor, fontEntries, { setName })}
                    />}
                    <TableRow
                        label={"Import font entries from a link"}
                        subLabel={"Directly import from a link with a pre-configured JSON file"}
                        icon={<TableRow.Icon source={findAssetId("LinkIcon")} />}
                        onPress={() => promptActionSheet(JsonFontImporter, fontEntries, { setName, setSource, setId })}
                    />
                </TableRowGroup>
                : <TableRowGroup title="Actions">
                    <TableRow
                        label={"Refetch fonts from source"}
                        icon={<TableRow.Icon source={findAssetId("RetryIcon")} />}
                        onPress={async () => {
                            const { sourceUrl } = FontManager.traces[props.id!];
                            if (!sourceUrl) return;

                            await FontManager.uninstall(props.id!);
                            await FontManager.install(sourceUrl);
                            navigation.goBack();
                        }}
                    />
                    <TableRow
                        label="Delete font pack"
                        icon={<TableRow.Icon source={findAssetId("TrashIcon")} />}
                        onPress={() => FontManager.uninstall(props.id!).then(() => navigation.goBack())}
                    />
                </TableRowGroup>}
            <TextInput
                size="lg"
                value={id}
                label="Font ID"
                placeholder="whitney"
                onChange={setId}
            />
            <TextInput
                size="lg"
                value={name}
                label={Strings.FONT_NAME}
                placeholder="Whitney"
                onChange={setName}
            />
            <TableRowGroup title="Font Entries">
                {Object.entries(fontEntries).map(([name, url]) => {
                    return <TableRow
                        label={name}
                        subLabel={url}
                        trailing={<Stack spacing={2} direction="horizontal">
                            <IconButton
                                size="sm"
                                variant="secondary"
                                icon={findAssetId("PencilIcon")}
                                onPress={() => promptActionSheet(EntryEditorActionSheet, fontEntries, {
                                    name,
                                    fontEntries,
                                })}
                            />
                            <IconButton
                                size="sm"
                                variant="secondary"
                                icon={findAssetId("TrashIcon")}
                                onPress={() => delete fontEntries[name]}
                            />
                        </Stack>}
                    />;
                })}
                <TableRow label={<NewEntryRow fontEntry={fontEntries} />} />
            </TableRowGroup>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", bottom: 0, left: 0 }}>
                <Button
                    size="lg"
                    loading={importing}
                    disabled={importing || !name || !id || Object.keys(fontEntries).length === 0}
                    variant="primary"
                    text={props.id ? "Save" : "Import"}
                    onPress={async () => {
                        if (!name) return;

                        setIsImporting(true);

                        if (!props.id) {
                            FontManager.saveLocally({
                                spec: 3,
                                id: name,
                                main: fontEntries,
                                display: { name }
                            }, { markAsEdited: false })
                                .then(() => navigation.goBack())
                                .finally(() => setIsImporting(false));
                        } else {
                            FontManager.saveLocally({
                                ...FontManager.getManifest(props.id),
                                id: id!,
                                main: fontEntries,
                                display: { ...FontManager.getManifest(props.id).display, name }
                            }, { markAsEdited: true })
                                .then(() => navigation.goBack())
                                .finally(() => setIsImporting(false));

                            setIsImporting(false);
                            navigation.goBack();
                        }
                    }}
                    icon={findAssetId(props.id ? "toast_image_saved" : "DownloadIcon")}
                    style={{ marginLeft: 8 }}
                />
            </View>
        </Stack>
    </ScrollView>;
}
