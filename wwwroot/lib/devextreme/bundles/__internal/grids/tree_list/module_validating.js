/**
 * DevExtreme (bundles/__internal/grids/tree_list/module_validating.js)
 * Version: 23.1.3
 * Build date: Fri Jun 09 2023
 *
 * Copyright (c) 2012 - 2023 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _extend = require("../../../core/utils/extend");
var _uiGrid_core = require("../../../ui/grid_core/ui.grid_core.validating");
var _module_core = _interopRequireDefault(require("./module_core"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var EditingControllerExtender = (0, _extend.extend)({}, _uiGrid_core.validatingModule.extenders.controllers.editing);
delete EditingControllerExtender.processItems;
delete EditingControllerExtender.processDataItem;
_module_core.default.registerModule("validating", {
    defaultOptions: _uiGrid_core.validatingModule.defaultOptions,
    controllers: _uiGrid_core.validatingModule.controllers,
    extenders: {
        controllers: {
            editing: EditingControllerExtender,
            editorFactory: _uiGrid_core.validatingModule.extenders.controllers.editorFactory
        },
        views: _uiGrid_core.validatingModule.extenders.views
    }
});
