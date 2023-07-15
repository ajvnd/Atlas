/**
 * DevExtreme (bundles/__internal/grids/data_grid/module_core.js)
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
var _uiGrid_core = _interopRequireDefault(require("../../../ui/grid_core/ui.grid_core.utils"));
var _uiGrid_core2 = _interopRequireDefault(require("../../../ui/grid_core/ui.grid_core.modules"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}

function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key]
                }
            }
        }
        return target
    };
    return _extends.apply(this, arguments)
}
var _default = _extends(_extends(_extends({}, _uiGrid_core2.default), _uiGrid_core.default), {
    modules: []
});
exports.default = _default;
