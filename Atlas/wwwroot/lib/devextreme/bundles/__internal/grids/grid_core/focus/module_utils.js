/**
 * DevExtreme (bundles/__internal/grids/grid_core/focus/module_utils.js)
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
exports.UiGridCoreFocusUtils = void 0;
var _type = require("../../../../core/utils/type");
var _date_serialization = _interopRequireDefault(require("../../../../core/utils/date_serialization"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var getSortFilterValue = function(sortInfo, rowData, _ref) {
    var isRemoteFiltering = _ref.isRemoteFiltering,
        dateSerializationFormat = _ref.dateSerializationFormat,
        getSelector = _ref.getSelector;
    var selector = sortInfo.selector;
    var getter = (0, _type.isFunction)(selector) ? selector : getSelector(selector);
    var rawValue = getter ? getter(rowData) : rowData[selector];
    var safeValue = isRemoteFiltering && (0, _type.isDate)(rawValue) ? _date_serialization.default.serializeDate(rawValue, dateSerializationFormat) : rawValue;
    return {
        getter: getter,
        rawValue: rawValue,
        safeValue: safeValue
    }
};
var UiGridCoreFocusUtils = {
    getSortFilterValue: getSortFilterValue
};
exports.UiGridCoreFocusUtils = UiGridCoreFocusUtils;
