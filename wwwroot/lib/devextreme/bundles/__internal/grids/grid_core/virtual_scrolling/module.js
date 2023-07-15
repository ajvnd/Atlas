/**
 * DevExtreme (bundles/__internal/grids/grid_core/virtual_scrolling/module.js)
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
exports.virtualScrollingModule = void 0;
var _size = require("../../../../core/utils/size");
var _renderer = _interopRequireDefault(require("../../../../core/renderer"));
var _window = require("../../../../core/utils/window");
var _iterator = require("../../../../core/utils/iterator");
var _deferred = require("../../../../core/utils/deferred");
var _browser = _interopRequireDefault(require("../../../../core/utils/browser"));
var _position = require("../../../../core/utils/position");
var _dom = require("../../../../core/utils/dom");
var _type = require("../../../../core/utils/type");
var _load_indicator = _interopRequireDefault(require("../../../../ui/load_indicator"));
var _module_core = require("./module_core");
var _module_utils = _interopRequireDefault(require("../module_utils"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var BOTTOM_LOAD_PANEL_CLASS = "bottom-load-panel";
var TABLE_CONTENT_CLASS = "table-content";
var GROUP_SPACE_CLASS = "group-space";
var CONTENT_CLASS = "content";
var FREESPACE_CLASS = "dx-freespace-row";
var COLUMN_LINES_CLASS = "dx-column-lines";
var VIRTUAL_ROW_CLASS = "dx-virtual-row";
var ROW_INSERTED = "dx-row-inserted";
var SCROLLING_MODE_INFINITE = "infinite";
var SCROLLING_MODE_VIRTUAL = "virtual";
var LOAD_TIMEOUT = 300;
var LEGACY_SCROLLING_MODE = "scrolling.legacyMode";
var VISIBLE_PAGE_INDEX = "paging.pageIndex";
var isVirtualMode = function(that) {
    return that.option("scrolling.mode") === SCROLLING_MODE_VIRTUAL
};
var isAppendMode = function(that) {
    return that.option("scrolling.mode") === SCROLLING_MODE_INFINITE
};
var isVirtualPaging = function(that) {
    return isVirtualMode(that) || isAppendMode(that)
};
var _correctCount = function(items, count, fromEnd, isItemCountableFunc) {
    for (var i = 0; i < count + 1; i++) {
        var item = items[fromEnd ? items.length - 1 - i : i];
        if (item && !isItemCountableFunc(item, i === count, fromEnd)) {
            count++
        }
    }
    return count
};
var isItemCountableByDataSource = function(item, dataSource) {
    return "data" === item.rowType && !item.isNewRow || "group" === item.rowType && dataSource.isGroupItemCountable(item.data)
};
var updateItemIndices = function(items) {
    items.forEach((function(item, index) {
        item.rowIndex = index
    }));
    return items
};
var VirtualScrollingDataSourceAdapterExtender = function() {
    var _updateLoading = function(that) {
        var beginPageIndex = that._virtualScrollController.beginPageIndex(-1);
        if (isVirtualMode(that)) {
            if (beginPageIndex < 0 || that.viewportSize() >= 0 && that.getViewportItemIndex() >= 0 && (beginPageIndex * that.pageSize() > that.getViewportItemIndex() || beginPageIndex * that.pageSize() + that.itemsCount() < that.getViewportItemIndex() + that.viewportSize()) && that._dataSource.isLoading()) {
                if (!that._isLoading) {
                    that._isLoading = true;
                    that.loadingChanged.fire(true)
                }
            } else if (that._isLoading) {
                that._isLoading = false;
                that.loadingChanged.fire(false)
            }
        }
    };
    var result = {
        init: function() {
            this.callBase.apply(this, arguments);
            this._items = [];
            this._totalCount = -1;
            this._isLoaded = true;
            this._loadPageCount = 1;
            this._virtualScrollController = new _module_core.VirtualScrollController(this.component, this._getVirtualScrollDataOptions())
        },
        _getVirtualScrollDataOptions: function() {
            var that = this;
            return {
                pageSize: function() {
                    return that.pageSize()
                },
                totalItemsCount: function() {
                    return that.totalItemsCount()
                },
                hasKnownLastPage: function() {
                    return that.hasKnownLastPage()
                },
                pageIndex: function(index) {
                    return that._dataSource.pageIndex(index)
                },
                isLoading: function() {
                    return that._dataSource.isLoading() && !that.isCustomLoading()
                },
                pageCount: function() {
                    return that.pageCount()
                },
                load: function() {
                    return that._dataSource.load()
                },
                updateLoading: function() {
                    _updateLoading(that)
                },
                itemsCount: function() {
                    return that.itemsCount(true)
                },
                items: function() {
                    return that._dataSource.items()
                },
                viewportItems: function(items) {
                    if (items) {
                        that._items = items
                    }
                    return that._items
                },
                onChanged: function(e) {
                    that.changed.fire(e)
                },
                changingDuration: function() {
                    if (that.isLoading()) {
                        return LOAD_TIMEOUT
                    }
                    return that._renderTime || 0
                }
            }
        },
        _handleLoadingChanged: function(isLoading) {
            if (false === this.option(LEGACY_SCROLLING_MODE)) {
                this.callBase.apply(this, arguments);
                return
            }
            if (!isVirtualMode(this) || this._isLoadingAll) {
                this._isLoading = isLoading;
                this.callBase.apply(this, arguments)
            }
            if (isLoading) {
                this._startLoadTime = new Date
            } else {
                this._startLoadTime = void 0
            }
        },
        _handleLoadError: function() {
            if (false !== this.option(LEGACY_SCROLLING_MODE)) {
                this._isLoading = false;
                this.loadingChanged.fire(false)
            }
            this.callBase.apply(this, arguments)
        },
        _handleDataChanged: function(e) {
            if (false === this.option(LEGACY_SCROLLING_MODE)) {
                this._items = this._dataSource.items().slice();
                this._totalCount = this._dataSourceTotalCount(true);
                this.callBase.apply(this, arguments);
                return
            }
            var callBase = this.callBase.bind(this);
            this._virtualScrollController.handleDataChanged(callBase, e)
        },
        _customizeRemoteOperations: function(options, operationTypes) {
            var newMode = false === this.option(LEGACY_SCROLLING_MODE);
            var renderAsync = this.option("scrolling.renderAsync");
            if (!(0, _type.isDefined)(renderAsync)) {
                renderAsync = this._renderTime >= this.option("scrolling.renderingThreshold")
            }
            if ((isVirtualMode(this) || isAppendMode(this) && newMode) && !operationTypes.reload && (operationTypes.skip || newMode) && !renderAsync) {
                options.delay = void 0
            }
            this.callBase.apply(this, arguments)
        },
        items: function() {
            return this._items
        },
        _dataSourceTotalCount: function(isBase) {
            return false === this.option(LEGACY_SCROLLING_MODE) && isVirtualMode(this) && !isBase ? this._totalCount : this.callBase()
        },
        itemsCount: function(isBase) {
            if (isBase || false === this.option(LEGACY_SCROLLING_MODE)) {
                return this.callBase()
            }
            return this._virtualScrollController.itemsCount()
        },
        load: function(loadOptions) {
            if (false === this.option(LEGACY_SCROLLING_MODE) || loadOptions) {
                return this.callBase(loadOptions)
            }
            return this._virtualScrollController.load()
        },
        isLoading: function() {
            return false === this.option(LEGACY_SCROLLING_MODE) ? this._dataSource.isLoading() : this._isLoading
        },
        isLoaded: function() {
            return this._dataSource.isLoaded() && this._isLoaded
        },
        resetPagesCache: function(isLiveUpdate) {
            if (!isLiveUpdate) {
                this._virtualScrollController.reset(true)
            }
            this.callBase.apply(this, arguments)
        },
        _changeRowExpandCore: function() {
            var result = this.callBase.apply(this, arguments);
            if (false === this.option(LEGACY_SCROLLING_MODE)) {
                return result
            }
            this.resetPagesCache();
            _updateLoading(this);
            return result
        },
        reload: function() {
            this._dataSource.pageIndex(this.pageIndex());
            var virtualScrollController = this._virtualScrollController;
            if (false !== this.option(LEGACY_SCROLLING_MODE) && virtualScrollController) {
                var d = new _deferred.Deferred;
                this.callBase.apply(this, arguments).done((function(r) {
                    var delayDeferred = virtualScrollController.getDelayDeferred();
                    if (delayDeferred) {
                        delayDeferred.done(d.resolve).fail(d.reject)
                    } else {
                        d.resolve(r)
                    }
                })).fail(d.reject);
                return d
            }
            return this.callBase.apply(this, arguments)
        },
        refresh: function(options, operationTypes) {
            if (false !== this.option(LEGACY_SCROLLING_MODE)) {
                var storeLoadOptions = options.storeLoadOptions;
                var dataSource = this._dataSource;
                if (operationTypes.reload) {
                    this._virtualScrollController.reset();
                    dataSource.items().length = 0;
                    this._isLoaded = false;
                    _updateLoading(this);
                    this._isLoaded = true;
                    if (isAppendMode(this)) {
                        this.pageIndex(0);
                        dataSource.pageIndex(0);
                        storeLoadOptions.pageIndex = 0;
                        options.pageIndex = 0;
                        storeLoadOptions.skip = 0
                    } else {
                        dataSource.pageIndex(this.pageIndex());
                        if (dataSource.paginate()) {
                            options.pageIndex = this.pageIndex();
                            storeLoadOptions.skip = this.pageIndex() * this.pageSize()
                        }
                    }
                } else if (isAppendMode(this) && storeLoadOptions.skip && this._totalCountCorrection < 0) {
                    storeLoadOptions.skip += this._totalCountCorrection
                }
            }
            return this.callBase.apply(this, arguments)
        },
        dispose: function() {
            this._virtualScrollController.dispose();
            this.callBase.apply(this, arguments)
        },
        loadPageCount: function(count) {
            if (!(0, _type.isDefined)(count)) {
                return this._loadPageCount
            }
            this._loadPageCount = count
        },
        _handleDataLoading: function(options) {
            var loadPageCount = this.loadPageCount();
            var pageSize = this.pageSize();
            var newMode = false === this.option(LEGACY_SCROLLING_MODE);
            var storeLoadOptions = options.storeLoadOptions;
            var takeIsDefined = (0, _type.isDefined)(storeLoadOptions.take);
            options.loadPageCount = loadPageCount;
            if (!options.isCustomLoading && newMode && takeIsDefined && loadPageCount > 1 && pageSize > 0) {
                storeLoadOptions.take = loadPageCount * pageSize
            }
            this.callBase.apply(this, arguments)
        },
        _loadPageSize: function() {
            return this.callBase.apply(this, arguments) * this.loadPageCount()
        }
    };
    ["beginPageIndex", "endPageIndex", "pageIndex"].forEach((function(name) {
        result[name] = function() {
            if (false === this.option(LEGACY_SCROLLING_MODE)) {
                var dataSource = this._dataSource;
                return dataSource.pageIndex.apply(dataSource, arguments)
            }
            var virtualScrollController = this._virtualScrollController;
            return virtualScrollController[name].apply(virtualScrollController, arguments)
        }
    }));
    ["virtualItemsCount", "getContentOffset", "getVirtualContentSize", "setContentItemSizes", "setViewportPosition", "getViewportItemIndex", "setViewportItemIndex", "getItemIndexByPosition", "viewportSize", "viewportItemSize", "getItemSize", "getItemSizes", "loadIfNeed"].forEach((function(name) {
        result[name] = function() {
            var virtualScrollController = this._virtualScrollController;
            return virtualScrollController[name].apply(virtualScrollController, arguments)
        }
    }));
    return result
}();
var VirtualScrollingRowsViewExtender = function() {
    var removeEmptyRows = function($emptyRows, className) {
        var tBodies = $emptyRows.toArray().map((function(row) {
            return (0, _renderer.default)(row).parent(".".concat(className)).get(0)
        })).filter((function(row) {
            return row
        }));
        if (tBodies.length) {
            $emptyRows = (0, _renderer.default)(tBodies)
        }
        var rowCount = className === FREESPACE_CLASS ? $emptyRows.length - 1 : $emptyRows.length;
        for (var i = 0; i < rowCount; i++) {
            $emptyRows.eq(i).remove()
        }
    };
    return {
        init: function() {
            var _this = this;
            var _a;
            var dataController = this.getController("data");
            this.callBase();
            dataController.pageChanged.add((function(pageIndex) {
                var scrollTop = _this._scrollTop;
                _this.scrollToPage(null !== pageIndex && void 0 !== pageIndex ? pageIndex : dataController.pageIndex());
                if (false === _this.option(LEGACY_SCROLLING_MODE) && _this._scrollTop === scrollTop) {
                    dataController.updateViewport()
                }
            }));
            dataController.dataSourceChanged.add((function() {
                !_this._scrollTop && _this._scrollToCurrentPageOnResize()
            }));
            null === (_a = dataController.stateLoaded) || void 0 === _a ? void 0 : _a.add((function() {
                _this._scrollToCurrentPageOnResize()
            }));
            this._scrollToCurrentPageOnResize()
        },
        _scrollToCurrentPageOnResize: function() {
            var _this2 = this;
            var dataController = this.getController("data");
            if (dataController.pageIndex() > 0) {
                this.resizeCompleted.add((function resizeHandler() {
                    _this2.resizeCompleted.remove(resizeHandler);
                    _this2.scrollToPage(dataController.pageIndex())
                }))
            }
        },
        scrollToPage: function(pageIndex) {
            var dataController = this._dataController;
            var pageSize = dataController ? dataController.pageSize() : 0;
            var scrollPosition;
            if (isVirtualMode(this) || isAppendMode(this)) {
                var itemSize = dataController.getItemSize();
                var itemSizes = dataController.getItemSizes();
                var itemIndex = pageIndex * pageSize;
                scrollPosition = itemIndex * itemSize;
                for (var index in itemSizes) {
                    if (parseInt(index) < itemIndex) {
                        scrollPosition += itemSizes[index] - itemSize
                    }
                }
            } else {
                scrollPosition = 0
            }
            this.scrollTo({
                y: scrollPosition,
                x: this._scrollLeft
            })
        },
        renderDelayedTemplates: function() {
            var _this3 = this;
            this.waitAsyncTemplates().done((function() {
                _this3._updateContentPosition(true)
            }));
            this.callBase.apply(this, arguments)
        },
        _renderCore: function(e) {
            var startRenderTime = new Date;
            var deferred = this.callBase.apply(this, arguments);
            var dataSource = this._dataController._dataSource;
            if (dataSource && e) {
                var itemCount = e.items ? e.items.length : 20;
                var viewportSize = this._dataController.viewportSize() || 20;
                if (_module_utils.default.isVirtualRowRendering(this) && itemCount > 0 && false !== this.option(LEGACY_SCROLLING_MODE)) {
                    dataSource._renderTime = (new Date - startRenderTime) * viewportSize / itemCount
                } else {
                    dataSource._renderTime = new Date - startRenderTime
                }
            }
            return deferred
        },
        _getRowElements: function(tableElement) {
            var $rows = this.callBase(tableElement);
            return $rows && $rows.not(".".concat(VIRTUAL_ROW_CLASS))
        },
        _removeRowsElements: function(contentTable, removeCount, changeType) {
            var rowElements = this._getRowElements(contentTable).toArray();
            if ("append" === changeType) {
                rowElements = rowElements.slice(0, removeCount)
            } else {
                rowElements = rowElements.slice(-removeCount)
            }
            var errorHandlingController = this.getController("errorHandling");
            rowElements.map((function(rowElement) {
                var $rowElement = (0, _renderer.default)(rowElement);
                errorHandlingController && errorHandlingController.removeErrorRow($rowElement.next());
                $rowElement.remove()
            }))
        },
        _updateContent: function(tableElement, change) {
            var _this4 = this;
            var $freeSpaceRowElements;
            var contentElement = this._findContentElement();
            var changeType = change && change.changeType;
            var d = (0, _deferred.Deferred)();
            var contentTable = contentElement.children().first();
            if ("append" === changeType || "prepend" === changeType) {
                this.waitAsyncTemplates().done((function() {
                    var $tBodies = _this4._getBodies(tableElement);
                    if (1 === $tBodies.length) {
                        _this4._getBodies(contentTable)["append" === changeType ? "append" : "prepend"]($tBodies.children())
                    } else {
                        $tBodies["append" === changeType ? "appendTo" : "prependTo"](contentTable)
                    }
                    tableElement.remove();
                    $freeSpaceRowElements = _this4._getFreeSpaceRowElements(contentTable);
                    removeEmptyRows($freeSpaceRowElements, FREESPACE_CLASS);
                    if (change.removeCount) {
                        _this4._removeRowsElements(contentTable, change.removeCount, changeType)
                    }
                    _this4._restoreErrorRow(contentTable);
                    d.resolve()
                })).fail(d.reject)
            } else {
                this.callBase.apply(this, arguments).done((function() {
                    if ("update" === changeType) {
                        _this4._restoreErrorRow(contentTable)
                    }
                    d.resolve()
                })).fail(d.reject)
            }
            return d.promise().done((function() {
                _this4._updateBottomLoading()
            }))
        },
        _addVirtualRow: function($table, isFixed, location, position) {
            if (!position) {
                return
            }
            var $virtualRow = this._createEmptyRow(VIRTUAL_ROW_CLASS, isFixed, position);
            $virtualRow = this._wrapRowIfNeed($table, $virtualRow);
            this._appendEmptyRow($table, $virtualRow, location)
        },
        _updateContentItemSizes: function() {
            var rowHeights = this._getRowHeights();
            var correctedRowHeights = this._correctRowHeights(rowHeights);
            this._dataController.setContentItemSizes(correctedRowHeights)
        },
        _updateViewportSize: function(viewportHeight, scrollTop) {
            if (!(0, _type.isDefined)(viewportHeight)) {
                viewportHeight = this._hasHeight ? (0, _size.getOuterHeight)(this.element()) : (0, _size.getOuterHeight)((0, _window.getWindow)())
            }
            this._dataController.viewportHeight(viewportHeight, scrollTop)
        },
        _getRowHeights: function() {
            var _a, _b;
            var isPopupEditMode = null === (_b = null === (_a = this.getController("editing")) || void 0 === _a ? void 0 : _a.isPopupEditMode) || void 0 === _b ? void 0 : _b.call(_a);
            var rowElements = this._getRowElements(this._tableElement).toArray();
            if (isPopupEditMode) {
                rowElements = rowElements.filter((function(row) {
                    return !(0, _renderer.default)(row).hasClass(ROW_INSERTED)
                }))
            }
            return rowElements.map((function(row) {
                return (0, _position.getBoundingRect)(row).height
            }))
        },
        _correctRowHeights: function(rowHeights) {
            var dataController = this._dataController;
            var dataSource = dataController._dataSource;
            var correctedRowHeights = [];
            var visibleRows = dataController.getVisibleRows();
            var itemSize = 0;
            var firstCountableItem = true;
            var lastLoadIndex = -1;
            for (var i = 0; i < rowHeights.length; i++) {
                var currentItem = visibleRows[i];
                if (!(0, _type.isDefined)(currentItem)) {
                    continue
                }
                if (false === this.option(LEGACY_SCROLLING_MODE)) {
                    if (lastLoadIndex >= 0 && lastLoadIndex !== currentItem.loadIndex) {
                        correctedRowHeights.push(itemSize);
                        itemSize = 0
                    }
                    lastLoadIndex = currentItem.loadIndex
                } else if (isItemCountableByDataSource(currentItem, dataSource)) {
                    if (firstCountableItem) {
                        firstCountableItem = false
                    } else {
                        correctedRowHeights.push(itemSize);
                        itemSize = 0
                    }
                }
                itemSize += rowHeights[i]
            }
            itemSize > 0 && correctedRowHeights.push(itemSize);
            return correctedRowHeights
        },
        _updateContentPosition: function(isRender) {
            var _this5 = this;
            var dataController = this._dataController;
            var rowHeight = this._rowHeight || 20;
            dataController.viewportItemSize(rowHeight);
            if (isVirtualMode(this) || _module_utils.default.isVirtualRowRendering(this)) {
                if (!isRender) {
                    this._updateContentItemSizes()
                }
                var top = dataController.getContentOffset("begin");
                var bottom = dataController.getContentOffset("end");
                var $tables = this.getTableElements();
                var $virtualRows = $tables.children("tbody").children(".".concat(VIRTUAL_ROW_CLASS));
                removeEmptyRows($virtualRows, VIRTUAL_ROW_CLASS);
                $tables.each((function(index, element) {
                    var isFixed = index > 0;
                    var prevFixed = _this5._isFixedTableRendering;
                    _this5._isFixedTableRendering = isFixed;
                    _this5._addVirtualRow((0, _renderer.default)(element), isFixed, "top", top);
                    _this5._addVirtualRow((0, _renderer.default)(element), isFixed, "bottom", bottom);
                    _this5._isFixedTableRendering = prevFixed
                }))
            }
        },
        _isTableLinesDisplaysCorrect: function(table) {
            var hasColumnLines = table.find(".".concat(COLUMN_LINES_CLASS)).length > 0;
            return hasColumnLines === this.option("showColumnLines")
        },
        _isColumnElementsEqual: function($columns, $virtualColumns) {
            var result = $columns.length === $virtualColumns.length;
            if (result) {
                (0, _iterator.each)($columns, (function(index, element) {
                    if (element.style.width !== $virtualColumns[index].style.width) {
                        result = false;
                        return result
                    }
                    return
                }))
            }
            return result
        },
        _getCellClasses: function(column) {
            var classes = [];
            var cssClass = column.cssClass;
            var isExpandColumn = "expand" === column.command;
            cssClass && classes.push(cssClass);
            isExpandColumn && classes.push(this.addWidgetPrefix(GROUP_SPACE_CLASS));
            return classes
        },
        _findBottomLoadPanel: function($contentElement) {
            var $element = $contentElement || this.element();
            var $bottomLoadPanel = $element && $element.find(".".concat(this.addWidgetPrefix(BOTTOM_LOAD_PANEL_CLASS)));
            if ($bottomLoadPanel && $bottomLoadPanel.length) {
                return $bottomLoadPanel
            }
        },
        _updateBottomLoading: function() {
            var virtualMode = isVirtualMode(this);
            var appendMode = isAppendMode(this);
            var showBottomLoading = !this._dataController.hasKnownLastPage() && this._dataController.isLoaded() && (virtualMode || appendMode);
            var $contentElement = this._findContentElement();
            var bottomLoadPanelElement = this._findBottomLoadPanel($contentElement);
            if (showBottomLoading) {
                if (!bottomLoadPanelElement) {
                    (0, _renderer.default)("<div>").addClass(this.addWidgetPrefix(BOTTOM_LOAD_PANEL_CLASS)).append(this._createComponent((0, _renderer.default)("<div>"), _load_indicator.default).$element()).appendTo($contentElement)
                }
            } else if (bottomLoadPanelElement) {
                bottomLoadPanelElement.remove()
            }
        },
        _handleScroll: function(e) {
            var legacyScrollingMode = true === this.option(LEGACY_SCROLLING_MODE);
            var zeroTopPosition = 0 === e.scrollOffset.top;
            var isScrollTopChanged = this._scrollTop !== e.scrollOffset.top;
            var hasScrolled = isScrollTopChanged || e.forceUpdateScrollPosition;
            var isValidScrollTarget = this._hasHeight || !legacyScrollingMode && zeroTopPosition;
            if (hasScrolled && isValidScrollTarget && this._rowHeight) {
                this._scrollTop = e.scrollOffset.top;
                var isVirtualRowRendering = isVirtualMode(this) || "standard" !== this.option("scrolling.rowRenderingMode");
                if (isVirtualRowRendering && false === this.option(LEGACY_SCROLLING_MODE)) {
                    this._updateContentItemSizes();
                    this._updateViewportSize(null, this._scrollTop)
                }
                this._dataController.setViewportPosition(e.scrollOffset.top)
            }
            this.callBase.apply(this, arguments)
        },
        _needUpdateRowHeight: function(itemsCount) {
            return this.callBase.apply(this, arguments) || itemsCount > 0 && isAppendMode(this) && !_module_utils.default.isVirtualRowRendering(this)
        },
        _updateRowHeight: function() {
            this.callBase.apply(this, arguments);
            if (this._rowHeight) {
                this._updateContentPosition();
                var viewportHeight = this._hasHeight ? (0, _size.getOuterHeight)(this.element()) : (0, _size.getOuterHeight)((0, _window.getWindow)());
                var dataController = this._dataController;
                if (false === this.option(LEGACY_SCROLLING_MODE)) {
                    this._updateViewportSize(viewportHeight);
                    dataController.updateViewport()
                } else {
                    dataController.viewportSize(Math.ceil(viewportHeight / this._rowHeight))
                }
            }
        },
        updateFreeSpaceRowHeight: function() {
            var result = this.callBase.apply(this, arguments);
            if (result) {
                this._updateContentPosition()
            }
            return result
        },
        setLoading: function(isLoading, messageText) {
            var dataController = this._dataController;
            var hasBottomLoadPanel = dataController.pageIndex() > 0 && dataController.isLoaded() && !!this._findBottomLoadPanel();
            if (false === this.option(LEGACY_SCROLLING_MODE) && isLoading && dataController.isViewportChanging()) {
                return
            }
            if (hasBottomLoadPanel) {
                isLoading = false
            }
            this.callBase.call(this, isLoading, messageText)
        },
        _resizeCore: function() {
            var that = this;
            var $element = that.element();
            that.callBase();
            if (that.component.$element() && !that._windowScroll && (0, _dom.isElementInDom)($element)) {
                that._windowScroll = (0, _module_core.subscribeToExternalScrollers)($element, (function(scrollPos) {
                    if (!that._hasHeight && that._rowHeight) {
                        that._dataController.setViewportPosition(scrollPos)
                    }
                }), that.component.$element());
                that.on("disposing", (function() {
                    that._windowScroll.dispose()
                }))
            }
            if (false !== this.option(LEGACY_SCROLLING_MODE)) {
                that.loadIfNeed()
            }
        },
        loadIfNeed: function() {
            var _a;
            var dataController = this._dataController;
            null === (_a = null === dataController || void 0 === dataController ? void 0 : dataController.loadIfNeed) || void 0 === _a ? void 0 : _a.call(dataController)
        },
        setColumnWidths: function(widths) {
            var scrollable = this.getScrollable();
            var $content;
            this.callBase.apply(this, arguments);
            if ("virtual" === this.option("scrolling.mode")) {
                $content = scrollable ? (0, _renderer.default)(scrollable.content()) : this.element();
                this.callBase(widths, $content.children(".".concat(this.addWidgetPrefix(CONTENT_CLASS))).children(":not(.".concat(this.addWidgetPrefix(TABLE_CONTENT_CLASS), ")")))
            }
        },
        _restoreErrorRow: function() {
            if (false === this.option(LEGACY_SCROLLING_MODE)) {
                var errorHandling = this.getController("errorHandling");
                null === errorHandling || void 0 === errorHandling ? void 0 : errorHandling.removeErrorRow()
            }
            this.callBase.apply(this, arguments)
        },
        dispose: function() {
            clearTimeout(this._scrollTimeoutID);
            this.callBase()
        }
    }
}();
var virtualScrollingModule = {
    defaultOptions: function() {
        return {
            scrolling: {
                timeout: 300,
                updateTimeout: 300,
                minTimeout: 0,
                renderingThreshold: 100,
                removeInvisiblePages: true,
                rowPageSize: 5,
                prerenderedRowChunkSize: 1,
                mode: "standard",
                preloadEnabled: false,
                rowRenderingMode: "standard",
                loadTwoPagesOnStart: false,
                legacyMode: false,
                prerenderedRowCount: 1
            }
        }
    },
    extenders: {
        dataSourceAdapter: VirtualScrollingDataSourceAdapterExtender,
        controllers: {
            data: function() {
                var members = {
                    _refreshDataSource: function() {
                        var baseResult = this.callBase.apply(this, arguments) || (new _deferred.Deferred).resolve().promise();
                        baseResult.done(this.initVirtualRows.bind(this));
                        return baseResult
                    },
                    _loadDataSource: function() {
                        var _a;
                        if (this._rowsScrollController && isVirtualPaging(this)) {
                            var _ref = (0, _type.isDefined)(this._loadViewportParams) ? this.getLoadPageParams() : {
                                    loadPageCount: void 0
                                },
                                loadPageCount = _ref.loadPageCount;
                            loadPageCount >= 1 && (null === (_a = this._dataSource) || void 0 === _a ? void 0 : _a.loadPageCount(loadPageCount))
                        }
                        return this.callBase.apply(this, arguments)
                    },
                    getRowPageSize: function() {
                        var rowPageSize = this.option("scrolling.rowPageSize");
                        var pageSize = this.pageSize();
                        return pageSize && pageSize < rowPageSize ? pageSize : rowPageSize
                    },
                    reload: function() {
                        var _this6 = this;
                        var rowsScrollController = this._rowsScrollController || this._dataSource;
                        var itemIndex = rowsScrollController && rowsScrollController.getItemIndexByPosition();
                        var result = this.callBase.apply(this, arguments);
                        return result && result.done((function() {
                            var _a;
                            if (isVirtualMode(_this6) || _module_utils.default.isVirtualRowRendering(_this6)) {
                                var rowIndexOffset = _this6.getRowIndexOffset();
                                var rowIndex = Math.floor(itemIndex) - rowIndexOffset;
                                var component = _this6.component;
                                var scrollable = component.getScrollable && component.getScrollable();
                                var isSortingOperation = _this6.dataSource().operationTypes().sorting;
                                if (scrollable && !isSortingOperation && rowIndex >= 0) {
                                    var rowElement = component.getRowElement(rowIndex);
                                    var $rowElement = rowElement && rowElement[0] && (0, _renderer.default)(rowElement[0]);
                                    var top = $rowElement && $rowElement.position().top;
                                    var isChromeLatest = _browser.default.chrome && Number(null !== (_a = _browser.default.version) && void 0 !== _a ? _a : 0) >= 91;
                                    var allowedTopOffset = _browser.default.mozilla || isChromeLatest ? 1 : 0;
                                    if (top > allowedTopOffset) {
                                        top = Math.round(top + (0, _size.getOuterHeight)($rowElement) * (itemIndex % 1));
                                        scrollable.scrollTo({
                                            y: top
                                        })
                                    }
                                }
                            }
                        }))
                    },
                    initVirtualRows: function() {
                        var _this7 = this;
                        var virtualRowsRendering = _module_utils.default.isVirtualRowRendering(this);
                        this._allItems = null;
                        this._loadViewportParams = null;
                        if ("virtual" !== this.option("scrolling.mode") && !virtualRowsRendering || !virtualRowsRendering || false !== this.option(LEGACY_SCROLLING_MODE) && !this.option("scrolling.rowPageSize")) {
                            this._visibleItems = null;
                            this._rowsScrollController = null;
                            return
                        }
                        var pageIndex = !isVirtualMode(this) && this.pageIndex() >= this.pageCount() ? this.pageCount() - 1 : this.pageIndex();
                        this._rowPageIndex = Math.ceil(pageIndex * this.pageSize() / this.getRowPageSize());
                        this._visibleItems = false === this.option(LEGACY_SCROLLING_MODE) ? null : [];
                        this._viewportChanging = false;
                        this._needUpdateViewportAfterLoading = false;
                        if (!this._rowsScrollController) {
                            this._rowsScrollController = new _module_core.VirtualScrollController(this.component, this._getRowsScrollDataOptions(), true);
                            this._rowsScrollController.positionChanged.add((function() {
                                var _a;
                                if (false === _this7.option(LEGACY_SCROLLING_MODE)) {
                                    _this7._viewportChanging = true;
                                    _this7.loadViewport();
                                    _this7._viewportChanging = false;
                                    return
                                }
                                null === (_a = _this7._dataSource) || void 0 === _a ? void 0 : _a.setViewportItemIndex(_this7._rowsScrollController.getViewportItemIndex())
                            }))
                        }
                        if (false === this.option(LEGACY_SCROLLING_MODE)) {
                            this._updateLoadViewportParams()
                        }
                        if (this.isLoaded() && false !== this.option(LEGACY_SCROLLING_MODE)) {
                            this._rowsScrollController.load()
                        }
                    },
                    isViewportChanging: function() {
                        return this._viewportChanging
                    },
                    _getRowsScrollDataOptions: function() {
                        var that = this;
                        var isItemCountable = function(item) {
                            return isItemCountableByDataSource(item, that._dataSource)
                        };
                        return {
                            pageSize: function() {
                                return that.getRowPageSize()
                            },
                            loadedOffset: function() {
                                var _a;
                                return isVirtualMode(that) && (null === (_a = that._dataSource) || void 0 === _a ? void 0 : _a.lastLoadOptions().skip) || 0
                            },
                            loadedItemCount: function() {
                                return that._itemCount
                            },
                            totalItemsCount: function() {
                                if (isVirtualPaging(that)) {
                                    return that.totalItemsCount()
                                }
                                return false === that.option(LEGACY_SCROLLING_MODE) ? that._itemCount : that._items.filter(isItemCountable).length
                            },
                            hasKnownLastPage: function() {
                                return false === that.option(LEGACY_SCROLLING_MODE) ? that.hasKnownLastPage() : true
                            },
                            pageIndex: function(index) {
                                if (void 0 !== index) {
                                    that._rowPageIndex = index
                                }
                                return that._rowPageIndex
                            },
                            isLoading: function() {
                                return that.isLoading()
                            },
                            pageCount: function() {
                                var pageCount = Math.ceil(this.totalItemsCount() / this.pageSize());
                                return pageCount || 1
                            },
                            load: function() {
                                if (that._rowsScrollController.pageIndex() >= this.pageCount()) {
                                    that._rowPageIndex = this.pageCount() - 1;
                                    that._rowsScrollController.pageIndex(that._rowPageIndex)
                                }
                                if (!this.items().length && this.totalItemsCount()) {
                                    return
                                }
                                that._rowsScrollController.handleDataChanged((function(change) {
                                    change = change || {};
                                    change.changeType = change.changeType || "refresh";
                                    change.items = change.items || that._visibleItems;
                                    that._visibleItems.forEach((function(item, index) {
                                        item.rowIndex = index
                                    }));
                                    that._fireChanged(change)
                                }))
                            },
                            updateLoading: function() {},
                            itemsCount: function() {
                                return this.items(true).length
                            },
                            correctCount: function(items, count, fromEnd) {
                                return _correctCount(items, count, fromEnd, (function(item, isNextAfterLast, fromEnd) {
                                    if (item.isNewRow) {
                                        return isNextAfterLast && !fromEnd
                                    }
                                    if (isNextAfterLast && fromEnd) {
                                        return !item.isNewRow
                                    }
                                    return isItemCountable(item)
                                }))
                            },
                            items: function(countableOnly) {
                                var result = that._items;
                                if (that.option(LEGACY_SCROLLING_MODE)) {
                                    var dataSource = that.dataSource();
                                    var virtualItemsCount = null === dataSource || void 0 === dataSource ? void 0 : dataSource.virtualItemsCount();
                                    var begin = virtualItemsCount ? virtualItemsCount.begin : 0;
                                    var rowPageSize = that.getRowPageSize();
                                    var skip = that._rowPageIndex * rowPageSize - begin;
                                    var take = rowPageSize;
                                    if (skip < 0) {
                                        return []
                                    }
                                    if (skip) {
                                        skip = this.correctCount(result, skip);
                                        result = result.slice(skip)
                                    }
                                    if (take) {
                                        take = this.correctCount(result, take);
                                        result = result.slice(0, take)
                                    }
                                }
                                return countableOnly ? result.filter(isItemCountable) : result
                            },
                            viewportItems: function(items) {
                                if (items && false !== that.option(LEGACY_SCROLLING_MODE)) {
                                    that._visibleItems = items
                                }
                                return that._visibleItems
                            },
                            onChanged: function() {},
                            changingDuration: function() {
                                var dataSource = that.dataSource();
                                if ((null === dataSource || void 0 === dataSource ? void 0 : dataSource.isLoading()) && false !== that.option(LEGACY_SCROLLING_MODE)) {
                                    return LOAD_TIMEOUT
                                }
                                return (null === dataSource || void 0 === dataSource ? void 0 : dataSource._renderTime) || 0
                            }
                        }
                    },
                    _updateItemsCore: function(change) {
                        var _this8 = this;
                        var delta = this.getRowIndexDelta();
                        this.callBase.apply(this, arguments);
                        if (false === this.option(LEGACY_SCROLLING_MODE) && _module_utils.default.isVirtualRowRendering(this)) {
                            if ("update" === change.changeType && 0 === change.rowIndices.length && change.cancelEmptyChanges) {
                                change.cancel = true
                            }
                            return
                        }
                        var rowsScrollController = this._rowsScrollController;
                        if (rowsScrollController) {
                            var visibleItems = this._visibleItems;
                            var isRefresh = "refresh" === change.changeType || change.isLiveUpdate;
                            if ("append" === change.changeType && change.items && !change.items.length) {
                                return
                            }
                            if (isRefresh || "append" === change.changeType || "prepend" === change.changeType) {
                                change.cancel = true;
                                isRefresh && rowsScrollController.reset(true);
                                rowsScrollController.load()
                            } else {
                                if ("update" === change.changeType) {
                                    change.rowIndices.forEach((function(rowIndex, index) {
                                        var changeType = change.changeTypes[index];
                                        var newItem = change.items[index];
                                        if ("update" === changeType) {
                                            visibleItems[rowIndex] = newItem
                                        } else if ("insert" === changeType) {
                                            visibleItems.splice(rowIndex, 0, newItem)
                                        } else if ("remove" === changeType) {
                                            visibleItems.splice(rowIndex, 1)
                                        }
                                    }))
                                } else {
                                    visibleItems.forEach((function(item, index) {
                                        visibleItems[index] = _this8._items[index + delta] || visibleItems[index]
                                    }));
                                    change.items = visibleItems
                                }
                                updateItemIndices(visibleItems)
                            }
                        }
                    },
                    _updateLoadViewportParams: function() {
                        var viewportParams = this._rowsScrollController.getViewportParams();
                        var pageSize = this.pageSize();
                        if (viewportParams && !isVirtualPaging(this) && pageSize > 0) {
                            var pageOffset = this.pageIndex() * pageSize;
                            viewportParams.skip += pageOffset
                        }
                        this._loadViewportParams = viewportParams
                    },
                    _processItems: function() {
                        var _a;
                        var resultItems = this.callBase.apply(this, arguments);
                        if (false === this.option(LEGACY_SCROLLING_MODE)) {
                            var dataSource = this._dataSource;
                            var currentIndex = null !== (_a = null === dataSource || void 0 === dataSource ? void 0 : dataSource.lastLoadOptions().skip) && void 0 !== _a ? _a : 0;
                            var prevCountable;
                            var prevRowType;
                            var isPrevRowNew;
                            var wasCountableItem = false;
                            var newRows = [];
                            resultItems.forEach((function(item) {
                                var rowType = item.rowType;
                                var itemCountable = isItemCountableByDataSource(item, dataSource);
                                var isNextGroupItem = "group" === rowType && (prevCountable || itemCountable || "group" !== prevRowType && currentIndex > 0);
                                var isNextDataItem = "data" === rowType && itemCountable && (prevCountable || "group" !== prevRowType);
                                if (!item.isNewRow && (0, _type.isDefined)(prevCountable)) {
                                    var isPrevNewRowFirst = isPrevRowNew && !wasCountableItem;
                                    if ((isNextGroupItem || isNextDataItem) && !isPrevNewRowFirst) {
                                        currentIndex++
                                    }
                                }
                                if (isNextGroupItem || isNextDataItem) {
                                    wasCountableItem = true
                                }
                                if (item.isNewRow) {
                                    newRows.push(item)
                                } else {
                                    newRows.forEach((function(it) {
                                        it.loadIndex = currentIndex
                                    }));
                                    newRows = []
                                }
                                item.loadIndex = currentIndex;
                                prevCountable = itemCountable;
                                prevRowType = rowType;
                                isPrevRowNew = item.isNewRow
                            }));
                            newRows.forEach((function(it) {
                                it.loadIndex = currentIndex
                            }))
                        }
                        return resultItems
                    },
                    _afterProcessItems: function(items) {
                        var _this9 = this;
                        this._itemCount = items.filter((function(item) {
                            return isItemCountableByDataSource(item, _this9._dataSource)
                        })).length;
                        if ((0, _type.isDefined)(this._loadViewportParams)) {
                            this._updateLoadViewportParams();
                            var result = items;
                            this._allItems = items;
                            if (items.length) {
                                var _this$getLoadPagePara = this.getLoadPageParams(true),
                                    skipForCurrentPage = _this$getLoadPagePara.skipForCurrentPage;
                                var skip = items[0].loadIndex + skipForCurrentPage;
                                var take = this._loadViewportParams.take;
                                result = items.filter((function(it) {
                                    var isNewRowInEmptyData = it.isNewRow && it.loadIndex === skip && 0 === take;
                                    var isLoadIndexGreaterStart = it.loadIndex >= skip;
                                    var isLoadIndexLessEnd = it.loadIndex < skip + take || isNewRowInEmptyData;
                                    return isLoadIndexGreaterStart && isLoadIndexLessEnd
                                }))
                            }
                            return result
                        }
                        return this.callBase.apply(this, arguments)
                    },
                    _applyChange: function(change) {
                        var that = this;
                        var items = change.items;
                        var changeType = change.changeType;
                        var removeCount = change.removeCount;
                        if (removeCount) {
                            var fromEnd = "prepend" === changeType;
                            removeCount = _correctCount(that._items, removeCount, fromEnd, (function(item, isNextAfterLast) {
                                return "data" === item.rowType && !item.isNewRow || "group" === item.rowType && (that._dataSource.isGroupItemCountable(item.data) || isNextAfterLast)
                            }));
                            change.removeCount = removeCount
                        }
                        switch (changeType) {
                            case "prepend":
                                that._items.unshift.apply(that._items, items);
                                if (removeCount) {
                                    that._items.splice(-removeCount)
                                }
                                break;
                            case "append":
                                that._items.push.apply(that._items, items);
                                if (removeCount) {
                                    that._items.splice(0, removeCount)
                                }
                                break;
                            default:
                                that.callBase(change)
                        }
                    },
                    items: function(allItems) {
                        return allItems ? this._allItems || this._items : this._visibleItems || this._items
                    },
                    getRowIndexDelta: function() {
                        var delta = 0;
                        if (this.option(LEGACY_SCROLLING_MODE)) {
                            var visibleItems = this._visibleItems;
                            if (visibleItems && visibleItems[0]) {
                                delta = this._items.indexOf(visibleItems[0])
                            }
                        }
                        return delta < 0 ? 0 : delta
                    },
                    getRowIndexOffset: function(byLoadedRows) {
                        var _a;
                        var offset = 0;
                        var dataSource = this.dataSource();
                        var rowsScrollController = this._rowsScrollController;
                        var newMode = false === this.option(LEGACY_SCROLLING_MODE);
                        var virtualPaging = isVirtualPaging(this);
                        if (rowsScrollController && !byLoadedRows) {
                            if (newMode && (0, _type.isDefined)(this._loadViewportParams)) {
                                var _this$getLoadPagePara2 = this.getLoadPageParams(true),
                                    skipForCurrentPage = _this$getLoadPagePara2.skipForCurrentPage,
                                    pageIndex = _this$getLoadPagePara2.pageIndex;
                                var items = this.items(true);
                                offset = virtualPaging ? pageIndex * this.pageSize() : 0;
                                if (items.length) {
                                    var firstLoadIndex = items[0].loadIndex;
                                    offset += items.filter((function(item) {
                                        return item.loadIndex < firstLoadIndex + skipForCurrentPage
                                    })).length
                                }
                            } else {
                                offset = rowsScrollController.beginPageIndex() * rowsScrollController.pageSize()
                            }
                        } else if (virtualPaging && newMode && dataSource) {
                            offset = null !== (_a = dataSource.lastLoadOptions().skip) && void 0 !== _a ? _a : 0
                        } else if (isVirtualMode(this) && dataSource) {
                            offset = dataSource.beginPageIndex() * dataSource.pageSize()
                        }
                        return offset
                    },
                    getDataIndex: function() {
                        if (false === this.option(LEGACY_SCROLLING_MODE)) {
                            return this.getRowIndexOffset(true)
                        }
                        return this.callBase.apply(this, arguments)
                    },
                    viewportSize: function() {
                        var rowsScrollController = this._rowsScrollController;
                        var dataSource = this._dataSource;
                        var result = null === rowsScrollController || void 0 === rowsScrollController ? void 0 : rowsScrollController.viewportSize.apply(rowsScrollController, arguments);
                        if (false === this.option(LEGACY_SCROLLING_MODE)) {
                            return result
                        }
                        return null === dataSource || void 0 === dataSource ? void 0 : dataSource.viewportSize.apply(dataSource, arguments)
                    },
                    viewportHeight: function(height, scrollTop) {
                        var _a;
                        null === (_a = this._rowsScrollController) || void 0 === _a ? void 0 : _a.viewportHeight(height, scrollTop)
                    },
                    viewportItemSize: function() {
                        var rowsScrollController = this._rowsScrollController;
                        var dataSource = this._dataSource;
                        var result = null === rowsScrollController || void 0 === rowsScrollController ? void 0 : rowsScrollController.viewportItemSize.apply(rowsScrollController, arguments);
                        if (false === this.option(LEGACY_SCROLLING_MODE)) {
                            return result
                        }
                        return null === dataSource || void 0 === dataSource ? void 0 : dataSource.viewportItemSize.apply(dataSource, arguments)
                    },
                    setViewportPosition: function() {
                        var rowsScrollController = this._rowsScrollController;
                        var dataSource = this._dataSource;
                        this._isPaging = false;
                        if (rowsScrollController) {
                            rowsScrollController.setViewportPosition.apply(rowsScrollController, arguments)
                        } else {
                            null === dataSource || void 0 === dataSource ? void 0 : dataSource.setViewportPosition.apply(dataSource, arguments)
                        }
                    },
                    setContentItemSizes: function(sizes) {
                        var rowsScrollController = this._rowsScrollController;
                        var dataSource = this._dataSource;
                        var result = null === rowsScrollController || void 0 === rowsScrollController ? void 0 : rowsScrollController.setContentItemSizes(sizes);
                        if (false === this.option(LEGACY_SCROLLING_MODE)) {
                            return result
                        }
                        return null === dataSource || void 0 === dataSource ? void 0 : dataSource.setContentItemSizes(sizes)
                    },
                    getPreloadedRowCount: function() {
                        var preloadCount = this.option("scrolling.preloadedRowCount");
                        var preloadEnabled = this.option("scrolling.preloadEnabled");
                        if ((0, _type.isDefined)(preloadCount)) {
                            return preloadCount
                        }
                        var viewportSize = this.viewportSize();
                        return preloadEnabled ? 2 * viewportSize : viewportSize
                    },
                    getLoadPageParams: function(byLoadedPage) {
                        var _a, _b;
                        var pageSize = this.pageSize();
                        var viewportParams = this._loadViewportParams;
                        var lastLoadOptions = null === (_a = this._dataSource) || void 0 === _a ? void 0 : _a.lastLoadOptions();
                        var loadedPageIndex = (null === lastLoadOptions || void 0 === lastLoadOptions ? void 0 : lastLoadOptions.pageIndex) || 0;
                        var loadedTake = (null === lastLoadOptions || void 0 === lastLoadOptions ? void 0 : lastLoadOptions.take) || 0;
                        var isScrollingBack = this._rowsScrollController.isScrollingBack();
                        var topPreloadCount = isScrollingBack ? this.getPreloadedRowCount() : 0;
                        var bottomPreloadCount = isScrollingBack ? 0 : this.getPreloadedRowCount();
                        var totalCountCorrection = (null === (_b = this._dataSource) || void 0 === _b ? void 0 : _b.totalCountCorrection()) || 0;
                        var skipWithPreload = Math.max(0, viewportParams.skip - topPreloadCount);
                        var pageIndex = byLoadedPage ? loadedPageIndex : Math.floor(pageSize ? skipWithPreload / pageSize : 0);
                        var pageOffset = pageIndex * pageSize;
                        var skipForCurrentPage = viewportParams.skip - pageOffset;
                        var loadingTake = viewportParams.take + skipForCurrentPage + bottomPreloadCount - totalCountCorrection;
                        var take = byLoadedPage ? loadedTake : loadingTake;
                        var loadPageCount = Math.ceil(pageSize ? take / pageSize : 0);
                        return {
                            pageIndex: pageIndex,
                            loadPageCount: Math.max(1, loadPageCount),
                            skipForCurrentPage: Math.max(0, skipForCurrentPage)
                        }
                    },
                    _updateVisiblePageIndex: function(currentPageIndex) {
                        if (!this._rowsScrollController) {
                            return
                        }
                        if ((0, _type.isDefined)(currentPageIndex)) {
                            this._silentOption(VISIBLE_PAGE_INDEX, currentPageIndex);
                            this.pageChanged.fire();
                            return
                        }
                        var viewPortItemIndex = this._rowsScrollController.getViewportItemIndex();
                        var newPageIndex = Math.floor(viewPortItemIndex / this.pageSize());
                        if (this.pageIndex() !== newPageIndex) {
                            this._silentOption(VISIBLE_PAGE_INDEX, newPageIndex);
                            this.updateItems({
                                changeType: "pageIndex"
                            })
                        }
                    },
                    _getChangedLoadParams: function() {
                        var loadedPageParams = this.getLoadPageParams(true);
                        var _this$getLoadPagePara3 = this.getLoadPageParams(),
                            pageIndex = _this$getLoadPagePara3.pageIndex,
                            loadPageCount = _this$getLoadPagePara3.loadPageCount;
                        var pageIndexIsValid = this._pageIndexIsValid(pageIndex);
                        var result = null;
                        if (!this._isLoading && pageIndexIsValid && (pageIndex !== loadedPageParams.pageIndex || loadPageCount !== loadedPageParams.loadPageCount)) {
                            result = {
                                pageIndex: pageIndex,
                                loadPageCount: loadPageCount
                            }
                        }
                        return result
                    },
                    _pageIndexIsValid: function(pageIndex) {
                        var result = true;
                        if (isAppendMode(this) && this.hasKnownLastPage() || isVirtualMode(this)) {
                            result = pageIndex * this.pageSize() < this.totalItemsCount()
                        }
                        return result
                    },
                    _loadItems: function(checkLoading, viewportIsFilled) {
                        var _this10 = this;
                        var _a, _b;
                        var virtualPaging = isVirtualPaging(this);
                        var dataSourceAdapter = this._dataSource;
                        var changedParams = this._getChangedLoadParams();
                        var currentLoadPageCount = null !== (_a = null === dataSourceAdapter || void 0 === dataSourceAdapter ? void 0 : dataSourceAdapter.loadPageCount()) && void 0 !== _a ? _a : 0;
                        var lastRequiredItemCount = this.pageSize() * currentLoadPageCount;
                        var currentPageIndex = null !== (_b = null === dataSourceAdapter || void 0 === dataSourceAdapter ? void 0 : dataSourceAdapter.pageIndex()) && void 0 !== _b ? _b : 0;
                        var pageIndexNotChanged = (null === changedParams || void 0 === changedParams ? void 0 : changedParams.pageIndex) === currentPageIndex;
                        var allLoadedInAppendMode = isAppendMode(this) && this.totalItemsCount() < lastRequiredItemCount;
                        var isRepaintMode = "repaint" === this.option("editing.refreshMode");
                        var pageIndexIncreased = (null === changedParams || void 0 === changedParams ? void 0 : changedParams.pageIndex) > currentPageIndex;
                        var result = false;
                        if (!dataSourceAdapter || virtualPaging && checkLoading && (isRepaintMode && viewportIsFilled || pageIndexIncreased || pageIndexNotChanged && allLoadedInAppendMode)) {
                            return result
                        }
                        if (virtualPaging && this._isLoading) {
                            this._needUpdateViewportAfterLoading = true
                        }
                        if (virtualPaging && changedParams) {
                            result = true;
                            dataSourceAdapter.pageIndex(changedParams.pageIndex);
                            dataSourceAdapter.loadPageCount(changedParams.loadPageCount);
                            this._repaintChangesOnly = true;
                            this._needUpdateDimensions = true;
                            var viewportChanging = this._viewportChanging;
                            this.load().always((function() {
                                _this10._repaintChangesOnly = void 0;
                                _this10._needUpdateDimensions = void 0
                            })).done((function() {
                                var isLastPage = _this10.pageCount() > 0 && _this10.pageIndex() === _this10.pageCount() - 1;
                                (viewportChanging || isLastPage) && _this10._updateVisiblePageIndex();
                                if (_this10._needUpdateViewportAfterLoading) {
                                    _this10._needUpdateViewportAfterLoading = false;
                                    _this10.loadViewport({
                                        checkLoadedParamsOnly: true
                                    })
                                }
                            }))
                        }
                        return result
                    },
                    loadViewport: function(params) {
                        var _a, _b;
                        var _ref2 = null !== params && void 0 !== params ? params : {},
                            checkLoadedParamsOnly = _ref2.checkLoadedParamsOnly,
                            checkLoading = _ref2.checkLoading,
                            viewportIsNotFilled = _ref2.viewportIsNotFilled;
                        var virtualPaging = isVirtualPaging(this);
                        if (virtualPaging || _module_utils.default.isVirtualRowRendering(this)) {
                            this._updateLoadViewportParams();
                            var loadingItemsStarted = this._loadItems(checkLoading, !viewportIsNotFilled);
                            var needToUpdateItems = !(loadingItemsStarted || this._isLoading && checkLoading || checkLoadedParamsOnly);
                            if (needToUpdateItems) {
                                var noPendingChangesInEditing = !(null === (_b = null === (_a = this.getController("editing")) || void 0 === _a ? void 0 : _a.getChanges()) || void 0 === _b ? void 0 : _b.length);
                                this.updateItems({
                                    repaintChangesOnly: true,
                                    needUpdateDimensions: true,
                                    useProcessedItemsCache: noPendingChangesInEditing,
                                    cancelEmptyChanges: true
                                })
                            }
                        }
                    },
                    updateViewport: function() {
                        var _a, _b;
                        var viewportSize = this.viewportSize();
                        var itemCount = this.items().length;
                        var viewportIsNotFilled = viewportSize > itemCount;
                        var currentTake = null !== (_b = null === (_a = this._loadViewportParams) || void 0 === _a ? void 0 : _a.take) && void 0 !== _b ? _b : 0;
                        var rowsScrollController = this._rowsScrollController;
                        var newTake = null === rowsScrollController || void 0 === rowsScrollController ? void 0 : rowsScrollController.getViewportParams().take;
                        (viewportIsNotFilled || currentTake < newTake) && !this._isPaging && itemCount && this.loadViewport({
                            checkLoading: true,
                            viewportIsNotFilled: viewportIsNotFilled
                        })
                    },
                    loadIfNeed: function() {
                        if (false === this.option(LEGACY_SCROLLING_MODE)) {
                            return
                        }
                        var rowsScrollController = this._rowsScrollController;
                        rowsScrollController && rowsScrollController.loadIfNeed();
                        var dataSource = this._dataSource;
                        return dataSource && dataSource.loadIfNeed()
                    },
                    getItemSize: function() {
                        var rowsScrollController = this._rowsScrollController;
                        if (rowsScrollController) {
                            return rowsScrollController.getItemSize.apply(rowsScrollController, arguments)
                        }
                        var dataSource = this._dataSource;
                        return dataSource && dataSource.getItemSize.apply(dataSource, arguments)
                    },
                    getItemSizes: function() {
                        var rowsScrollController = this._rowsScrollController;
                        if (rowsScrollController) {
                            return rowsScrollController.getItemSizes.apply(rowsScrollController, arguments)
                        }
                        var dataSource = this._dataSource;
                        return dataSource && dataSource.getItemSizes.apply(dataSource, arguments)
                    },
                    getContentOffset: function() {
                        var rowsScrollController = this._rowsScrollController;
                        if (rowsScrollController) {
                            return rowsScrollController.getContentOffset.apply(rowsScrollController, arguments)
                        }
                        var dataSource = this._dataSource;
                        return dataSource && dataSource.getContentOffset.apply(dataSource, arguments)
                    },
                    refresh: function(options) {
                        var dataSource = this._dataSource;
                        if (dataSource && options && options.load && isAppendMode(this)) {
                            dataSource.resetCurrentTotalCount()
                        }
                        return this.callBase.apply(this, arguments)
                    },
                    dispose: function() {
                        var rowsScrollController = this._rowsScrollController;
                        rowsScrollController && rowsScrollController.dispose();
                        this.callBase.apply(this, arguments)
                    },
                    topItemIndex: function() {
                        var _a;
                        return null === (_a = this._loadViewportParams) || void 0 === _a ? void 0 : _a.skip
                    },
                    bottomItemIndex: function() {
                        var viewportParams = this._loadViewportParams;
                        return viewportParams && viewportParams.skip + viewportParams.take
                    },
                    virtualItemsCount: function() {
                        var rowsScrollController = this._rowsScrollController;
                        if (rowsScrollController) {
                            return rowsScrollController.virtualItemsCount.apply(rowsScrollController, arguments)
                        }
                        var dataSource = this._dataSource;
                        return null === dataSource || void 0 === dataSource ? void 0 : dataSource.virtualItemsCount.apply(dataSource, arguments)
                    },
                    pageIndex: function(_pageIndex) {
                        var _a;
                        var virtualPaging = isVirtualPaging(this);
                        var rowsScrollController = this._rowsScrollController;
                        if (false === this.option(LEGACY_SCROLLING_MODE) && virtualPaging && rowsScrollController) {
                            if (void 0 === _pageIndex) {
                                return null !== (_a = this.option(VISIBLE_PAGE_INDEX)) && void 0 !== _a ? _a : 0
                            }
                        }
                        return this.callBase.apply(this, arguments)
                    },
                    _fireChanged: function(e) {
                        this.callBase.apply(this, arguments);
                        var operationTypes = e.operationTypes;
                        if (false === this.option(LEGACY_SCROLLING_MODE) && isVirtualPaging(this) && operationTypes) {
                            var fullReload = operationTypes.fullReload,
                                pageIndex = operationTypes.pageIndex;
                            if (e.isDataChanged && !fullReload && pageIndex) {
                                this._updateVisiblePageIndex(this._dataSource.pageIndex())
                            }
                        }
                    },
                    _getPagingOptionValue: function(optionName) {
                        var result = this.callBase.apply(this, arguments);
                        if (false === this.option(LEGACY_SCROLLING_MODE) && isVirtualPaging(this)) {
                            result = this[optionName]()
                        }
                        return result
                    },
                    isEmpty: function() {
                        return false === this.option(LEGACY_SCROLLING_MODE) ? !this.items(true).length : this.callBase(this, arguments)
                    },
                    isLastPageLoaded: function() {
                        var result = false;
                        if (false === this.option(LEGACY_SCROLLING_MODE) && isVirtualPaging(this)) {
                            var _this$getLoadPagePara4 = this.getLoadPageParams(true),
                                pageIndex = _this$getLoadPagePara4.pageIndex,
                                loadPageCount = _this$getLoadPagePara4.loadPageCount;
                            var pageCount = this.pageCount();
                            result = pageIndex + loadPageCount >= pageCount
                        } else {
                            result = this.callBase.apply(this, arguments)
                        }
                        return result
                    },
                    reset: function() {
                        this._itemCount = 0;
                        this._allItems = null;
                        this.callBase.apply(this, arguments)
                    },
                    _applyFilter: function() {
                        var _a;
                        null === (_a = this._dataSource) || void 0 === _a ? void 0 : _a.loadPageCount(1);
                        this.callBase.apply(this, arguments)
                    }
                };
                _module_utils.default.proxyMethod(members, "getVirtualContentSize");
                _module_utils.default.proxyMethod(members, "setViewportItemIndex");
                return members
            }(),
            resizing: {
                _updateMasterDataGridCore: function(masterDataGrid) {
                    return (0, _deferred.when)(this.callBase.apply(this, arguments)).done((function(masterDataGridUpdated) {
                        var isNewVirtualMode = isVirtualMode(masterDataGrid) && false === masterDataGrid.option(LEGACY_SCROLLING_MODE);
                        if (!masterDataGridUpdated && isNewVirtualMode) {
                            var scrollable = masterDataGrid.getScrollable();
                            if (scrollable) {
                                masterDataGrid.updateDimensions()
                            }
                        }
                    }))
                },
                hasResizeTimeout: function() {
                    return !!this._resizeTimeout
                },
                resize: function() {
                    var _this11 = this;
                    var callBase = this.callBase;
                    var result;
                    if (isVirtualMode(this) || _module_utils.default.isVirtualRowRendering(this)) {
                        clearTimeout(this._resizeTimeout);
                        this._resizeTimeout = null;
                        var diff = new Date - this._lastTime;
                        var updateTimeout = this.option("scrolling.updateTimeout");
                        if (this._lastTime && diff < updateTimeout) {
                            result = new _deferred.Deferred;
                            this._resizeTimeout = setTimeout((function() {
                                _this11._resizeTimeout = null;
                                callBase.apply(_this11).done(result.resolve).fail(result.reject);
                                _this11._lastTime = new Date
                            }), updateTimeout);
                            this._lastTime = new Date
                        } else {
                            result = callBase.apply(this);
                            if (this._dataController.isLoaded()) {
                                this._lastTime = new Date
                            }
                        }
                    } else {
                        result = callBase.apply(this)
                    }
                    return result
                },
                dispose: function() {
                    this.callBase.apply(this, arguments);
                    clearTimeout(this._resizeTimeout)
                }
            }
        },
        views: {
            rowsView: VirtualScrollingRowsViewExtender
        }
    }
};
exports.virtualScrollingModule = virtualScrollingModule;