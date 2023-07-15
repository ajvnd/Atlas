/**
 * DevExtreme (bundles/__internal/grids/grid_core/context_menu/module.js)
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
exports.contextMenuModule = void 0;
var _renderer = _interopRequireDefault(require("../../../../core/renderer"));
var _element = require("../../../../core/element");
var _common = require("../../../../core/utils/common");
var _iterator = require("../../../../core/utils/iterator");
var _context_menu = _interopRequireDefault(require("../../../../ui/context_menu"));
var _modules = _interopRequireDefault(require("../modules"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var CONTEXT_MENU = "dx-context-menu";
var viewName = {
    columnHeadersView: "header",
    rowsView: "content",
    footerView: "footer",
    headerPanel: "headerPanel"
};
var VIEW_NAMES = ["columnHeadersView", "rowsView", "footerView", "headerPanel"];
var ContextMenuController = _modules.default.ViewController.inherit({
    init: function() {
        this.createAction("onContextMenuPreparing")
    },
    getContextMenuItems: function(dxEvent) {
        if (!dxEvent) {
            return false
        }
        var that = this;
        var $targetElement = (0, _renderer.default)(dxEvent.target);
        var $element;
        var $targetRowElement;
        var $targetCellElement;
        var menuItems;
        (0, _iterator.each)(VIEW_NAMES, (function() {
            var _a, _b;
            var view = that.getView(this);
            $element = view && view.element();
            if ($element && ($element.is($targetElement) || $element.find($targetElement).length)) {
                $targetCellElement = $targetElement.closest(".dx-row > td, .dx-row > tr");
                $targetRowElement = $targetCellElement.parent();
                var rowIndex = view.getRowIndex($targetRowElement);
                var columnIndex = $targetCellElement[0] && $targetCellElement[0].cellIndex;
                var rowOptions = $targetRowElement.data("options");
                var options = {
                    event: dxEvent,
                    targetElement: (0, _element.getPublicElement)($targetElement),
                    target: viewName[this],
                    rowIndex: rowIndex,
                    row: view._getRows()[rowIndex],
                    columnIndex: columnIndex,
                    column: null === (_b = null === (_a = null === rowOptions || void 0 === rowOptions ? void 0 : rowOptions.cells) || void 0 === _a ? void 0 : _a[columnIndex]) || void 0 === _b ? void 0 : _b.column
                };
                options.items = view.getContextMenuItems && view.getContextMenuItems(options);
                that.executeAction("onContextMenuPreparing", options);
                that._contextMenuPrepared(options);
                menuItems = options.items;
                if (menuItems) {
                    return false
                }
            }
            return
        }));
        return menuItems
    },
    _contextMenuPrepared: _common.noop
});
var ContextMenuView = _modules.default.View.inherit({
    _renderCore: function() {
        var that = this;
        var $element = that.element().addClass(CONTEXT_MENU);
        this.setAria("role", "presentation", $element);
        this._createComponent($element, _context_menu.default, {
            onPositioning: function(actionArgs) {
                var event = actionArgs.event;
                var contextMenuInstance = actionArgs.component;
                var items = that.getController("contextMenu").getContextMenuItems(event);
                if (items) {
                    contextMenuInstance.option("items", items);
                    event.stopPropagation()
                } else {
                    actionArgs.cancel = true
                }
            },
            onItemClick: function(params) {
                params.itemData.onItemClick && params.itemData.onItemClick(params)
            },
            cssClass: that.getWidgetContainerClass(),
            target: that.component.$element()
        })
    }
});
var contextMenuModule = {
    defaultOptions: function() {
        return {
            onContextMenuPreparing: null
        }
    },
    controllers: {
        contextMenu: ContextMenuController
    },
    views: {
        contextMenuView: ContextMenuView
    }
};
exports.contextMenuModule = contextMenuModule;