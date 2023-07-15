/**
 * DevExtreme (bundles/__internal/grids/data_grid/module_not_extended/virtual_scrolling.js)
 * Version: 23.1.3
 * Build date: Fri Jun 09 2023
 *
 * Copyright (c) 2012 - 2023 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiGrid_core = require("../../../../ui/grid_core/ui.grid_core.virtual_scrolling");
var _module_core = _interopRequireDefault(require("../module_core"));
var _module_data_source_adapter = _interopRequireDefault(require("../module_data_source_adapter"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
_module_core.default.registerModule("virtualScrolling", _uiGrid_core.virtualScrollingModule);
_module_data_source_adapter.default.extend(_uiGrid_core.virtualScrollingModule.extenders.dataSourceAdapter);
