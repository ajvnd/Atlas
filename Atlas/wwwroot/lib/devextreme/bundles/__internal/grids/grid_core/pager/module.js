/**
 * DevExtreme (bundles/__internal/grids/grid_core/pager/module.js)
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
exports.pagerModule = void 0;
var _pager = _interopRequireDefault(require("../../../../ui/pager"));
var _type = require("../../../../core/utils/type");
var _window = require("../../../../core/utils/window");
var _message = _interopRequireDefault(require("../../../../localization/message"));
var _modules = _interopRequireDefault(require("../modules"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var PAGER_CLASS = "pager";
var MAX_PAGES_COUNT = 10;
var getPageIndex = function(dataController) {
    return 1 + (parseInt(dataController.pageIndex()) || 0)
};
var PagerView = _modules.default.View.inherit({
    init: function() {
        var _this = this;
        var dataController = this.getController("data");
        dataController.changed.add((function(e) {
            if (e && e.repaintChangesOnly) {
                var pager = _this._pager;
                if (pager) {
                    pager.option({
                        pageIndex: getPageIndex(dataController),
                        pageSize: dataController.pageSize(),
                        pageCount: dataController.pageCount(),
                        totalCount: dataController.totalCount(),
                        hasKnownLastPage: dataController.hasKnownLastPage()
                    })
                } else {
                    _this.render()
                }
            } else if (!e || "update" !== e.changeType && "updateSelection" !== e.changeType && "updateFocusedRow" !== e.changeType) {
                _this._pager = null;
                _this.render()
            }
        }))
    },
    _renderCore: function() {
        var $element = this.element().addClass(this.addWidgetPrefix(PAGER_CLASS));
        var pagerOptions = this.option("pager") || {};
        var dataController = this.getController("data");
        var keyboardController = this.getController("keyboardNavigation");
        var options = {
            maxPagesCount: MAX_PAGES_COUNT,
            pageIndex: getPageIndex(dataController),
            pageCount: dataController.pageCount(),
            pageSize: dataController.pageSize(),
            showPageSizes: pagerOptions.showPageSizeSelector,
            showInfo: pagerOptions.showInfo,
            displayMode: pagerOptions.displayMode,
            pagesNavigatorVisible: pagerOptions.visible,
            showNavigationButtons: pagerOptions.showNavigationButtons,
            label: pagerOptions.label,
            pageSizes: this.getPageSizes(),
            totalCount: dataController.totalCount(),
            hasKnownLastPage: dataController.hasKnownLastPage(),
            pageIndexChanged: function(pageIndex) {
                if (dataController.pageIndex() !== pageIndex - 1) {
                    dataController.pageIndex(pageIndex - 1)
                }
            },
            pageSizeChanged: function(pageSize) {
                dataController.pageSize(pageSize)
            },
            onKeyDown: function(e) {
                return keyboardController && keyboardController.executeAction("onKeyDown", e)
            },
            useLegacyKeyboardNavigation: this.option("useLegacyKeyboardNavigation"),
            useKeyboard: this.option("keyboardNavigation.enabled")
        };
        if ((0, _type.isDefined)(pagerOptions.infoText)) {
            options.infoText = pagerOptions.infoText
        }
        if (this._pager) {
            this._pager.repaint();
            return
        }
        if ((0, _window.hasWindow)()) {
            this._pager = this._createComponent($element, _pager.default, options)
        } else {
            $element.addClass("dx-pager").html('<div class="dx-pages"><div class="dx-page"></div></div>')
        }
    },
    getPager: function() {
        return this._pager
    },
    getPageSizes: function() {
        var dataController = this.getController("data");
        var pagerOptions = this.option("pager");
        var allowedPageSizes = pagerOptions && pagerOptions.allowedPageSizes;
        var pageSize = dataController.pageSize();
        if (!(0, _type.isDefined)(this._pageSizes) || !this._pageSizes.includes(pageSize)) {
            this._pageSizes = [];
            if (pagerOptions) {
                if (Array.isArray(allowedPageSizes)) {
                    this._pageSizes = allowedPageSizes
                } else if (allowedPageSizes && pageSize > 1) {
                    this._pageSizes = [Math.floor(pageSize / 2), pageSize, 2 * pageSize]
                }
            }
        }
        return this._pageSizes
    },
    isVisible: function() {
        var dataController = this.getController("data");
        var pagerOptions = this.option("pager");
        var pagerVisible = pagerOptions && pagerOptions.visible;
        var scrolling = this.option("scrolling");
        if ("auto" === pagerVisible) {
            if (scrolling && ("virtual" === scrolling.mode || "infinite" === scrolling.mode)) {
                pagerVisible = false
            } else {
                pagerVisible = dataController.pageCount() > 1 || dataController.isLoaded() && !dataController.hasKnownLastPage()
            }
        }
        return pagerVisible
    },
    getHeight: function() {
        return this.getElementHeight()
    },
    optionChanged: function(args) {
        var name = args.name;
        var isPager = "pager" === name;
        var isPaging = "paging" === name;
        var isDataSource = "dataSource" === name;
        var isScrolling = "scrolling" === name;
        var dataController = this.getController("data");
        if (isPager || isPaging || isScrolling || isDataSource) {
            args.handled = true;
            if (dataController.skipProcessingPagingChange(args.fullName)) {
                return
            }
            if (isPager || isPaging) {
                this._pageSizes = null
            }
            if (!isDataSource) {
                this._pager = null;
                this._invalidate();
                if ((0, _window.hasWindow)() && isPager && this.component) {
                    this.component.resize()
                }
            }
        }
    },
    dispose: function() {
        this._pager = null
    }
});
var pagerModule = {
    defaultOptions: function() {
        return {
            pager: {
                visible: "auto",
                showPageSizeSelector: false,
                allowedPageSizes: "auto",
                label: _message.default.format("dxPager-ariaLabel")
            }
        }
    },
    views: {
        pagerView: PagerView
    }
};
exports.pagerModule = pagerModule;
