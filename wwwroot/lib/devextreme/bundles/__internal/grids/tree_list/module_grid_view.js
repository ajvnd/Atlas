/**
 * DevExtreme (bundles/__internal/grids/tree_list/module_grid_view.js)
 * Version: 23.1.3
 * Build date: Fri Jun 09 2023
 *
 * Copyright (c) 2012 - 2023 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiGrid_core = require("../../../ui/grid_core/ui.grid_core.grid_view");
var _module_core = _interopRequireDefault(require("./module_core"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var GridView = _uiGrid_core.gridViewModule.views.gridView.inherit({
    _getWidgetAriaLabel: function() {
        return "dxTreeList-ariaTreeList"
    },
    _getTableRoleName: function() {
        return "treegrid"
    }
});
_module_core.default.registerModule("gridView", {
    defaultOptions: _uiGrid_core.gridViewModule.defaultOptions,
    controllers: _uiGrid_core.gridViewModule.controllers,
    views: {
        gridView: GridView
    },
    extenders: {
        controllers: {
            resizing: {
                _toggleBestFitMode: function(isBestFit) {
                    this.callBase(isBestFit);
                    var $rowsTable = this._rowsView.getTableElement();
                    $rowsTable.find(".dx-treelist-cell-expandable").toggleClass(this.addWidgetPrefix("best-fit"), isBestFit)
                }
            }
        }
    }
});
