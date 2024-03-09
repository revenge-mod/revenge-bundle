import type { anyFunction } from "@/def";
import patchForumPost from "@ui/quickInstall/forumPost";
import patchUrl from "@ui/quickInstall/url";

export default function initQuickInstall() {
  const patches = new Array<anyFunction>();

  patches.push(patchForumPost());
  patches.push(patchUrl());

  return () => patches.forEach((p) => p());
}
