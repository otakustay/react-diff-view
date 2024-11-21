# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.3.0](https://github.com/otakustay/react-diff-view/compare/v3.2.1...v3.3.0) (2024-11-21)


### Features

* support custom line className with generateLineClassName ([3d1e35a](https://github.com/otakustay/react-diff-view/commit/3d1e35a694f442c5978400946cba957520b57d3f))

### [3.2.1](https://github.com/otakustay/react-diff-view/compare/v3.2.0...v3.2.1) (2024-02-18)


### Bug Fixes

* not showing empty context line below diff ([b531e13](https://github.com/otakustay/react-diff-view/commit/b531e13f9fb9df2480d73e68fca7c01821a186fc))

## [3.2.0](https://github.com/otakustay/react-diff-view/compare/v3.1.0...v3.2.0) (2023-11-13)


### Features

* add data-change-key attribute to chnage elements ([#185](https://github.com/otakustay/react-diff-view/issues/185)) ([3b9440c](https://github.com/otakustay/react-diff-view/commit/3b9440c5e4492490fc760df98a55abaf5f26bc1a))


### Bug Fixes

* render whitespace on empty line tokenized ([#210](https://github.com/otakustay/react-diff-view/issues/210)) ([02a847c](https://github.com/otakustay/react-diff-view/commit/02a847c3a022ead324bce342c6d4778b1545b32c))

## [3.1.0](https://github.com/otakustay/react-diff-view/compare/v3.0.3...v3.1.0) (2023-08-31)


### Features

* publish a unminified esm format ([#196](https://github.com/otakustay/react-diff-view/issues/196)) ([a6b6acf](https://github.com/otakustay/react-diff-view/commit/a6b6acfaa3b4df2fe53adbee4e5b928e7063f7f6))


### Bug Fixes

* expose type dependencies ([#198](https://github.com/otakustay/react-diff-view/issues/198)) ([9fc7adc](https://github.com/otakustay/react-diff-view/commit/9fc7adcd74423cebdc8fc00709322dad76c7320b))
* minimum react version should be 16.14 ([52b83f1](https://github.com/otakustay/react-diff-view/commit/52b83f15a098aee9192368e51759cad4cf96d441))
* remove inline-block style of markEdit area ([2a030a8](https://github.com/otakustay/react-diff-view/commit/2a030a84261e161c9af35b7f646ecadb02d1ffd7))
* **ts:** small typo in types ([158dc93](https://github.com/otakustay/react-diff-view/commit/158dc93afdf79dcdefbd5938f00f62ac70e2a9cf))

### [3.0.3](https://github.com/otakustay/react-diff-view/compare/v3.0.2...v3.0.3) (2023-03-14)


### Bug Fixes

* type of withTokenizeWorker ([#193](https://github.com/otakustay/react-diff-view/issues/193)) ([1f3921d](https://github.com/otakustay/react-diff-view/commit/1f3921d63efcd9f23c669a2005a63b5a809fd24d))
* upgrade parser to handle binary delta diff ([#192](https://github.com/otakustay/react-diff-view/issues/192)) ([5f3264f](https://github.com/otakustay/react-diff-view/commit/5f3264fb82c8d128b9dde41728870cd4b17096da))

### [3.0.2](https://github.com/otakustay/react-diff-view/compare/v3.0.1...v3.0.2) (2023-02-24)


### Bug Fixes

* export more usefule types ([3685f87](https://github.com/otakustay/react-diff-view/commit/3685f877762de0f7a78112970f0c580aef92aefb))

### [3.0.1](https://github.com/otakustay/react-diff-view/compare/v3.0.0...v3.0.1) (2023-02-24)


### Bug Fixes

* export types used in props ([62aabb6](https://github.com/otakustay/react-diff-view/commit/62aabb6aff7788f395523eaca38a4752cb07ed71))

## [3.0.0](https://github.com/otakustay/react-diff-view/compare/v2.6.0...v3.0.0) (2023-02-21)


### ⚠ BREAKING CHANGES

* types may not be exactly what you expected
* some code introduces modern grammar like optional chain and template string, not sure the are all transformed by babel

### Features

* add TypeScript support ([#189](https://github.com/otakustay/react-diff-view/issues/189)) ([95f634b](https://github.com/otakustay/react-diff-view/commit/95f634b56926c3da540960d7dbc9be29214bf7e6))
* export util functions to check change type ([30cd5cf](https://github.com/otakustay/react-diff-view/commit/30cd5cfa177897ee2ff328797873ab31347d6120))
