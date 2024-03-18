import {
  DISCORD_SERVER_ID,
  DISCORD_REVENGE_SERVER_ID,
  THEMES_REVENGE_CHANNEL_ID,
  PLUGINS_REVENGE_CHANNEL_ID,
  HTTP_REGEX_MULTI,
  PLUGINS_CHANNEL_ID,
  PROXY_PREFIXES,
  THEMES_CHANNEL_ID
} from "@lib/constants";
import { after } from "@lib/patcher";
import { installPlugin } from "@lib/plugins";
import { installTheme } from "@lib/themes";
import { findInReactTree } from "@lib/utils";
import { findByName, findByProps } from "@metro/filters";
import { getAssetIDByName } from "@ui/assets";
import { Forms } from "@ui/components";
import { showToast } from "@ui/toasts";

const ForumPostLongPressActionSheet = findByName(
  "ForumPostLongPressActionSheet",
  false
);
const { FormRow, FormIcon } = Forms;

const { useFirstForumPostMessage } = findByProps("useFirstForumPostMessage");
const { hideActionSheet } = findByProps("openLazy", "hideActionSheet");

export default () =>
  after("default", ForumPostLongPressActionSheet, ([{ thread }], res) => {
    if (thread.guild_id !== DISCORD_SERVER_ID);
    else if (thread.guild_id !== DISCORD_REVENGE_SERVER_ID);

    // Determine what type of addon this is.
    let postType: "Plugin" | "Theme";
    if (thread.parent_id === PLUGINS_CHANNEL_ID) {
      postType = "Plugin";
    } else if (thread.parent_id === PLUGINS_REVENGE_CHANNEL_ID) {
      postType = "Plugin";
    } else if (
      thread.parent_id === THEMES_CHANNELS_ID &&
      window.__vendetta_loader?.features.themes
    ) {
      postType = "Theme";
    } else if (
      thread.parent_id === THEMES_REVENGE_CHANNEL_ID &&
      window.__vendetta_loader?.features.themes
    ) {
      postType = "Theme";
    } else return;

    const { firstMessage } = useFirstForumPostMessage(thread);

    let urls = firstMessage?.content?.match(HTTP_REGEX_MULTI);
    if (!urls) return;

    if (postType === "Plugin") {
      urls = urls.filter((url: string) =>
        PROXY_PREFIXES.some((prefix) => url.startsWith(prefix))
      );
    } else {
      urls = urls.filter((url: string) => url.endsWith(".json"));
    }

    const url = urls[0];
    if (!url) return;

    const actions = findInReactTree(res, (t) => t?.[0]?.key);
    const ActionsSection = actions[0].type;

    actions.unshift(
      <ActionsSection key="install">
        <FormRow
          leading={
            <FormIcon
              style={{ opacity: 1 }}
              source={getAssetIDByName("ic_download_24px")}
            />
          }
          label={`Install ${postType}`}
          onPress={() =>
            (postType === "Plugin" ? installPlugin : installTheme)(url)
              .then(() => {
                showToast(
                  `Successfully installed ${thread.name}`,
                  getAssetIDByName("Check")
                );
              })
              .catch((e: Error) => {
                showToast(e.message, getAssetIDByName("Small"));
              })
              .finally(() => hideActionSheet())
          }
        />
      </ActionsSection>
    );
  });
