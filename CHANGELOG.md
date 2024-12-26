## [1.5.3](https://github.com/revenge-mod/revenge-bundle/compare/v1.5.2...v1.5.3) (2024-12-05)


* backport iOS invalid element type crash fix ([afacfa0](https://github.com/revenge-mod/revenge-bundle/commit/afacfa06480f60d461840a211c09abb363dc8546))

## [1.5.3-dev.1](https://github.com/revenge-mod/revenge-bundle/compare/v1.5.2...v1.5.3-dev.1) (2024-11-24)


### Bug Fixes

* **lib/ui/settings:** fix icon not showing up ([2fc7715](https://github.com/revenge-mod/revenge-bundle/commit/2fc7715fa4494c0b105a6399edc4877a155d3512))

## [1.5.2](https://github.com/revenge-mod/revenge-bundle/compare/v1.5.1...v1.5.2) (2024-11-13)


### Bug Fixes

* **lib/api/native/modules:** add new MMKVManager fallback ([a68f137](https://github.com/revenge-mod/revenge-bundle/commit/a68f1375437e164196745ad01d1997aa9ff1e67b))

## [1.5.1](https://github.com/revenge-mod/revenge-bundle/compare/v1.5.0...v1.5.1) (2024-11-04)


### Bug Fixes

* **lib/api/native/modules:** add more native module fallbacks ([825a404](https://github.com/revenge-mod/revenge-bundle/commit/825a404cae335572aeaa713697383b7d14eca25f))

# [1.5.0](https://github.com/revenge-mod/revenge-bundle/compare/v1.4.0...v1.5.0) (2024-10-26)


### Features

* wrap `App` in `SafeAreaProvider` ([ea1aec9](https://github.com/revenge-mod/revenge-bundle/commit/ea1aec9638f0a17e67ff38bf7d79655d19835f70))

# [1.4.0](https://github.com/revenge-mod/revenge-bundle/compare/v1.3.1...v1.4.0) (2024-10-26)


### Bug Fixes

* actually fix improper FAB insets ([e987723](https://github.com/revenge-mod/revenge-bundle/commit/e9877234befc837126f4a24b23c837e7ed8f6b5b))


### Features

* port ErrorBoundary from dev ([f447910](https://github.com/revenge-mod/revenge-bundle/commit/f44791049a762fbce777b03e9d930fba0c0c6570))
* **settings/pages/Developer:** show assets types, mark non-previewable assets in AssetBrowser ([b7aacf7](https://github.com/revenge-mod/revenge-bundle/commit/b7aacf734e665a7af613aa5eaae8507ea31be5cd))

# [1.4.0-dev.1](https://github.com/revenge-mod/revenge-bundle/compare/v1.3.1...v1.4.0-dev.1) (2024-10-26)


### Bug Fixes

* actually fix improper FAB insets ([e987723](https://github.com/revenge-mod/revenge-bundle/commit/e9877234befc837126f4a24b23c837e7ed8f6b5b))


### Features

* port ErrorBoundary from dev ([f447910](https://github.com/revenge-mod/revenge-bundle/commit/f44791049a762fbce777b03e9d930fba0c0c6570))
* **settings/pages/Developer:** show assets types, mark non-previewable assets in AssetBrowser ([b7aacf7](https://github.com/revenge-mod/revenge-bundle/commit/b7aacf734e665a7af613aa5eaae8507ea31be5cd))

## [1.3.1](https://github.com/revenge-mod/revenge-bundle/compare/v1.3.0...v1.3.1) (2024-10-23)


### Bug Fixes

* wrap only `FloatingActionButton` in `SafeAreaView` for `AddonPage` ([42a8268](https://github.com/revenge-mod/revenge-bundle/commit/42a8268630800d268b31f3750c3fa69d965acabc))

# [1.3.0](https://github.com/revenge-mod/revenge-bundle/compare/v1.2.0...v1.3.0) (2024-10-23)


### Bug Fixes

* wrap `addonpage` in `safeareaview` ([724fc1e](https://github.com/revenge-mod/revenge-bundle/commit/724fc1e135850d9439abcba03df1cd288ca3593b))


### Features

* improve fonts management ux ([b30e33d](https://github.com/revenge-mod/revenge-bundle/commit/b30e33d2c6be9d5fefc26903fecbf8fcccc0df42))
* show error when failing to import font entries ([9511f17](https://github.com/revenge-mod/revenge-bundle/commit/9511f174498dfa5758ad60a2e918220a685849e0))

# [1.3.0-dev.2](https://github.com/revenge-mod/revenge-bundle/compare/v1.3.0-dev.1...v1.3.0-dev.2) (2024-10-22)


### Bug Fixes

* wrap `addonpage` in `safeareaview` ([724fc1e](https://github.com/revenge-mod/revenge-bundle/commit/724fc1e135850d9439abcba03df1cd288ca3593b))

# [1.3.0-dev.1](https://github.com/revenge-mod/revenge-bundle/compare/v1.2.0...v1.3.0-dev.1) (2024-10-21)


### Features

* improve fonts management ux ([b30e33d](https://github.com/revenge-mod/revenge-bundle/commit/b30e33d2c6be9d5fefc26903fecbf8fcccc0df42))
* show error when failing to import font entries ([9511f17](https://github.com/revenge-mod/revenge-bundle/commit/9511f174498dfa5758ad60a2e918220a685849e0))

# [1.2.0](https://github.com/revenge-mod/revenge-bundle/compare/v1.1.2...v1.2.0) (2024-10-20)


### Bug Fixes

* **badges:** check if user is null ([a0c2ca7](https://github.com/revenge-mod/revenge-bundle/commit/a0c2ca7837c4585ead0e630d4475c354671fb8fd))
* downgrade dependencies to fix build issue ([b803053](https://github.com/revenge-mod/revenge-bundle/commit/b803053e28c77529d62179b75c22c2365869d020))
* Fix old settings menu and make some improvements to it ([#90](https://github.com/revenge-mod/revenge-bundle/issues/90)) ([e240509](https://github.com/revenge-mod/revenge-bundle/commit/e2405093eea5268d0afe88ded8735db7b5dfef43))
* load core plugins ([ed52f33](https://github.com/revenge-mod/revenge-bundle/commit/ed52f332da8a189eb1141e1f2c17f50c50562d1a))
* remove debug traces ([863466e](https://github.com/revenge-mod/revenge-bundle/commit/863466e48a741ede369a7032554191eac81e0905))
* remove parent from emitter callback ([fe937a4](https://github.com/revenge-mod/revenge-bundle/commit/fe937a4ab5631a0bb23706794511598770015e09))
* **types:** fix typescript [skip ci] ([61f9b65](https://github.com/revenge-mod/revenge-bundle/commit/61f9b6510b18032e4e91b7b2c87315d8ce6dea85))
* wrong imports ([87ba67e](https://github.com/revenge-mod/revenge-bundle/commit/87ba67e8c2a3cec6c9b03312937dfa3f5adde0f8))


### Features

* **coreplugins:** add badges ([e3df56d](https://github.com/revenge-mod/revenge-bundle/commit/e3df56dc58c8c6078269ef800d6ad899ddfa52d3))
* **metro:** expose common components & custom jsx runtime ([019fdc2](https://github.com/revenge-mod/revenge-bundle/commit/019fdc28b345e8b6f07cb96562f5e26c112da4cf))
* Rebrand to Revenge ([#51](https://github.com/revenge-mod/revenge-bundle/issues/51)) ([0a61404](https://github.com/revenge-mod/revenge-bundle/commit/0a614041327fa1232331676c40a8cd60839276ba))
* **storage:** port storage api from dev ([122c3a1](https://github.com/revenge-mod/revenge-bundle/commit/122c3a11e9f173c9c2ad9cd20d18926220428e8b))
* **ui:** ponyfill AlertModal's `extraContent` prop for older versions ([ad65247](https://github.com/revenge-mod/revenge-bundle/commit/ad6524772b9dd98f36b640b8fba2d36e2d6a7f2b)), closes [#91](https://github.com/revenge-mod/revenge-bundle/issues/91)
* **ui:** simplify some components ([4d88183](https://github.com/revenge-mod/revenge-bundle/commit/4d881835a63a64602dc0edc0332ee0097d28a601))
* **ui:** simplify unproxied notice ([1d4dfd3](https://github.com/revenge-mod/revenge-bundle/commit/1d4dfd311f4818d961b8667811bce7ecc0989152))

# [1.2.0-dev.3](https://github.com/revenge-mod/revenge-bundle/compare/v1.2.0-dev.2...v1.2.0-dev.3) (2024-10-19)


### Bug Fixes

* downgrade dependencies to fix build issue ([b803053](https://github.com/revenge-mod/revenge-bundle/commit/b803053e28c77529d62179b75c22c2365869d020))

# [1.2.0-dev.2](https://github.com/revenge-mod/revenge-bundle/compare/v1.2.0-dev.1...v1.2.0-dev.2) (2024-10-19)


### Bug Fixes

* wrong imports ([87ba67e](https://github.com/revenge-mod/revenge-bundle/commit/87ba67e8c2a3cec6c9b03312937dfa3f5adde0f8))

# [1.2.0-dev.1](https://github.com/revenge-mod/revenge-bundle/compare/v1.1.2...v1.2.0-dev.1) (2024-10-19)


### Bug Fixes

* **badges:** check if user is null ([a0c2ca7](https://github.com/revenge-mod/revenge-bundle/commit/a0c2ca7837c4585ead0e630d4475c354671fb8fd))
* Fix old settings menu and make some improvements to it ([#90](https://github.com/revenge-mod/revenge-bundle/issues/90)) ([e240509](https://github.com/revenge-mod/revenge-bundle/commit/e2405093eea5268d0afe88ded8735db7b5dfef43))
* load core plugins ([ed52f33](https://github.com/revenge-mod/revenge-bundle/commit/ed52f332da8a189eb1141e1f2c17f50c50562d1a))
* remove debug traces ([863466e](https://github.com/revenge-mod/revenge-bundle/commit/863466e48a741ede369a7032554191eac81e0905))
* remove parent from emitter callback ([fe937a4](https://github.com/revenge-mod/revenge-bundle/commit/fe937a4ab5631a0bb23706794511598770015e09))
* **types:** fix typescript [skip ci] ([61f9b65](https://github.com/revenge-mod/revenge-bundle/commit/61f9b6510b18032e4e91b7b2c87315d8ce6dea85))


### Features

* **coreplugins:** add badges ([e3df56d](https://github.com/revenge-mod/revenge-bundle/commit/e3df56dc58c8c6078269ef800d6ad899ddfa52d3))
* **metro:** expose common components & custom jsx runtime ([019fdc2](https://github.com/revenge-mod/revenge-bundle/commit/019fdc28b345e8b6f07cb96562f5e26c112da4cf))
* Rebrand to Revenge ([#51](https://github.com/revenge-mod/revenge-bundle/issues/51)) ([0a61404](https://github.com/revenge-mod/revenge-bundle/commit/0a614041327fa1232331676c40a8cd60839276ba))
* **storage:** port storage api from dev ([122c3a1](https://github.com/revenge-mod/revenge-bundle/commit/122c3a11e9f173c9c2ad9cd20d18926220428e8b))
* **ui:** ponyfill AlertModal's `extraContent` prop for older versions ([ad65247](https://github.com/revenge-mod/revenge-bundle/commit/ad6524772b9dd98f36b640b8fba2d36e2d6a7f2b)), closes [#91](https://github.com/revenge-mod/revenge-bundle/issues/91)
* **ui:** simplify some components ([4d88183](https://github.com/revenge-mod/revenge-bundle/commit/4d881835a63a64602dc0edc0332ee0097d28a601))
* **ui:** simplify unproxied notice ([1d4dfd3](https://github.com/revenge-mod/revenge-bundle/commit/1d4dfd311f4818d961b8667811bce7ecc0989152))
