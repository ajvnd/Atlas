/**
 * DevExtreme (bundles/__internal/utils/memoize.js)
 * Version: 23.1.3
 * Build date: Fri Jun 09 2023
 *
 * Copyright (c) 2012 - 2023 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.memoize = void 0;
var _common = require("../../core/utils/common");

function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread()
}

function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
}

function _unsupportedIterableToArray(o, minLen) {
    if (!o) {
        return
    }
    if ("string" === typeof o) {
        return _arrayLikeToArray(o, minLen)
    }
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if ("Object" === n && o.constructor) {
        n = o.constructor.name
    }
    if ("Map" === n || "Set" === n) {
        return Array.from(o)
    }
    if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) {
        return _arrayLikeToArray(o, minLen)
    }
}

function _iterableToArray(iter) {
    if ("undefined" !== typeof Symbol && null != iter[Symbol.iterator] || null != iter["@@iterator"]) {
        return Array.from(iter)
    }
}

function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
        return _arrayLikeToArray(arr)
    }
}

function _arrayLikeToArray(arr, len) {
    if (null == len || len > arr.length) {
        len = arr.length
    }
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i]
    }
    return arr2
}
var compareByReference = function(args, lastArgs) {
    return args.length === lastArgs.length && !Object.keys(args).some((function(key) {
        return args[key] !== lastArgs[key]
    }))
};
var compareByValue = function(args, lastArgs) {
    return (0, _common.equalByValue)(args, lastArgs, {
        maxDepth: 4
    })
};
var createCacheFunc = function(firstArgs, firstResult, originFunc, compareFunc) {
    var lastArgs = firstArgs;
    var lastResult = firstResult;
    return function() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key]
        }
        var argsEquals = compareFunc(args, lastArgs);
        if (argsEquals) {
            return lastResult
        }
        lastArgs = args;
        lastResult = originFunc.apply(void 0, _toConsumableArray(lastArgs));
        return lastResult
    }
};
var MEMOIZE_DEFAULT_OPTIONS = {
    compareType: "reference"
};
var memoize = function(func) {
    var _ref = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : MEMOIZE_DEFAULT_OPTIONS,
        compareType = _ref.compareType;
    var cachedFunc = null;
    return function() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2]
        }
        if (!cachedFunc) {
            var firstResult = func.apply(void 0, args);
            cachedFunc = createCacheFunc(args, firstResult, func, "reference" === compareType ? compareByReference : compareByValue);
            return firstResult
        }
        return cachedFunc.apply(void 0, args)
    }
};
exports.memoize = memoize;
