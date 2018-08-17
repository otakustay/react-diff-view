/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./demo/components/App/Parse.worker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./demo/components/App/Parse.worker.js":
/*!*********************************************!*\
  !*** ./demo/components/App/Parse.worker.js ***!
  \*********************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react_diff_view_parse__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-diff-view/parse */ "./src/parse.js");


self.addEventListener(
    'message',
    ({data: {jobID, diffText, nearbySequences}}) => {
        const diff = Object(react_diff_view_parse__WEBPACK_IMPORTED_MODULE_0__["parseDiff"])(diffText, {nearbySequences});

        self.postMessage({jobID, diff});
    }
);


/***/ }),

/***/ "./node_modules/gitdiff-parser/index.js":
/*!**********************************************!*\
  !*** ./node_modules/gitdiff-parser/index.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * @file gitdiff 消息解析器
 * @author errorrik(errorrik@gmail.com)
 */

(function (root) {
    var STAT_START = 2;
    var STAT_FILE_META = 3;
    var STAT_HUNK = 5;




    var parser = {
        /**
         * 解析 gitdiff 消息
         *
         * @param {string} source gitdiff消息内容
         * @return {Object}
         */
        parse: function (source) {
            var infos = [];
            var stat = STAT_START;
            var currentInfo;
            var currentHunk;
            var changeOldLine;
            var changeNewLine;


            var lines = source.split('\n');
            var linesLen = lines.length;
            var i = 0;

            while (i < linesLen) {
                var line = lines[i];

                if (line.indexOf('diff --git') === 0) {
                    var filesStr = line.slice(11);
                    var oldPath = null;
                    var newPath = null;

                    var quoteIndex = filesStr.indexOf('"');
                    switch (quoteIndex) {
                        case -1:
                            var segs = filesStr.split(' ');
                            oldPath = segs[0].slice(2);
                            newPath = segs[1].slice(2);
                            break;

                        case 0:
                            var nextQuoteIndex = filesStr.indexOf('"', 2);
                            oldPath = filesStr.slice(3, nextQuoteIndex);
                            var newQuoteIndex = filesStr.indexOf('"', nextQuoteIndex + 1);
                            if (newQuoteIndex < 0) {
                                newPath = filesStr.slice(nextQuoteIndex + 4);
                            }
                            else {
                                newPath = filesStr.slice(newQuoteIndex + 3, -1);
                            }
                            break;

                        default:
                            var segs = filesStr.split(' ');
                            oldPath = segs[0].slice(2);
                            newPath = segs[1].slice(3, -1);
                            break;
                    }
                    

                    // read file
                    currentInfo = {
                        oldPath: oldPath,
                        newPath: newPath,
                        hunks: []
                    };

                    infos.push(currentInfo);


                    // 1. 如果oldPath是/dev/null就是add
                    // 2. 如果newPath是/dev/null就是delete
                    // 3. 如果有 rename from foo.js 这样的就是rename
                    // 4. 如果有 copy from foo.js 这样的就是copy
                    // 5. 其它情况是modify
                    var currentInfoType = null;

                    // read mode change
                    var nextLine = lines[i + 1];
                    if (nextLine.indexOf('old') === 0) {
                        currentInfo.oldMode = nextLine.slice(9, 16);
                        currentInfo.newMode = lines[i + 2].slice(9, 16);
                        i += 2;
                        nextLine = lines[i + 1];
                    }

                    // read similarity
                    if (nextLine.indexOf('similarity') === 0) {
                        currentInfo.similarity = parseInt(nextLine.split(' ')[2], 10);
                        i += 1;
                    }

                    // read similarity type and index
                    var simiLine;
                    simiLoop: while ((simiLine = lines[++i])) {
                        var segs = simiLine.split(' ');

                        switch (segs[0]) {
                            case 'diff': // diff --git
                                i--;
                                break simiLoop;

                            case 'index':
                                var revs = segs[1].split('..');
                                currentInfo.oldRevision = revs[0];
                                currentInfo.newRevision = revs[1];

                                if (segs[2]) {
                                    currentInfo.oldMode = currentInfo.newMode = segs[2];
                                }
                                stat = STAT_HUNK;

                                var oldFileName = lines[i + 1];
                                if (oldFileName.indexOf('---') === 0) {
                                    var newFileName = lines[i + 2];

                                    if (/\s\/dev\/null$/.test(oldFileName)) {
                                        currentInfo.oldPath = '/dev/null';
                                        currentInfoType = 'add';
                                    }
                                    else if (/\s\/dev\/null$/.test(newFileName)) {
                                        currentInfo.newPath = '/dev/null';
                                        currentInfoType = 'delete';
                                    }

                                    i += 2;
                                }

                                break simiLoop;

                        }
                        
                        if (!currentInfoType) {
                            currentInfoType = segs[0];
                        }
                    }

                    currentInfo.type = currentInfoType || 'modify';
                }
                else if (line.indexOf('Binary') === 0) {
                    currentInfo.isBinary = true;
                    stat = STAT_START;
                    currentInfo = null;
                }
                else if (stat === STAT_HUNK) {
                    if (line.indexOf('@@') === 0) {
                        var match = /^@@\s+-([0-9]+)(,([0-9]+))?\s+\+([0-9]+)(,([0-9]+))?/.exec(line)
                        currentHunk = {
                            content: line,
                            oldStart: match[1] - 0,
                            newStart: match[4] - 0,
                            oldLines: match[3] - 0 || 1,
                            newLines: match[6] - 0 || 1,
                            changes: []
                        };

                        currentInfo.hunks.push(currentHunk);
                        changeOldLine = currentHunk.oldStart;
                        changeNewLine = currentHunk.newStart;
                    }
                    else {
                        var typeChar = line.slice(0, 1);
                        var change = {
                            content: line.slice(1)
                        };

                        switch (typeChar) {
                            case '+':
                                change.type = 'insert';
                                change.isInsert = true;
                                change.lineNumber = changeNewLine;
                                changeNewLine++;
                                break;

                            case '-':
                                change.type = 'delete';
                                change.isDelete = true;
                                change.lineNumber = changeOldLine;
                                changeOldLine++;
                                break;

                            case ' ':
                                change.type = 'normal';
                                change.isNormal = true;
                                change.oldLineNumber = changeOldLine;
                                change.newLineNumber = changeNewLine;
                                changeOldLine++;
                                changeNewLine++;
                                break;
                        }

                        change.type && currentHunk.changes.push(change);
                    }
                }

                i++;
            }

            return infos;
        }
    };

    if (true) {
        // For CommonJS
        exports = module.exports = parser;
    }
    else {}
})(this);


/***/ }),

/***/ "./node_modules/warning/warning.js":
/*!*****************************************!*\
  !*** ./node_modules/warning/warning.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule warning
 */



/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var __DEV__ = "development" !== 'production';

var warning = function() {};

if (__DEV__) {
  var printWarning = function printWarning(format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    var argIndex = 0;
    var message = 'Warning: ' +
      format.replace(/%s/g, function() {
        return args[argIndex++];
      });
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  }

  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
          '`warning(condition, format, ...args)` requires a warning ' +
          'message argument'
      );
    }
    if (!condition) {
      printWarning.apply(null, [format].concat(args));
    }
  };
}

module.exports = warning;


/***/ }),

/***/ "./src/parse.js":
/*!**********************!*\
  !*** ./src/parse.js ***!
  \**********************/
/*! exports provided: parseDiff, addStubHunk */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseDiff", function() { return parseDiff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addStubHunk", function() { return addStubHunk; });
/* harmony import */ var gitdiff_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! gitdiff-parser */ "./node_modules/gitdiff-parser/index.js");
/* harmony import */ var gitdiff_parser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(gitdiff_parser__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var warning__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! warning */ "./node_modules/warning/warning.js");
/* harmony import */ var warning__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(warning__WEBPACK_IMPORTED_MODULE_1__);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }




var zipChanges = function zipChanges(changes) {
    var _changes$reduce = changes.reduce(function (_ref, current, i) {
        var _ref2 = _slicedToArray(_ref, 3),
            result = _ref2[0],
            last = _ref2[1],
            lastDeletionIndex = _ref2[2];

        if (!last) {
            result.push(current);
            return [result, current, current.isDelete ? i : -1];
        }

        if (current.isInsert && lastDeletionIndex >= 0) {
            result.splice(lastDeletionIndex + 1, 0, current);
            // The new `lastDeletionIndex` may be out of range, but `splice` will fix it
            return [result, current, lastDeletionIndex + 2];
        }

        result.push(current);

        // Keep the `lastDeletionIndex` if there are lines of deletions,
        // otherwise update it to the new deletion line
        var newLastDeletionIndex = current.isDelete ? last.isDelete ? lastDeletionIndex : i : i;

        return [result, current, newLastDeletionIndex];
    }, [[], null, -1]),
        _changes$reduce2 = _slicedToArray(_changes$reduce, 1),
        result = _changes$reduce2[0];

    return result;
};

var mapHunk = function mapHunk(hunk, options) {
    var changes = options.nearbySequences === 'zip' ? zipChanges(hunk.changes) : hunk.changes;

    return _extends({}, hunk, {
        isPlain: false,
        changes: changes
    });
};

var mapFile = function mapFile(file, options) {
    var hunks = file.hunks.map(function (hunk) {
        return mapHunk(hunk, options);
    });

    return _extends({}, file, {
        hunks: options.stubHunk ? addStubHunk(hunks) : hunks
    });
};

var parseDiff = function parseDiff(text) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    warning__WEBPACK_IMPORTED_MODULE_1___default()(!options.stubHunk, 'stubHunk options is deprecated, use addStubHunk function later to add a stub hunk, ' + 'this function can receive an extra referenceCodeOrLines argument to determine whether stub hunk is required');

    var files = gitdiff_parser__WEBPACK_IMPORTED_MODULE_0___default.a.parse(text);

    return files.map(function (file) {
        return mapFile(file, options);
    });
};

var addStubHunk = function addStubHunk(hunks, referenceCodeOrLines) {
    if (!hunks || !hunks.length) {
        return hunks;
    }

    var isStubRequired = function () {
        if (!referenceCodeOrLines) {
            return true;
        }

        var linesOfCode = typeof referenceCodeOrLines === 'string' ? referenceCodeOrLines.split('\n') : referenceCodeOrLines;
        var lastHunk = hunks[hunks.length - 1];
        var lastLineNumber = lastHunk.oldStart + lastHunk.oldLines - 1;

        return linesOfCode.length > lastLineNumber;
    }();

    if (!isStubRequired) {
        return hunks;
    }

    var _hunks = hunks[hunks.length - 1],
        oldStart = _hunks.oldStart,
        oldLines = _hunks.oldLines,
        newStart = _hunks.newStart,
        newLines = _hunks.newLines;

    var stubHunk = {
        oldStart: oldStart + oldLines,
        oldLines: 0,
        newStart: newStart + newLines,
        newLines: 0,
        content: 'STUB',
        changes: []
    };
    return [].concat(_toConsumableArray(hunks), [stubHunk]);
};

/***/ })

/******/ });
//# sourceMappingURL=ca15634b4b11eb060dea.worker.js.map