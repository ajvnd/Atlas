/**
 * DevExtreme (bundles/__internal/grids/grid_core/keyboard_navigation/dom.js)
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
exports.GridCoreKeyboardNavigationDom = void 0;
var _const = require("./const");
var isDragCell = function($cell) {
    return void 0 !== $cell.attr(_const.ATTRIBUTES.dragCell)
};
var getCellToFocus = function($cellElements, columnIndex) {
    return $cellElements.filter("[".concat(_const.ATTRIBUTES.ariaColIndex, '="').concat(columnIndex + 1, '"]:not([').concat(_const.ATTRIBUTES.dragCell, "])")).first()
};
var GridCoreKeyboardNavigationDom = {
    isDragCell: isDragCell,
    getCellToFocus: getCellToFocus
};
exports.GridCoreKeyboardNavigationDom = GridCoreKeyboardNavigationDom;
