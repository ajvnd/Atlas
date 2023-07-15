/**
 * DevExtreme (bundles/__internal/grids/grid_core/data_controller/module.js)
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
exports.dataControllerModule = exports.DataController = void 0;
var _renderer = _interopRequireDefault(require("../../../../core/renderer"));
var _array_store = _interopRequireDefault(require("../../../../data/array_store"));
var _custom_store = _interopRequireDefault(require("../../../../data/custom_store"));
var _common = require("../../../../core/utils/common");
var _iterator = require("../../../../core/utils/iterator");
var _type = require("../../../../core/utils/type");
var _extend = require("../../../../core/utils/extend");
var _data_helper = _interopRequireDefault(require("../../../../data_helper"));
var _deferred = require("../../../../core/utils/deferred");
var _array_compare = require("../../../../core/utils/array_compare");
var _ui = _interopRequireDefault(require("../../../../ui/widget/ui.errors"));
var _module_utils = _interopRequireDefault(require("../module_utils"));
var _modules = _interopRequireDefault(require("../modules"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}

function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    _setPrototypeOf(subClass, superClass)
}

function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(o, p) {
        o.__proto__ = p;
        return o
    };
    return _setPrototypeOf(o, p)
}
var changePaging = function(that, optionName, value) {
    var dataSource = that._dataSource;
    if (dataSource) {
        if (void 0 !== value) {
            var oldValue = that._getPagingOptionValue(optionName);
            if (oldValue !== value) {
                if ("pageSize" === optionName) {
                    dataSource.pageIndex(0)
                }
                dataSource[optionName](value);
                that._skipProcessingPagingChange = true;
                that.option("paging.".concat(optionName), value);
                that._skipProcessingPagingChange = false;
                var pageIndex = dataSource.pageIndex();
                that._isPaging = "pageIndex" === optionName;
                return dataSource["pageIndex" === optionName ? "load" : "reload"]().done((function() {
                    that._isPaging = false;
                    that.pageChanged.fire(pageIndex)
                }))
            }
            return (0, _deferred.Deferred)().resolve().promise()
        }
        return dataSource[optionName]()
    }
    return 0
};
var ControllerWithDataMixin = _modules.default.Controller.inherit(_data_helper.default);
var DataController = function(_ControllerWithDataMi) {
    _inheritsLoose(DataController, _ControllerWithDataMi);

    function DataController() {
        return _ControllerWithDataMi.apply(this, arguments) || this
    }
    var _proto = DataController.prototype;
    _proto.init = function() {
        var _this = this;
        var that = this;
        that._items = [];
        that._cachedProcessedItems = null;
        that._columnsController = this.getController("columns");
        that._isPaging = false;
        that._currentOperationTypes = null;
        that._dataChangedHandler = function(e) {
            that._currentOperationTypes = _this._dataSource.operationTypes();
            that._handleDataChanged(e);
            that._currentOperationTypes = null
        };
        that._columnsChangedHandler = that._handleColumnsChanged.bind(that);
        that._loadingChangedHandler = that._handleLoadingChanged.bind(that);
        that._loadErrorHandler = that._handleLoadError.bind(that);
        that._customizeStoreLoadOptionsHandler = that._handleCustomizeStoreLoadOptions.bind(that);
        that._changingHandler = that._handleChanging.bind(that);
        that._dataPushedHandler = that._handleDataPushed.bind(that);
        that._columnsController.columnsChanged.add(that._columnsChangedHandler);
        that._isLoading = false;
        that._isCustomLoading = false;
        that._repaintChangesOnly = void 0;
        that._changes = [];
        that.createAction("onDataErrorOccurred");
        that.dataErrorOccurred.add((function(error) {
            return that.executeAction("onDataErrorOccurred", {
                error: error
            })
        }));
        that._refreshDataSource()
    };
    _proto._getPagingOptionValue = function(optionName) {
        return this._dataSource[optionName]()
    };
    _proto.callbackNames = function() {
        return ["changed", "loadingChanged", "dataErrorOccurred", "pageChanged", "dataSourceChanged", "pushed"]
    };
    _proto.callbackFlags = function(name) {
        if ("dataErrorOccurred" === name) {
            return {
                stopOnFalse: true
            }
        }
        return
    };
    _proto.publicMethods = function() {
        return ["beginCustomLoading", "endCustomLoading", "refresh", "filter", "clearFilter", "getCombinedFilter", "keyOf", "byKey", "getDataByKeys", "pageIndex", "pageSize", "pageCount", "totalCount", "_disposeDataSource", "getKeyByRowIndex", "getRowIndexByKey", "getDataSource", "getVisibleRows", "repaintRows"]
    };
    _proto.reset = function() {
        this._columnsController.reset();
        this._items = [];
        this._refreshDataSource()
    };
    _proto._handleDataSourceChange = function(args) {
        if (args.value === args.previousValue || this.option("columns") && Array.isArray(args.value) && Array.isArray(args.previousValue)) {
            var isValueChanged = args.value !== args.previousValue;
            if (isValueChanged) {
                var store = this.store();
                if (store) {
                    store._array = args.value
                }
            }
            if (this.needToRefreshOnDataSourceChange(args)) {
                this.refresh(this.option("repaintChangesOnly"))
            }
            return true
        }
        return false
    };
    _proto.needToRefreshOnDataSourceChange = function(args) {
        return true
    };
    _proto.optionChanged = function(args) {
        var _this2 = this;
        var that = this;
        var dataSource;
        var changedPagingOptions;

        function handled() {
            args.handled = true
        }
        if ("dataSource" === args.name && args.name === args.fullName && this._handleDataSourceChange(args)) {
            handled();
            return
        }
        switch (args.name) {
            case "cacheEnabled":
            case "repaintChangesOnly":
            case "highlightChanges":
            case "loadingTimeout":
                handled();
                break;
            case "remoteOperations":
            case "keyExpr":
            case "dataSource":
            case "scrolling":
                handled();
                that.reset();
                break;
            case "paging":
                dataSource = that.dataSource();
                if (dataSource) {
                    changedPagingOptions = that._setPagingOptions(dataSource);
                    if (changedPagingOptions) {
                        var pageIndex = dataSource.pageIndex();
                        this._isPaging = changedPagingOptions.isPageIndexChanged;
                        dataSource.load().done((function() {
                            _this2._isPaging = false;
                            that.pageChanged.fire(pageIndex)
                        }))
                    }
                }
                handled();
                break;
            case "rtlEnabled":
                that.reset();
                break;
            case "columns":
                dataSource = that.dataSource();
                if (dataSource && dataSource.isLoading() && args.name === args.fullName) {
                    this._useSortingGroupingFromColumns = true;
                    dataSource.load()
                }
                break;
            default:
                _ControllerWithDataMi.prototype.optionChanged.call(this, args)
        }
    };
    _proto.isReady = function() {
        return !this._isLoading
    };
    _proto.getDataSource = function() {
        return this._dataSource && this._dataSource._dataSource
    };
    _proto.getCombinedFilter = function(returnDataField) {
        return this.combinedFilter(void 0, returnDataField)
    };
    _proto.combinedFilter = function(filter, returnDataField) {
        var dataSource = this._dataSource;
        var columnsController = this._columnsController;
        if (dataSource) {
            if (void 0 === filter) {
                filter = dataSource.filter()
            }
            var additionalFilter = this._calculateAdditionalFilter();
            if (additionalFilter) {
                if (columnsController.isDataSourceApplied() || columnsController.isAllDataTypesDefined()) {
                    filter = _module_utils.default.combineFilters([additionalFilter, filter])
                }
            }
            filter = columnsController.updateFilter(filter, returnDataField || dataSource.remoteOperations().filtering)
        }
        return filter
    };
    _proto.waitReady = function() {
        if (this._updateLockCount) {
            this._readyDeferred = new _deferred.Deferred;
            return this._readyDeferred
        }
        return (0, _deferred.when)()
    };
    _proto._endUpdateCore = function() {
        var changes = this._changes;
        if (changes.length) {
            this._changes = [];
            var repaintChangesOnly = changes.every((function(change) {
                return change.repaintChangesOnly
            }));
            this.updateItems(1 === changes.length ? changes[0] : {
                repaintChangesOnly: repaintChangesOnly
            })
        }
        if (this._readyDeferred) {
            this._readyDeferred.resolve();
            this._readyDeferred = null
        }
    };
    _proto._handleCustomizeStoreLoadOptions = function(e) {
        var _a;
        var columnsController = this._columnsController;
        var dataSource = this._dataSource;
        var storeLoadOptions = e.storeLoadOptions;
        if (e.isCustomLoading && !storeLoadOptions.isLoadingAll) {
            return
        }
        storeLoadOptions.filter = this.combinedFilter(storeLoadOptions.filter);
        if (1 === (null === (_a = storeLoadOptions.filter) || void 0 === _a ? void 0 : _a.length) && "!" === storeLoadOptions.filter[0]) {
            e.data = [];
            e.extra = e.extra || {};
            e.extra.totalCount = 0
        }
        if (!columnsController.isDataSourceApplied()) {
            columnsController.updateColumnDataTypes(dataSource)
        }
        this._columnsUpdating = true;
        columnsController.updateSortingGrouping(dataSource, !this._useSortingGroupingFromColumns);
        this._columnsUpdating = false;
        storeLoadOptions.sort = columnsController.getSortDataSourceParameters();
        storeLoadOptions.group = columnsController.getGroupDataSourceParameters();
        dataSource.sort(storeLoadOptions.sort);
        dataSource.group(storeLoadOptions.group);
        storeLoadOptions.sort = columnsController.getSortDataSourceParameters(!dataSource.remoteOperations().sorting);
        e.group = columnsController.getGroupDataSourceParameters(!dataSource.remoteOperations().grouping)
    };
    _proto._handleColumnsChanged = function(e) {
        var that = this;
        var changeTypes = e.changeTypes;
        var optionNames = e.optionNames;
        var filterValue;
        var filterValues;
        var filterApplied;
        if (changeTypes.sorting || changeTypes.grouping) {
            if (that._dataSource && !that._columnsUpdating) {
                that._dataSource.group(that._columnsController.getGroupDataSourceParameters());
                that._dataSource.sort(that._columnsController.getSortDataSourceParameters());
                that.reload()
            }
        } else if (changeTypes.columns) {
            filterValues = that._columnsController.columnOption(e.columnIndex, "filterValues");
            if (optionNames.filterValues || optionNames.filterType && Array.isArray(filterValues) || optionNames.filterValue || optionNames.selectedFilterOperation || optionNames.allowFiltering) {
                filterValue = that._columnsController.columnOption(e.columnIndex, "filterValue");
                if (Array.isArray(filterValues) || void 0 === e.columnIndex || (0, _type.isDefined)(filterValue) || !optionNames.selectedFilterOperation || optionNames.filterValue) {
                    that._applyFilter();
                    filterApplied = true
                }
            }
            if (!that._needApplyFilter && !_module_utils.default.checkChanges(optionNames, ["width", "visibleWidth", "filterValue", "bufferedFilterValue", "selectedFilterOperation", "filterValues", "filterType"])) {
                that._columnsController.columnsChanged.add((function updateItemsHandler(change) {
                    var _a;
                    that._columnsController.columnsChanged.remove(updateItemsHandler);
                    that.updateItems({
                        repaintChangesOnly: false,
                        virtualColumnsScrolling: null === (_a = null === change || void 0 === change ? void 0 : change.changeTypes) || void 0 === _a ? void 0 : _a.virtualColumnsScrolling
                    })
                }))
            }
            if ((0, _type.isDefined)(optionNames.visible)) {
                var column = that._columnsController.columnOption(e.columnIndex);
                if (column && ((0, _type.isDefined)(column.filterValue) || (0, _type.isDefined)(column.filterValues))) {
                    that._applyFilter();
                    filterApplied = true
                }
            }
        }
        if (!filterApplied && changeTypes.filtering) {
            that.reload()
        }
    };
    _proto._handleDataChanged = function(e) {
        var that = this;
        var dataSource = that._dataSource;
        var columnsController = that._columnsController;
        var isAsyncDataSourceApplying = false;
        this._useSortingGroupingFromColumns = false;
        if (dataSource && !that._isDataSourceApplying) {
            that._isDataSourceApplying = true;
            (0, _deferred.when)(that._columnsController.applyDataSource(dataSource)).done((function() {
                if (that._isLoading) {
                    that._handleLoadingChanged(false)
                }
                if (isAsyncDataSourceApplying && e && e.isDelayed) {
                    e.isDelayed = false
                }
                that._isDataSourceApplying = false;
                var needApplyFilter = that._needApplyFilter;
                that._needApplyFilter = false;
                if (needApplyFilter && !that._isAllDataTypesDefined && (additionalFilter = that._calculateAdditionalFilter(), additionalFilter && additionalFilter.length)) {
                    _ui.default.log("W1005", that.component.NAME);
                    that._applyFilter()
                } else {
                    that.updateItems(e, true)
                }
                var additionalFilter
            })).fail((function() {
                that._isDataSourceApplying = false
            }));
            if (that._isDataSourceApplying) {
                isAsyncDataSourceApplying = true;
                that._handleLoadingChanged(true)
            }
            that._needApplyFilter = !that._columnsController.isDataSourceApplied();
            that._isAllDataTypesDefined = columnsController.isAllDataTypesDefined()
        }
    };
    _proto._handleLoadingChanged = function(isLoading) {
        this._isLoading = isLoading;
        this._fireLoadingChanged()
    };
    _proto._handleLoadError = function(e) {
        this.dataErrorOccurred.fire(e)
    };
    _proto._handleDataPushed = function(changes) {
        this.pushed.fire(changes)
    };
    _proto.fireError = function() {
        this.dataErrorOccurred.fire(_ui.default.Error.apply(_ui.default, arguments))
    };
    _proto._setPagingOptions = function(dataSource) {
        var pageIndex = this.option("paging.pageIndex");
        var pageSize = this.option("paging.pageSize");
        var pagingEnabled = this.option("paging.enabled");
        var scrollingMode = this.option("scrolling.mode");
        var appendMode = "infinite" === scrollingMode;
        var virtualMode = "virtual" === scrollingMode;
        var paginate = pagingEnabled || virtualMode || appendMode;
        var isPaginateChanged = false;
        var isPageSizeChanged = false;
        var isPageIndexChanged = false;
        dataSource.requireTotalCount(!appendMode);
        if (void 0 !== pagingEnabled && dataSource.paginate() !== paginate) {
            dataSource.paginate(paginate);
            isPaginateChanged = true
        }
        if (void 0 !== pageSize && dataSource.pageSize() !== pageSize) {
            dataSource.pageSize(pageSize);
            isPageSizeChanged = true
        }
        if (void 0 !== pageIndex && dataSource.pageIndex() !== pageIndex) {
            dataSource.pageIndex(pageIndex);
            isPageIndexChanged = true
        }
        if (isPaginateChanged || isPageSizeChanged || isPageIndexChanged) {
            return {
                isPaginateChanged: isPaginateChanged,
                isPageSizeChanged: isPageSizeChanged,
                isPageIndexChanged: isPageIndexChanged
            }
        }
        return false
    };
    _proto._getSpecificDataSourceOption = function() {
        var dataSource = this.option("dataSource");
        if (Array.isArray(dataSource)) {
            return {
                store: {
                    type: "array",
                    data: dataSource,
                    key: this.option("keyExpr")
                }
            }
        }
        return dataSource
    };
    _proto._initDataSource = function() {
        var oldDataSource = this._dataSource;
        _ControllerWithDataMi.prototype._initDataSource.call(this);
        var dataSource = this._dataSource;
        this._useSortingGroupingFromColumns = true;
        this._cachedProcessedItems = null;
        if (dataSource) {
            var changedPagingOptions = this._setPagingOptions(dataSource);
            this._isPaging = null === changedPagingOptions || void 0 === changedPagingOptions ? void 0 : changedPagingOptions.isPageIndexChanged;
            this.setDataSource(dataSource)
        } else if (oldDataSource) {
            this.updateItems()
        }
    };
    _proto._loadDataSource = function() {
        var that = this;
        var dataSource = that._dataSource;
        var result = new _deferred.Deferred;
        (0, _deferred.when)(this._columnsController.refresh(true)).always((function() {
            if (dataSource) {
                dataSource.load().done((function() {
                    that._isPaging = false;
                    result.resolve.apply(result, arguments)
                })).fail(result.reject)
            } else {
                result.resolve()
            }
        }));
        return result.promise()
    };
    _proto._beforeProcessItems = function(items) {
        return items.slice(0)
    };
    _proto.getRowIndexDelta = function() {
        return 0
    };
    _proto.getDataIndex = function(change) {
        var visibleItems = this._items;
        var lastVisibleItem = "append" === change.changeType && visibleItems.length > 0 ? visibleItems[visibleItems.length - 1] : null;
        return (0, _type.isDefined)(null === lastVisibleItem || void 0 === lastVisibleItem ? void 0 : lastVisibleItem.dataIndex) ? lastVisibleItem.dataIndex + 1 : 0
    };
    _proto._processItems = function(items, change) {
        var that = this;
        var rowIndexDelta = that.getRowIndexDelta();
        var changeType = change.changeType;
        var visibleColumns = that._columnsController.getVisibleColumns(null, "loadingAll" === changeType);
        var dataIndex = this.getDataIndex(change);
        var options = {
            visibleColumns: visibleColumns,
            dataIndex: dataIndex
        };
        var result = [];
        (0, _iterator.each)(items, (function(index, item) {
            if ((0, _type.isDefined)(item)) {
                options.rowIndex = index - rowIndexDelta;
                item = that._processItem(item, options);
                result.push(item)
            }
        }));
        return result
    };
    _proto._processItem = function(item, options) {
        item = this._generateDataItem(item, options);
        item = this._processDataItem(item, options);
        item.dataIndex = options.dataIndex++;
        return item
    };
    _proto._generateDataItem = function(data, options) {
        return {
            rowType: "data",
            data: data,
            key: this.keyOf(data)
        }
    };
    _proto._processDataItem = function(dataItem, options) {
        dataItem.values = this.generateDataValues(dataItem.data, options.visibleColumns);
        return dataItem
    };
    _proto.generateDataValues = function(data, columns, isModified) {
        var values = [];
        var value;
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            value = isModified ? void 0 : null;
            if (!column.command) {
                if (column.calculateCellValue) {
                    value = column.calculateCellValue(data)
                } else if (column.dataField) {
                    value = data[column.dataField]
                }
            }
            values.push(value)
        }
        return values
    };
    _proto._applyChange = function(change) {
        if ("update" === change.changeType) {
            this._applyChangeUpdate(change)
        } else if (this.items().length && change.repaintChangesOnly && "refresh" === change.changeType) {
            this._applyChangesOnly(change)
        } else if ("refresh" === change.changeType) {
            this._applyChangeFull(change)
        }
    };
    _proto._applyChangeFull = function(change) {
        this._items = change.items.slice(0)
    };
    _proto._getRowIndices = function(change) {
        var rowIndices = change.rowIndices.slice(0);
        var rowIndexDelta = this.getRowIndexDelta();
        rowIndices.sort((function(a, b) {
            return a - b
        }));
        for (var i = 0; i < rowIndices.length; i++) {
            var correctedRowIndex = rowIndices[i];
            if (change.allowInvisibleRowIndices) {
                correctedRowIndex += rowIndexDelta
            }
            if (correctedRowIndex < 0) {
                rowIndices.splice(i, 1);
                i--
            }
        }
        return rowIndices
    };
    _proto._applyChangeUpdate = function(change) {
        var that = this;
        var items = change.items;
        var rowIndices = that._getRowIndices(change);
        var rowIndexDelta = that.getRowIndexDelta();
        var repaintChangesOnly = that.option("repaintChangesOnly");
        var prevIndex = -1;
        var rowIndexCorrection = 0;
        var changeType;
        change.items = [];
        change.rowIndices = [];
        change.columnIndices = [];
        change.changeTypes = [];
        var equalItems = function(item1, item2, strict) {
            var result = item1 && item2 && (0, _common.equalByValue)(item1.key, item2.key);
            if (result && strict) {
                result = item1.rowType === item2.rowType && ("detail" !== item2.rowType || item1.isEditing === item2.isEditing)
            }
            return result
        };
        (0, _iterator.each)(rowIndices, (function(index, rowIndex) {
            var columnIndices;
            rowIndex += rowIndexCorrection + rowIndexDelta;
            if (prevIndex === rowIndex) {
                return
            }
            prevIndex = rowIndex;
            var oldItem = that._items[rowIndex];
            var oldNextItem = that._items[rowIndex + 1];
            var newItem = items[rowIndex];
            var newNextItem = items[rowIndex + 1];
            var strict = equalItems(oldItem, oldNextItem) || equalItems(newItem, newNextItem);
            if (newItem) {
                newItem.rowIndex = rowIndex;
                change.items.push(newItem)
            }
            if (oldItem && newItem && equalItems(oldItem, newItem, strict)) {
                changeType = "update";
                that._items[rowIndex] = newItem;
                if (oldItem.visible !== newItem.visible) {
                    change.items.splice(-1, 1, {
                        visible: newItem.visible
                    })
                } else if (repaintChangesOnly && !change.isFullUpdate) {
                    columnIndices = that._partialUpdateRow(oldItem, newItem, rowIndex - rowIndexDelta)
                }
            } else if (newItem && !oldItem || newNextItem && equalItems(oldItem, newNextItem, strict)) {
                changeType = "insert";
                that._items.splice(rowIndex, 0, newItem);
                rowIndexCorrection++
            } else if (oldItem && !newItem || oldNextItem && equalItems(newItem, oldNextItem, strict)) {
                changeType = "remove";
                that._items.splice(rowIndex, 1);
                rowIndexCorrection--;
                prevIndex = -1
            } else if (newItem) {
                changeType = "update";
                that._items[rowIndex] = newItem
            } else {
                return
            }
            change.rowIndices.push(rowIndex - rowIndexDelta);
            change.changeTypes.push(changeType);
            change.columnIndices.push(columnIndices)
        }))
    };
    _proto._isCellChanged = function(oldRow, newRow, visibleRowIndex, columnIndex, isLiveUpdate) {
        if (JSON.stringify(oldRow.values[columnIndex]) !== JSON.stringify(newRow.values[columnIndex])) {
            return true
        }

        function isCellModified(row, columnIndex) {
            return row.modifiedValues ? void 0 !== row.modifiedValues[columnIndex] : false
        }
        if (isCellModified(oldRow, columnIndex) !== isCellModified(newRow, columnIndex)) {
            return true
        }
        return false
    };
    _proto._getChangedColumnIndices = function(oldItem, newItem, visibleRowIndex, isLiveUpdate) {
        var columnIndices;
        if (oldItem.rowType === newItem.rowType) {
            if ("group" !== newItem.rowType && "groupFooter" !== newItem.rowType) {
                columnIndices = [];
                if ("detail" !== newItem.rowType) {
                    for (var columnIndex = 0; columnIndex < oldItem.values.length; columnIndex++) {
                        if (this._isCellChanged(oldItem, newItem, visibleRowIndex, columnIndex, isLiveUpdate)) {
                            columnIndices.push(columnIndex)
                        }
                    }
                }
            }
            if ("group" === newItem.rowType && newItem.isExpanded === oldItem.isExpanded && oldItem.cells) {
                columnIndices = oldItem.cells.map((function(cell, index) {
                    var _a;
                    return "groupExpand" !== (null === (_a = cell.column) || void 0 === _a ? void 0 : _a.type) ? index : -1
                })).filter((function(index) {
                    return index >= 0
                }))
            }
        }
        return columnIndices
    };
    _proto._partialUpdateRow = function(oldItem, newItem, visibleRowIndex, isLiveUpdate) {
        var changedColumnIndices = this._getChangedColumnIndices(oldItem, newItem, visibleRowIndex, isLiveUpdate);
        if ((null === changedColumnIndices || void 0 === changedColumnIndices ? void 0 : changedColumnIndices.length) && this.option("dataRowTemplate")) {
            changedColumnIndices = void 0
        }
        if (changedColumnIndices) {
            oldItem.cells && oldItem.cells.forEach((function(cell, columnIndex) {
                var isCellChanged = changedColumnIndices.indexOf(columnIndex) >= 0;
                if (!isCellChanged && cell && cell.update) {
                    cell.update(newItem)
                }
            }));
            newItem.update = oldItem.update;
            newItem.watch = oldItem.watch;
            newItem.cells = oldItem.cells;
            if (isLiveUpdate) {
                newItem.oldValues = oldItem.values
            }
            oldItem.update && oldItem.update(newItem)
        }
        return changedColumnIndices
    };
    _proto._isItemEquals = function(item1, item2) {
        var _a, _b, _c, _d;
        if (JSON.stringify(item1.values) !== JSON.stringify(item2.values)) {
            return false
        }
        if (["modified", "isNewRow", "removed", "isEditing"].some((function(field) {
                return item1[field] !== item2[field]
            }))) {
            return false
        }
        if ("group" === item1.rowType || "groupFooter" === item1.rowType) {
            var expandedMatch = item1.isExpanded === item2.isExpanded;
            var summaryCellsMatch = JSON.stringify(item1.summaryCells) === JSON.stringify(item2.summaryCells);
            var continuationMatch = (null === (_a = item1.data) || void 0 === _a ? void 0 : _a.isContinuation) === (null === (_b = item2.data) || void 0 === _b ? void 0 : _b.isContinuation) && (null === (_c = item1.data) || void 0 === _c ? void 0 : _c.isContinuationOnNextPage) === (null === (_d = item2.data) || void 0 === _d ? void 0 : _d.isContinuationOnNextPage);
            if (!expandedMatch || !summaryCellsMatch || !continuationMatch) {
                return false
            }
        }
        return true
    };
    _proto._applyChangesOnly = function(change) {
        var _this3 = this;
        var _a;
        var rowIndices = [];
        var columnIndices = [];
        var changeTypes = [];
        var items = [];
        var newIndexByKey = {};
        var isLiveUpdate = null !== (_a = null === change || void 0 === change ? void 0 : change.isLiveUpdate) && void 0 !== _a ? _a : true;

        function getRowKey(row) {
            if (row) {
                return "".concat(row.rowType, ",").concat(JSON.stringify(row.key))
            }
            return
        }
        var currentItems = this._items;
        var oldItems = currentItems.slice();
        change.items.forEach((function(item, index) {
            var key = getRowKey(item);
            newIndexByKey[key] = index;
            item.rowIndex = index
        }));
        var result = (0, _array_compare.findChanges)(oldItems, change.items, getRowKey, (function(item1, item2) {
            if (!_this3._isItemEquals(item1, item2)) {
                return false
            }
            if (item1.cells) {
                item1.update && item1.update(item2);
                item1.cells.forEach((function(cell) {
                    if (cell && cell.update) {
                        cell.update(item2, true)
                    }
                }))
            }
            return true
        }));
        if (!result) {
            this._applyChangeFull(change);
            return
        }
        result.forEach((function(change) {
            switch (change.type) {
                case "update":
                    var index = change.index;
                    var newItem = change.data;
                    var oldItem = change.oldItem;
                    var changedColumnIndices = _this3._partialUpdateRow(oldItem, newItem, index, isLiveUpdate);
                    rowIndices.push(index);
                    changeTypes.push("update");
                    items.push(newItem);
                    currentItems[index] = newItem;
                    columnIndices.push(changedColumnIndices);
                    break;
                case "insert":
                    rowIndices.push(change.index);
                    changeTypes.push("insert");
                    items.push(change.data);
                    columnIndices.push(void 0);
                    currentItems.splice(change.index, 0, change.data);
                    break;
                case "remove":
                    rowIndices.push(change.index);
                    changeTypes.push("remove");
                    currentItems.splice(change.index, 1);
                    items.push(change.oldItem);
                    columnIndices.push(void 0)
            }
        }));
        change.repaintChangesOnly = true;
        change.changeType = "update";
        change.rowIndices = rowIndices;
        change.columnIndices = columnIndices;
        change.changeTypes = changeTypes;
        change.items = items;
        if (oldItems.length) {
            change.isLiveUpdate = true
        }
        this._correctRowIndices((function(rowIndex) {
            var oldRowIndexOffset = _this3._rowIndexOffset || 0;
            var rowIndexOffset = _this3.getRowIndexOffset();
            var oldItem = oldItems[rowIndex - oldRowIndexOffset];
            var key = getRowKey(oldItem);
            var newVisibleRowIndex = newIndexByKey[key];
            return newVisibleRowIndex >= 0 ? newVisibleRowIndex + rowIndexOffset - rowIndex : 0
        }))
    };
    _proto._correctRowIndices = function(rowIndex) {};
    _proto._afterProcessItems = function(items, change) {
        return items
    };
    _proto._updateItemsCore = function(change) {
        var items;
        var dataSource = this._dataSource;
        var changeType = change.changeType || "refresh";
        change.changeType = changeType;
        if (dataSource) {
            var cachedProcessedItems = this._cachedProcessedItems;
            if (change.useProcessedItemsCache && cachedProcessedItems) {
                items = cachedProcessedItems
            } else {
                items = change.items || dataSource.items();
                items = this._beforeProcessItems(items);
                items = this._processItems(items, change);
                this._cachedProcessedItems = items
            }
            items = this._afterProcessItems(items, change);
            change.items = items;
            var oldItems = this._items.length === items.length && this._items;
            this._applyChange(change);
            var rowIndexDelta = this.getRowIndexDelta();
            (0, _iterator.each)(this._items, (function(index, item) {
                var _a;
                item.rowIndex = index - rowIndexDelta;
                if (oldItems) {
                    item.cells = null !== (_a = oldItems[index].cells) && void 0 !== _a ? _a : []
                }
                var newItem = items[index];
                if (newItem) {
                    item.loadIndex = newItem.loadIndex
                }
            }));
            this._rowIndexOffset = this.getRowIndexOffset()
        } else {
            this._items = []
        }
    };
    _proto._handleChanging = function(e) {
        var rows = this.getVisibleRows();
        var dataSource = this.dataSource();
        if (dataSource) {
            e.changes.forEach((function(change) {
                if ("insert" === change.type && change.index >= 0) {
                    var dataIndex = 0;
                    for (var i = 0; i < change.index; i++) {
                        var row = rows[i];
                        if (row && ("data" === row.rowType || "group" === row.rowType)) {
                            dataIndex++
                        }
                    }
                    change.index = dataIndex
                }
            }))
        }
    };
    _proto.updateItems = function(change, isDataChanged) {
        var _a;
        change = change || {};
        if (void 0 !== this._repaintChangesOnly) {
            change.repaintChangesOnly = null !== (_a = change.repaintChangesOnly) && void 0 !== _a ? _a : this._repaintChangesOnly;
            change.needUpdateDimensions = change.needUpdateDimensions || this._needUpdateDimensions
        } else if (change.changes) {
            change.repaintChangesOnly = this.option("repaintChangesOnly")
        } else if (isDataChanged) {
            var operationTypes = this.dataSource().operationTypes();
            change.repaintChangesOnly = operationTypes && !operationTypes.grouping && !operationTypes.filtering && this.option("repaintChangesOnly");
            change.isDataChanged = true;
            if (operationTypes && (operationTypes.reload || operationTypes.paging || operationTypes.groupExpanding)) {
                change.needUpdateDimensions = true
            }
        }
        if (this._updateLockCount && !change.cancel) {
            this._changes.push(change);
            return
        }
        this._updateItemsCore(change);
        if (change.cancel) {
            return
        }
        this._fireChanged(change)
    };
    _proto.loadingOperationTypes = function() {
        var dataSource = this.dataSource();
        return dataSource && dataSource.loadingOperationTypes() || {}
    };
    _proto._fireChanged = function(change) {
        var _this4 = this;
        if (this._currentOperationTypes) {
            change.operationTypes = this._currentOperationTypes;
            this._currentOperationTypes = null
        }(0, _common.deferRender)((function() {
            _this4.changed.fire(change)
        }))
    };
    _proto.isLoading = function() {
        return this._isLoading || this._isCustomLoading
    };
    _proto._fireLoadingChanged = function() {
        this.loadingChanged.fire(this.isLoading(), this._loadingText)
    };
    _proto._calculateAdditionalFilter = function() {
        return null
    };
    _proto._applyFilter = function() {
        var _this5 = this;
        var dataSource = this._dataSource;
        if (dataSource) {
            dataSource.pageIndex(0);
            this._isFilterApplying = true;
            return this.reload().done((function() {
                if (_this5._isFilterApplying) {
                    _this5.pageChanged.fire()
                }
            }))
        }
    };
    _proto.resetFilterApplying = function() {
        this._isFilterApplying = false
    };
    _proto.filter = function(filterExpr) {
        var dataSource = this._dataSource;
        var filter = dataSource && dataSource.filter();
        if (0 === arguments.length) {
            return filter
        }
        filterExpr = arguments.length > 1 ? Array.prototype.slice.call(arguments, 0) : filterExpr;
        if (_module_utils.default.equalFilterParameters(filter, filterExpr)) {
            return
        }
        if (dataSource) {
            dataSource.filter(filterExpr)
        }
        this._applyFilter()
    };
    _proto.clearFilter = function(filterName) {
        var that = this;
        var columnsController = that._columnsController;
        var clearColumnOption = function(optionName) {
            var columnCount = columnsController.columnCount();
            for (var index = 0; index < columnCount; index++) {
                columnsController.columnOption(index, optionName, void 0)
            }
        };
        that.component.beginUpdate();
        if (arguments.length > 0) {
            switch (filterName) {
                case "dataSource":
                    that.filter(null);
                    break;
                case "search":
                    that.searchByText("");
                    break;
                case "header":
                    clearColumnOption("filterValues");
                    break;
                case "row":
                    clearColumnOption("filterValue")
            }
        } else {
            that.filter(null);
            that.searchByText("");
            clearColumnOption("filterValue");
            clearColumnOption("bufferedFilterValue");
            clearColumnOption("filterValues")
        }
        that.component.endUpdate()
    };
    _proto._fireDataSourceChanged = function() {
        var that = this;
        that.changed.add((function changedHandler() {
            that.changed.remove(changedHandler);
            that.dataSourceChanged.fire()
        }))
    };
    _proto._getDataSourceAdapter = function() {};
    _proto._createDataSourceAdapterCore = function(dataSource, remoteOperations) {
        var dataSourceAdapterProvider = this._getDataSourceAdapter();
        var dataSourceAdapter = dataSourceAdapterProvider.create(this.component);
        dataSourceAdapter.init(dataSource, remoteOperations);
        return dataSourceAdapter
    };
    _proto.isLocalStore = function(store) {
        store = store || this.store();
        return store instanceof _array_store.default
    };
    _proto.isCustomStore = function(store) {
        store = store || this.store();
        return store instanceof _custom_store.default
    };
    _proto._createDataSourceAdapter = function(dataSource) {
        var remoteOperations = this.option("remoteOperations");
        var store = dataSource.store();
        var enabledRemoteOperations = {
            filtering: true,
            sorting: true,
            paging: true,
            grouping: true,
            summary: true
        };
        if ((0, _type.isObject)(remoteOperations) && remoteOperations.groupPaging) {
            remoteOperations = (0, _extend.extend)({}, enabledRemoteOperations, remoteOperations)
        }
        if ("auto" === remoteOperations) {
            remoteOperations = this.isLocalStore(store) || this.isCustomStore(store) ? {} : {
                filtering: true,
                sorting: true,
                paging: true
            }
        }
        if (true === remoteOperations) {
            remoteOperations = enabledRemoteOperations
        }
        return this._createDataSourceAdapterCore(dataSource, remoteOperations)
    };
    _proto.setDataSource = function(dataSource) {
        var oldDataSource = this._dataSource;
        if (!dataSource && oldDataSource) {
            oldDataSource.cancelAll();
            oldDataSource.changed.remove(this._dataChangedHandler);
            oldDataSource.loadingChanged.remove(this._loadingChangedHandler);
            oldDataSource.loadError.remove(this._loadErrorHandler);
            oldDataSource.customizeStoreLoadOptions.remove(this._customizeStoreLoadOptionsHandler);
            oldDataSource.changing.remove(this._changingHandler);
            oldDataSource.pushed.remove(this._dataPushedHandler);
            oldDataSource.dispose(this._isSharedDataSource)
        }
        if (dataSource) {
            dataSource = this._createDataSourceAdapter(dataSource)
        }
        this._dataSource = dataSource;
        if (dataSource) {
            this._fireDataSourceChanged();
            this._isLoading = !dataSource.isLoaded();
            this._needApplyFilter = true;
            this._isAllDataTypesDefined = this._columnsController.isAllDataTypesDefined();
            dataSource.changed.add(this._dataChangedHandler);
            dataSource.loadingChanged.add(this._loadingChangedHandler);
            dataSource.loadError.add(this._loadErrorHandler);
            dataSource.customizeStoreLoadOptions.add(this._customizeStoreLoadOptionsHandler);
            dataSource.changing.add(this._changingHandler);
            dataSource.pushed.add(this._dataPushedHandler)
        }
    };
    _proto.items = function(byLoaded) {
        return this._items
    };
    _proto.isEmpty = function() {
        return !this.items().length
    };
    _proto.pageCount = function() {
        return this._dataSource ? this._dataSource.pageCount() : 1
    };
    _proto.dataSource = function() {
        return this._dataSource
    };
    _proto.store = function() {
        var dataSource = this._dataSource;
        return dataSource && dataSource.store()
    };
    _proto.loadAll = function(data) {
        var that = this;
        var d = new _deferred.Deferred;
        var dataSource = that._dataSource;
        if (dataSource) {
            if (data) {
                var options = {
                    data: data,
                    isCustomLoading: true,
                    storeLoadOptions: {
                        isLoadingAll: true
                    },
                    loadOptions: {
                        filter: that.getCombinedFilter(),
                        group: dataSource.group(),
                        sort: dataSource.sort()
                    }
                };
                dataSource._handleDataLoaded(options);
                (0, _deferred.when)(options.data).done((function(data) {
                    var _a;
                    data = that._beforeProcessItems(data);
                    d.resolve(that._processItems(data, {
                        changeType: "loadingAll"
                    }), null === (_a = options.extra) || void 0 === _a ? void 0 : _a.summary)
                })).fail(d.reject)
            } else if (!dataSource.isLoading()) {
                var loadOptions = (0, _extend.extend)({}, dataSource.loadOptions(), {
                    isLoadingAll: true,
                    requireTotalCount: false
                });
                dataSource.load(loadOptions).done((function(items, extra) {
                    items = that._beforeProcessItems(items);
                    items = that._processItems(items, {
                        changeType: "loadingAll"
                    });
                    d.resolve(items, extra && extra.summary)
                })).fail(d.reject)
            } else {
                d.reject()
            }
        } else {
            d.resolve([])
        }
        return d
    };
    _proto.getKeyByRowIndex = function(rowIndex, byLoaded) {
        var item = this.items(byLoaded)[rowIndex];
        if (item) {
            return item.key
        }
    };
    _proto.getRowIndexByKey = function(key, byLoaded) {
        return _module_utils.default.getIndexByKey(key, this.items(byLoaded))
    };
    _proto.keyOf = function(data) {
        var store = this.store();
        if (store) {
            return store.keyOf(data)
        }
    };
    _proto.byKey = function(key) {
        var store = this.store();
        var rowIndex = this.getRowIndexByKey(key);
        var result;
        if (!store) {
            return
        }
        if (rowIndex >= 0) {
            result = (new _deferred.Deferred).resolve(this.items()[rowIndex].data)
        }
        return result || store.byKey(key)
    };
    _proto.key = function() {
        var store = this.store();
        if (store) {
            return store.key()
        }
    };
    _proto.getRowIndexOffset = function() {
        return 0
    };
    _proto.getDataByKeys = function(rowKeys) {
        var that = this;
        var result = new _deferred.Deferred;
        var deferreds = [];
        var data = [];
        (0, _iterator.each)(rowKeys, (function(index, key) {
            deferreds.push(that.byKey(key).done((function(keyData) {
                data[index] = keyData
            })))
        }));
        _deferred.when.apply(_renderer.default, deferreds).always((function() {
            result.resolve(data)
        }));
        return result
    };
    _proto.pageIndex = function(value) {
        return changePaging(this, "pageIndex", value)
    };
    _proto.pageSize = function(value) {
        return changePaging(this, "pageSize", value)
    };
    _proto.beginCustomLoading = function(messageText) {
        this._isCustomLoading = true;
        this._loadingText = messageText || "";
        this._fireLoadingChanged()
    };
    _proto.endCustomLoading = function() {
        this._isCustomLoading = false;
        this._loadingText = void 0;
        this._fireLoadingChanged()
    };
    _proto.refresh = function(options) {
        if (true === options) {
            options = {
                reload: true,
                changesOnly: true
            }
        } else if (!options) {
            options = {
                lookup: true,
                selection: true,
                reload: true
            }
        }
        var that = this;
        var dataSource = that.getDataSource();
        var _options = options,
            changesOnly = _options.changesOnly;
        var d = new _deferred.Deferred;
        var customizeLoadResult = function() {
            that._repaintChangesOnly = !!changesOnly
        };
        (0, _deferred.when)(!options.lookup || that._columnsController.refresh()).always((function() {
            if (options.load || options.reload) {
                dataSource && dataSource.on("customizeLoadResult", customizeLoadResult);
                (0, _deferred.when)(that.reload(options.reload, changesOnly)).always((function() {
                    dataSource && dataSource.off("customizeLoadResult", customizeLoadResult);
                    that._repaintChangesOnly = void 0
                })).done(d.resolve).fail(d.reject)
            } else {
                that.updateItems({
                    repaintChangesOnly: options.changesOnly
                });
                d.resolve()
            }
        }));
        return d.promise()
    };
    _proto.getVisibleRows = function() {
        return this.items()
    };
    _proto._disposeDataSource = function() {
        this.setDataSource(null)
    };
    _proto.dispose = function() {
        this._disposeDataSource();
        _ControllerWithDataMi.prototype.dispose.call(this)
    };
    _proto.repaintRows = function(rowIndexes, changesOnly) {
        rowIndexes = Array.isArray(rowIndexes) ? rowIndexes : [rowIndexes];
        if (rowIndexes.length > 1 || (0, _type.isDefined)(rowIndexes[0])) {
            this.updateItems({
                changeType: "update",
                rowIndices: rowIndexes,
                isFullUpdate: !changesOnly
            })
        }
    };
    _proto.skipProcessingPagingChange = function(fullName) {
        return this._skipProcessingPagingChange && ("paging.pageIndex" === fullName || "paging.pageSize" === fullName)
    };
    _proto.getUserState = function() {
        return {
            searchText: this.option("searchPanel.text"),
            pageIndex: this.pageIndex(),
            pageSize: this.pageSize()
        }
    };
    _proto.getCachedStoreData = function() {
        return this._dataSource && this._dataSource.getCachedStoreData()
    };
    _proto.isLastPageLoaded = function() {
        var pageIndex = this.pageIndex();
        var pageCount = this.pageCount();
        return pageIndex === pageCount - 1
    };
    _proto.load = function() {
        var _a;
        return null === (_a = this._dataSource) || void 0 === _a ? void 0 : _a.load()
    };
    _proto.reload = function(_reload, changesOnly) {
        var _a;
        return null === (_a = this._dataSource) || void 0 === _a ? void 0 : _a.reload(_reload, changesOnly)
    };
    _proto.push = function() {
        var _a2;
        var _a;
        return null === (_a = this._dataSource) || void 0 === _a ? void 0 : (_a2 = _a).push.apply(_a2, arguments)
    };
    _proto.itemsCount = function() {
        var _a;
        return this._dataSource ? null === (_a = this._dataSource) || void 0 === _a ? void 0 : _a.itemsCount() : 0
    };
    _proto.totalItemsCount = function() {
        var _a;
        return this._dataSource ? null === (_a = this._dataSource) || void 0 === _a ? void 0 : _a.totalItemsCount() : 0
    };
    _proto.hasKnownLastPage = function() {
        var _a;
        return this._dataSource ? null === (_a = this._dataSource) || void 0 === _a ? void 0 : _a.hasKnownLastPage() : true
    };
    _proto.isLoaded = function() {
        var _a;
        return this._dataSource ? null === (_a = this._dataSource) || void 0 === _a ? void 0 : _a.isLoaded() : true
    };
    _proto.totalCount = function() {
        var _a;
        return this._dataSource ? null === (_a = this._dataSource) || void 0 === _a ? void 0 : _a.totalCount() : 0
    };
    return DataController
}(ControllerWithDataMixin);
exports.DataController = DataController;
var dataControllerModule = {
    defaultOptions: function() {
        return {
            loadingTimeout: 0,
            dataSource: null,
            cacheEnabled: true,
            repaintChangesOnly: false,
            highlightChanges: false,
            onDataErrorOccurred: null,
            remoteOperations: "auto",
            paging: {
                enabled: true,
                pageSize: void 0,
                pageIndex: void 0
            }
        }
    },
    controllers: {
        data: DataController
    }
};
exports.dataControllerModule = dataControllerModule;