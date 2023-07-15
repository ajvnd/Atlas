/**
 * DevExtreme (bundles/__internal/grids/grid_core/column_state_mixin/module.js)
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
var _renderer = _interopRequireDefault(require("../../../../core/renderer"));
var _common = require("../../../../core/utils/common");
var _extend = require("../../../../core/utils/extend");
var _position = require("../../../../core/utils/position");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var COLUMN_INDICATORS_CLASS = "dx-column-indicators";
var GROUP_PANEL_ITEM_CLASS = "dx-group-panel-item";
var _default = {
    _applyColumnState: function(options) {
        var _a;
        var rtlEnabled = this.option("rtlEnabled");
        var columnAlignment = this._getColumnAlignment(options.column.alignment, rtlEnabled);
        var parameters = (0, _extend.extend)(true, {
            columnAlignment: columnAlignment
        }, options);
        var isGroupPanelItem = parameters.rootElement.hasClass(GROUP_PANEL_ITEM_CLASS);
        var $indicatorsContainer = this._createIndicatorContainer(parameters, isGroupPanelItem);
        var $span = (0, _renderer.default)("<span>").addClass(this._getIndicatorClassName(options.name));
        var columnsController = null === (_a = this.component) || void 0 === _a ? void 0 : _a.getController("columns");
        var indicatorAlignment = (null === columnsController || void 0 === columnsController ? void 0 : columnsController.getHeaderContentAlignment(columnAlignment)) || columnAlignment;
        parameters.container = $indicatorsContainer;
        parameters.indicator = $span;
        this._renderIndicator(parameters);
        $indicatorsContainer[(isGroupPanelItem || !options.showColumnLines) && "left" === indicatorAlignment ? "appendTo" : "prependTo"](options.rootElement);
        return $span
    },
    _getIndicatorClassName: _common.noop,
    _getColumnAlignment: function(alignment, rtlEnabled) {
        rtlEnabled = rtlEnabled || this.option("rtlEnabled");
        return alignment && "center" !== alignment ? alignment : (0, _position.getDefaultAlignment)(rtlEnabled)
    },
    _createIndicatorContainer: function(options, ignoreIndicatorAlignment) {
        var $indicatorsContainer = this._getIndicatorContainer(options.rootElement);
        var indicatorAlignment = "left" === options.columnAlignment ? "right" : "left";
        if (!$indicatorsContainer.length) {
            $indicatorsContainer = (0, _renderer.default)("<div>").addClass(COLUMN_INDICATORS_CLASS)
        }
        this.setAria("role", "presentation", $indicatorsContainer);
        return $indicatorsContainer.css("float", options.showColumnLines && !ignoreIndicatorAlignment ? indicatorAlignment : null)
    },
    _getIndicatorContainer: function($cell) {
        return $cell && $cell.find(".".concat(COLUMN_INDICATORS_CLASS))
    },
    _getIndicatorElements: function($cell) {
        var $indicatorContainer = this._getIndicatorContainer($cell);
        return $indicatorContainer && $indicatorContainer.children()
    },
    _renderIndicator: function(options) {
        var $container = options.container;
        var $indicator = options.indicator;
        $container && $indicator && $container.append($indicator)
    },
    _updateIndicators: function(indicatorName) {
        var columns = this.getColumns();
        var $cells = this.getColumnElements();
        var $cell;
        if (!$cells || columns.length !== $cells.length) {
            return
        }
        for (var i = 0; i < columns.length; i++) {
            $cell = $cells.eq(i);
            this._updateIndicator($cell, columns[i], indicatorName);
            var rowOptions = $cell.parent().data("options");
            if (rowOptions && rowOptions.cells) {
                rowOptions.cells[$cell.index()].column = columns[i]
            }
        }
    },
    _updateIndicator: function($cell, column, indicatorName) {
        if (!column.command) {
            return this._applyColumnState({
                name: indicatorName,
                rootElement: $cell,
                column: column,
                showColumnLines: this.option("showColumnLines")
            })
        }
    }
};
exports.default = _default;