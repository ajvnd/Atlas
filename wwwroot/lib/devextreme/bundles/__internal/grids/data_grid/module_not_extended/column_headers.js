/**
 * DevExtreme (bundles/__internal/grids/data_grid/module_not_extended/column_headers.js)
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
exports.ColumnHeadersView = void 0;
var _uiGrid_core = require("../../../../ui/grid_core/ui.grid_core.column_headers");
var _module_core = _interopRequireDefault(require("../module_core"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var ColumnHeadersView = _uiGrid_core.columnHeadersModule.views.columnHeadersView;
exports.ColumnHeadersView = ColumnHeadersView;
_module_core.default.registerModule("columnHeaders", _uiGrid_core.columnHeadersModule);
