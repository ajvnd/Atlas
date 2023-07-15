/**
 * DevExtreme (bundles/__internal/grids/data_grid/module_columns_controller.js)
 * Version: 23.1.3
 * Build date: Fri Jun 09 2023
 *
 * Copyright (c) 2012 - 2023 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _extend = require("../../../core/utils/extend");
var _module = require("../grid_core/columns_controller/module");
var _module_core = _interopRequireDefault(require("./module_core"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
_module_core.default.registerModule("columns", {
    defaultOptions: function() {
        return (0, _extend.extend)(true, {}, _module.columnsControllerModule.defaultOptions(), {
            commonColumnSettings: {
                allowExporting: true
            }
        })
    },
    controllers: _module.columnsControllerModule.controllers
});
