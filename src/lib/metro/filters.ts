import { MetroModules, PropsFinder, PropsFinderAll } from "@types";

// Metro require
declare const __r: (moduleId: number) => any;

// Internal Metro error reporting logic
const originalHandler = window.ErrorUtils.getGlobalHandler();

// Function to blacklist a module, preventing it from being searched again
const blacklist = (id: number) =>
  Object.defineProperty(window.modules, id, {
    value: window.modules[id],
    enumerable: false,
    configurable: true,
    writable: true,
  });

// Blacklist any "bad-actor" modules, e.g. the dreaded null proxy, the window itself, or undefined modules
for (const key in window.modules) {
  const id = Number(key);
  const module = window.modules[id]?.publicModule?.exports;

  if (!module || module === window || module["proxygone"] === null) {
    blacklist(id);
    continue;
  }
}

// Function to filter through modules
const filterModules =
  (modules: MetroModules, single = false) =>
  (filter: (m: any) => boolean) => {
    const found = [];

    for (const key in modules) {
      const id = Number(key);
      const module = modules[id]?.publicModule?.exports;

      // HACK: Override the function used to report fatal JavaScript errors (that crash the app) to prevent module-requiring side effects
      // Credit to @pylixonly (492949202121261067) for the initial version of this fix
      if (!modules[id].isInitialized)
        try {
          window.ErrorUtils.setGlobalHandler(() => {});
          __r(id);
          window.ErrorUtils.setGlobalHandler(originalHandler);
        } catch {
          // continue
        }

      if (!module) {
        blacklist(id);
        continue;
      }

      if (module.default && module.__esModule && filter(module.default)) {
        if (single) return module.default;
        found.push(module.default);
      }

      if (filter(module)) {
        if (single) return module;
        else found.push(module);
      }
    }

    if (!single) return found;
  };

export const modules = window.modules;
export const find = filterModules(modules, true);
export const findAll = filterModules(modules);

const propsFilter = (props: (string | symbol)[]) => (m: any) =>
  props.every((p) => m[p] !== undefined);
const nameFilter = (name: string, defaultExp: boolean) =>
  defaultExp
    ? (m: any) => m?.name === name
    : (m: any) => m?.default?.name === name;
const dNameFilter = (displayName: string, defaultExp: boolean) =>
  defaultExp
    ? (m: any) => m?.displayName === displayName
    : (m: any) => m?.default?.displayName === displayName;
const tNameFilter = (typeName: string, defaultExp: boolean) =>
  defaultExp
    ? (m: any) => m?.type?.name === typeName
    : (m: any) => m?.default?.type?.name === typeName;
const storeFilter = (name: string) => (m: any) =>
  m.getName && m.getName.length === 0 && m.getName() === name;

export const findByProps: PropsFinder = (...props) => find(propsFilter(props));
export const findByPropsAll: PropsFinderAll = (...props) =>
  findAll(propsFilter(props));
export const findByName = (name: string, defaultExp = true) =>
  find(nameFilter(name, defaultExp));
export const findByNameAll = (name: string, defaultExp = true) =>
  findAll(nameFilter(name, defaultExp));
export const findByDisplayName = (displayName: string, defaultExp = true) =>
  find(dNameFilter(displayName, defaultExp));
export const findByDisplayNameAll = (displayName: string, defaultExp = true) =>
  findAll(dNameFilter(displayName, defaultExp));
export const findByTypeName = (typeName: string, defaultExp = true) =>
  find(tNameFilter(typeName, defaultExp));
export const findByTypeNameAll = (typeName: string, defaultExp = true) =>
  findAll(tNameFilter(typeName, defaultExp));
export const findByStoreName = (name: string) => find(storeFilter(name));
