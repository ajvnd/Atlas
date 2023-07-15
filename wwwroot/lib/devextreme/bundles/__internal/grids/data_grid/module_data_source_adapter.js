/**
 * DevExtreme (bundles/__internal/grids/data_grid/module_data_source_adapter.js)
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
exports.default = void 0;
var _module = _interopRequireDefault(require("../grid_core/data_source_adapter/module"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var dataSourceAdapterType = _module.default;
var _default = {
    extend: function(extender) {
        dataSourceAdapterType = dataSourceAdapterType.inherit(extender)
    },
    create: function(component) {
        return new dataSourceAdapterType(component)
    }
};
exports.default = _default;
