/**
 * DevExtreme (bundles/__internal/grids/pivot_grid/remote_store/module_utils.js)
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
exports.forEachGroup = exports.default = void 0;
var forEachGroup = function forEachGroup(data, callback, level) {
    data = data || [];
    level = level || 0;
    for (var i = 0; i < data.length; i += 1) {
        var group = data[i];
        callback(group, level);
        if (group && group.items && group.items.length) {
            forEachGroup(group.items, callback, level + 1)
        }
    }
};
exports.forEachGroup = forEachGroup;
var _default = {
    forEachGroup: forEachGroup
};
exports.default = _default;
