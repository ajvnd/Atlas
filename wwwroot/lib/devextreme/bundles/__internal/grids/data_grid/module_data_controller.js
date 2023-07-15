/**
 * DevExtreme (bundles/__internal/grids/data_grid/module_data_controller.js)
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
exports.DataController = void 0;
var _ui = _interopRequireDefault(require("../../../ui/widget/ui.errors"));
var _uiGrid_core = require("../../../ui/grid_core/ui.grid_core.data_controller");
var _module_core = _interopRequireDefault(require("./module_core"));
var _module_data_source_adapter = _interopRequireDefault(require("./module_data_source_adapter"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var _a;
var DataController = (null === (_a = _uiGrid_core.dataControllerModule.controllers) || void 0 === _a ? void 0 : _a.data).inherit({
    _getDataSourceAdapter: function() {
        return _module_data_source_adapter.default
    },
    _getSpecificDataSourceOption: function() {
        var dataSource = this.option("dataSource");
        if (dataSource && !Array.isArray(dataSource) && this.option("keyExpr")) {
            _ui.default.log("W1011")
        }
        return this.callBase()
    }
});
exports.DataController = DataController;
_module_core.default.registerModule("data", {
    defaultOptions: _uiGrid_core.dataControllerModule.defaultOptions,
    controllers: {
        data: DataController
    }
});
