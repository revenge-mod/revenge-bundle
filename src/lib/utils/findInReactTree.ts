import { findInTree } from "@lib/utils";
import type { SearchFilter } from "@lib/utils/findInTree";

export default function findInReactTree<T = any>(tree: { [key: string]: any }, filter: SearchFilter): T {
    return findInTree(tree, filter, { walkable: ["props", "children", "child", "sibling"] });
}
