import { findInTree } from "@lib/utils";
import type { SearchFilter } from "@types";

export default (tree: { [key: string]: any }, filter: SearchFilter): any =>
  findInTree(tree, filter, {
    walkable: ["props", "children", "child", "sibling"]
  });
