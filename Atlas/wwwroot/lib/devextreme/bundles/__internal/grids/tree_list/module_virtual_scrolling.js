/**
 * DevExtreme (bundles/__internal/grids/tree_list/module_virtual_scrolling.js)
 * Version: 23.1.3
 * Build date: Fri Jun 09 2023
 *
 * Copyright (c) 2012 - 2023 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _extend = require("../../../core/utils/extend");
var _uiGrid_core = require("../../../ui/grid_core/ui.grid_core.virtual_scrolling");
var _module_core = _interopRequireDefault(require("./module_core"));
var _module = _interopRequireDefault(require("./data_source_adapter/module"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var oldDefaultOptions = _uiGrid_core.virtualScrollingModule.defaultOptions;
var originalDataControllerExtender = _uiGrid_core.virtualScrollingModule.extenders.controllers.data;
var originalDataSourceAdapterExtender = _uiGrid_core.virtualScrollingModule.extenders.dataSourceAdapter;
_uiGrid_core.virtualScrollingModule.extenders.controllers.data = (0, _extend.extend)({}, originalDataControllerExtender, {
    _loadOnOptionChange: function() {
        var virtualScrollController = this._dataSource && this._dataSource._virtualScrollController;
        virtualScrollController && virtualScrollController.reset();
        this.callBase()
    }
});
_uiGrid_core.virtualScrollingModule.extenders.dataSourceAdapter = (0, _extend.extend)({}, originalDataSourceAdapterExtender, {
    changeRowExpand: function() {
        var _this = this;
        return this.callBase.apply(this, arguments).done((function() {
            var viewportItemIndex = _this.getViewportItemIndex();
            viewportItemIndex >= 0 && _this.setViewportItemIndex(viewportItemIndex)
        }))
    }
});
_module_core.default.registerModule("virtualScrolling", (0, _extend.extend)({}, _uiGrid_core.virtualScrollingModule, {
    defaultOptions: function() {
        return (0, _extend.extend)(true, oldDefaultOptions(), {
            scrolling: {
                mode: "virtual"
            }
        })
    }
}));
_module.default.extend(_uiGrid_core.virtualScrollingModule.extenders.dataSourceAdapter);
