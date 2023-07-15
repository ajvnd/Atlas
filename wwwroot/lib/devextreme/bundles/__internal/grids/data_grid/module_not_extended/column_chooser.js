/**
 * DevExtreme (bundles/__internal/grids/data_grid/module_not_extended/column_chooser.js)
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
exports.ColumnChooserView = exports.ColumnChooserController = void 0;
var _uiGrid_core = require("../../../../ui/grid_core/ui.grid_core.column_chooser");
var _module_core = _interopRequireDefault(require("../module_core"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var ColumnChooserController = _uiGrid_core.columnChooserModule.controllers.columnChooser;
exports.ColumnChooserController = ColumnChooserController;
var ColumnChooserView = _uiGrid_core.columnChooserModule.views.columnChooserView;
exports.ColumnChooserView = ColumnChooserView;
_module_core.default.registerModule("columnChooser", _uiGrid_core.columnChooserModule);
