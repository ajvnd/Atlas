/**
 * DevExtreme (bundles/__internal/grids/grid_core/data_source_adapter/module.js)
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
var _callbacks = _interopRequireDefault(require("../../../../core/utils/callbacks"));
var _common = require("../../../../core/utils/common");
var _type = require("../../../../core/utils/type");
var _iterator = require("../../../../core/utils/iterator");
var _extend = require("../../../../core/utils/extend");
var _array_store = _interopRequireDefault(require("../../../../data/array_store"));
var _array_utils = require("../../../../data/array_utils");
var _deferred = require("../../../../core/utils/deferred");
var _modules = _interopRequireDefault(require("../modules"));
var _module_utils = _interopRequireDefault(require("../module_utils"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}

function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key]
                }
            }
        }
        return target
    };
    return _extends.apply(this, arguments)
}
var _default = _modules.default.Controller.inherit(function() {
    function cloneItems(items, groupCount) {
        if (items) {
            items = items.slice(0);
            if (groupCount) {
                for (var i = 0; i < items.length; i++) {
                    items[i] = (0, _extend.extend)({
                        key: items[i].key
                    }, items[i]);
                    items[i].items = cloneItems(items[i].items, groupCount - 1)
                }
            }
        }
        return items
    }

    function calculateOperationTypes(loadOptions, lastLoadOptions, isFullReload) {
        var operationTypes = {
            reload: true,
            fullReload: true
        };
        if (lastLoadOptions) {
            operationTypes = {
                sorting: !_module_utils.default.equalSortParameters(loadOptions.sort, lastLoadOptions.sort),
                grouping: !_module_utils.default.equalSortParameters(loadOptions.group, lastLoadOptions.group, true),
                groupExpanding: !_module_utils.default.equalSortParameters(loadOptions.group, lastLoadOptions.group) || lastLoadOptions.groupExpand,
                filtering: !_module_utils.default.equalFilterParameters(loadOptions.filter, lastLoadOptions.filter),
                pageIndex: loadOptions.pageIndex !== lastLoadOptions.pageIndex,
                skip: loadOptions.skip !== lastLoadOptions.skip,
                take: loadOptions.take !== lastLoadOptions.take,
                pageSize: loadOptions.pageSize !== lastLoadOptions.pageSize,
                fullReload: isFullReload,
                reload: false,
                paging: false
            };
            operationTypes.reload = isFullReload || operationTypes.sorting || operationTypes.grouping || operationTypes.filtering;
            operationTypes.paging = operationTypes.pageIndex || operationTypes.pageSize || operationTypes.take
        }
        return operationTypes
    }

    function getPageDataFromCache(options, updatePaging) {
        var groupCount = _module_utils.default.normalizeSortingInfo(options.group || options.storeLoadOptions.group || options.loadOptions.group).length;
        var items = [];
        if (fillItemsFromCache(items, options, groupCount)) {
            return items
        }
        if (updatePaging) {
            ! function(cacheItemsFromBegin, options, groupCount) {
                var _a, _b;
                var cacheItemBeginCount = cacheItemsFromBegin.length;
                var storeLoadOptions = options.storeLoadOptions;
                if (void 0 !== storeLoadOptions.skip && storeLoadOptions.take && !groupCount) {
                    var cacheItemsFromEnd = [];
                    fillItemsFromCache(cacheItemsFromEnd, options, groupCount, true);
                    var cacheItemEndCount = cacheItemsFromEnd.length;
                    if (cacheItemBeginCount || cacheItemEndCount) {
                        options.skip = null !== (_a = options.skip) && void 0 !== _a ? _a : storeLoadOptions.skip;
                        options.take = null !== (_b = options.take) && void 0 !== _b ? _b : storeLoadOptions.take
                    }
                    if (cacheItemBeginCount) {
                        storeLoadOptions.skip += cacheItemBeginCount;
                        storeLoadOptions.take -= cacheItemBeginCount;
                        options.cachedDataPartBegin = cacheItemsFromBegin
                    }
                    if (cacheItemEndCount) {
                        storeLoadOptions.take -= cacheItemEndCount;
                        options.cachedDataPartEnd = cacheItemsFromEnd.reverse()
                    }
                }
            }(items, options, groupCount)
        }
    }

    function fillItemsFromCache(items, options, groupCount, fromEnd) {
        var _a, _b, _c, _d, _e;
        var storeLoadOptions = options.storeLoadOptions;
        var take = null !== (_b = null !== (_a = options.take) && void 0 !== _a ? _a : storeLoadOptions.take) && void 0 !== _b ? _b : 0;
        var cachedItems = null === (_c = options.cachedData) || void 0 === _c ? void 0 : _c.items;
        if (take && cachedItems) {
            var skip = null !== (_e = null !== (_d = options.skip) && void 0 !== _d ? _d : storeLoadOptions.skip) && void 0 !== _e ? _e : 0;
            for (var i = 0; i < take; i++) {
                var localIndex = fromEnd ? take - 1 - i : i;
                var cacheItemIndex = localIndex + skip;
                var cacheItem = cachedItems[cacheItemIndex];
                if (void 0 === cacheItem && cacheItemIndex in cachedItems) {
                    return true
                }
                var item = getItemFromCache(options, cacheItem, groupCount, localIndex, take);
                if (item) {
                    items.push(item)
                } else {
                    return false
                }
            }
            return true
        }
        return false
    }

    function getItemFromCache(options, cacheItem, groupCount, index, take) {
        if (groupCount && cacheItem) {
            var skips = 0 === index && options.skips || [];
            var takes = index === take - 1 && options.takes || [];
            return function getGroupItemFromCache(cacheItem, groupCount, skips, takes) {
                if (groupCount && cacheItem) {
                    var result = _extends({}, cacheItem);
                    var skip = skips[0] || 0;
                    var take = takes[0];
                    var items = cacheItem.items;
                    if (items) {
                        if (void 0 === take && !items[skip]) {
                            return
                        }
                        result.items = [];
                        if (skips.length) {
                            result.isContinuation = true
                        }
                        if (take) {
                            result.isContinuationOnNextPage = cacheItem.count > take
                        }
                        for (var i = 0; void 0 === take ? items[i + skip] : i < take; i++) {
                            var childCacheItem = items[i + skip];
                            var isLast = i + 1 === take;
                            var item = getGroupItemFromCache(childCacheItem, groupCount - 1, 0 === i ? skips.slice(1) : [], isLast ? takes.slice(1) : []);
                            if (void 0 !== item) {
                                result.items.push(item)
                            } else {
                                return
                            }
                        }
                    }
                    return result
                }
                return cacheItem
            }(cacheItem, groupCount, skips, takes)
        }
        return cacheItem
    }

    function getCacheItem(cacheItem, loadedItem, groupCount, skips) {
        if (groupCount && loadedItem) {
            var result = _extends({}, loadedItem);
            delete result.isContinuation;
            delete result.isContinuationOnNextPage;
            var skip = skips[0] || 0;
            if (loadedItem.items) {
                result.items = (null === cacheItem || void 0 === cacheItem ? void 0 : cacheItem.items) || {};
                loadedItem.items.forEach((function(item, index) {
                    var globalIndex = index + skip;
                    var childSkips = 0 === index ? skips.slice(1) : [];
                    result.items[globalIndex] = getCacheItem(result.items[globalIndex], item, groupCount - 1, childSkips)
                }))
            }
            return result
        }
        return loadedItem
    }
    var members = {
        init: function(dataSource, remoteOperations) {
            var that = this;
            that._dataSource = dataSource;
            that._remoteOperations = remoteOperations || {};
            that._isLastPage = !dataSource.isLastPage();
            that._hasLastPage = false;
            that._currentTotalCount = 0;
            that._cachedData = {
                items: {}
            };
            that._lastOperationTypes = {};
            that._eventsStrategy = dataSource._eventsStrategy;
            that._totalCountCorrection = 0;
            that._isLoadingAll = false;
            that.changed = (0, _callbacks.default)();
            that.loadingChanged = (0, _callbacks.default)();
            that.loadError = (0, _callbacks.default)();
            that.customizeStoreLoadOptions = (0, _callbacks.default)();
            that.changing = (0, _callbacks.default)();
            that.pushed = (0, _callbacks.default)();
            that._dataChangedHandler = that._handleDataChanged.bind(that);
            that._customizeStoreLoadOptionsHandler = that._handleCustomizeStoreLoadOptions.bind(that);
            that._dataLoadedHandler = that._handleDataLoaded.bind(that);
            that._loadingChangedHandler = that._handleLoadingChanged.bind(that);
            that._loadErrorHandler = that._handleLoadError.bind(that);
            that._pushHandler = that._handlePush.bind(that);
            that._changingHandler = that._handleChanging.bind(that);
            dataSource.on("changed", that._dataChangedHandler);
            dataSource.on("customizeStoreLoadOptions", that._customizeStoreLoadOptionsHandler);
            dataSource.on("customizeLoadResult", that._dataLoadedHandler);
            dataSource.on("loadingChanged", that._loadingChangedHandler);
            dataSource.on("loadError", that._loadErrorHandler);
            dataSource.on("changing", that._changingHandler);
            dataSource.store().on("beforePush", that._pushHandler);
            (0, _iterator.each)(dataSource, (function(memberName, member) {
                if (!that[memberName] && (0, _type.isFunction)(member)) {
                    that[memberName] = function() {
                        return this._dataSource[memberName].apply(this._dataSource, arguments)
                    }
                }
            }))
        },
        remoteOperations: function() {
            return this._remoteOperations
        },
        dispose: function(isSharedDataSource) {
            var dataSource = this._dataSource;
            var store = dataSource.store();
            dataSource.off("changed", this._dataChangedHandler);
            dataSource.off("customizeStoreLoadOptions", this._customizeStoreLoadOptionsHandler);
            dataSource.off("customizeLoadResult", this._dataLoadedHandler);
            dataSource.off("loadingChanged", this._loadingChangedHandler);
            dataSource.off("loadError", this._loadErrorHandler);
            dataSource.off("changing", this._changingHandler);
            store && store.off("beforePush", this._pushHandler);
            if (!isSharedDataSource) {
                dataSource.dispose()
            }
        },
        refresh: function(options, operationTypes) {
            var dataSource = this._dataSource;
            if (operationTypes.reload) {
                this.resetCurrentTotalCount();
                this._isLastPage = !dataSource.paginate();
                this._hasLastPage = this._isLastPage
            }
        },
        resetCurrentTotalCount: function() {
            this._currentTotalCount = 0;
            this._totalCountCorrection = 0
        },
        resetCache: function() {
            this._cachedStoreData = void 0;
            this._cachedPagingData = void 0
        },
        resetPagesCache: function() {
            this._cachedData = {
                items: {}
            }
        },
        _needClearStoreDataCache: function() {
            var remoteOperations = this.remoteOperations();
            var operationTypes = calculateOperationTypes(this._lastLoadOptions || {}, {});
            var isLocalOperations = Object.keys(remoteOperations).every((function(operationName) {
                return !operationTypes[operationName] || !remoteOperations[operationName]
            }));
            return !isLocalOperations
        },
        push: function(changes, fromStore) {
            var store = this.store();
            if (this._needClearStoreDataCache()) {
                this._cachedStoreData = void 0
            }
            this._cachedPagingData = void 0;
            this.resetPagesCache(true);
            if (this._cachedStoreData) {
                (0, _array_utils.applyBatch)({
                    keyInfo: store,
                    data: this._cachedStoreData,
                    changes: changes
                })
            }
            if (!fromStore) {
                this._applyBatch(changes)
            }
            this.pushed.fire(changes)
        },
        getDataIndexGetter: function() {
            var _this = this;
            if (!this._dataIndexGetter) {
                var indexByKey;
                var storeData;
                var store = this.store();
                this._dataIndexGetter = function(data) {
                    var isCacheUpdated = storeData && storeData !== _this._cachedStoreData;
                    if (!indexByKey || isCacheUpdated) {
                        storeData = _this._cachedStoreData || [];
                        indexByKey = {};
                        for (var i = 0; i < storeData.length; i++) {
                            indexByKey[(0, _common.getKeyHash)(store.keyOf(storeData[i]))] = i
                        }
                    }
                    return indexByKey[(0, _common.getKeyHash)(store.keyOf(data))]
                }
            }
            return this._dataIndexGetter
        },
        _getKeyInfo: function() {
            return this.store()
        },
        _needToCopyDataObject: function() {
            return true
        },
        _applyBatch: function(changes, fromStore) {
            var _this2 = this;
            var keyInfo = this._getKeyInfo();
            var dataSource = this._dataSource;
            var groupCount = _module_utils.default.normalizeSortingInfo(this.group()).length;
            var isReshapeMode = "reshape" === this.option("editing.refreshMode");
            var isVirtualMode = "virtual" === this.option("scrolling.mode");
            changes = changes.filter((function(change) {
                return !dataSource.paginate() || "insert" !== change.type || void 0 !== change.index
            }));
            var getItemCount = function() {
                return groupCount ? _this2.itemsCount() : _this2.items().length
            };
            var oldItemCount = getItemCount();
            (0, _array_utils.applyBatch)({
                keyInfo: keyInfo,
                data: this._items,
                changes: changes,
                groupCount: groupCount,
                useInsertIndex: true,
                skipCopying: !this._needToCopyDataObject()
            });
            (0, _array_utils.applyBatch)({
                keyInfo: keyInfo,
                data: dataSource.items(),
                changes: changes,
                groupCount: groupCount,
                useInsertIndex: true,
                skipCopying: !this._needToCopyDataObject()
            });
            var needUpdateTotalCountCorrection = this._currentTotalCount > 0 || (fromStore || !isReshapeMode) && isVirtualMode;
            if (needUpdateTotalCountCorrection) {
                this._totalCountCorrection += getItemCount() - oldItemCount
            }
            changes.splice(0, changes.length)
        },
        _handlePush: function(_ref) {
            var changes = _ref.changes;
            this.push(changes, true)
        },
        _handleChanging: function(e) {
            this.changing.fire(e);
            this._applyBatch(e.changes, true)
        },
        _needCleanCacheByOperation: function(operationType, remoteOperations) {
            var operationTypesByOrder = ["filtering", "sorting", "paging"];
            var operationTypeIndex = operationTypesByOrder.indexOf(operationType);
            var currentOperationTypes = operationTypeIndex >= 0 ? operationTypesByOrder.slice(operationTypeIndex) : [operationType];
            return currentOperationTypes.some((function(operationType) {
                return remoteOperations[operationType]
            }))
        },
        _customizeRemoteOperations: function(options, operationTypes) {
            var _this3 = this;
            var cachedStoreData = this._cachedStoreData;
            var cachedPagingData = this._cachedPagingData;
            var cachedData = this._cachedData;
            if (options.storeLoadOptions.filter && !options.remoteOperations.filtering || options.storeLoadOptions.sort && !options.remoteOperations.sorting) {
                options.remoteOperations = {
                    filtering: options.remoteOperations.filtering,
                    summary: options.remoteOperations.summary
                }
            }
            if (operationTypes.fullReload) {
                cachedStoreData = void 0;
                cachedPagingData = void 0;
                cachedData = {
                    items: {}
                }
            } else {
                if (operationTypes.reload) {
                    cachedPagingData = void 0;
                    cachedData = {
                        items: {}
                    }
                } else if (operationTypes.groupExpanding) {
                    cachedData = {
                        items: {}
                    }
                }(0, _iterator.each)(operationTypes, (function(operationType, value) {
                    if (value && _this3._needCleanCacheByOperation(operationType, options.remoteOperations)) {
                        cachedStoreData = void 0;
                        cachedPagingData = void 0
                    }
                }))
            }
            if (cachedPagingData) {
                options.remoteOperations.paging = false
            }
            options.cachedStoreData = cachedStoreData;
            options.cachedPagingData = cachedPagingData;
            options.cachedData = cachedData;
            if (!options.isCustomLoading) {
                this._cachedStoreData = cachedStoreData;
                this._cachedPagingData = cachedPagingData;
                this._cachedData = cachedData
            }
        },
        _handleCustomizeStoreLoadOptions: function(options) {
            var _a;
            this._handleDataLoading(options);
            if (!(0 === (null === (_a = options.data) || void 0 === _a ? void 0 : _a.length))) {
                options.data = getPageDataFromCache(options, true) || options.cachedStoreData
            }
        },
        _handleDataLoading: function(options) {
            var _this4 = this;
            var dataSource = this._dataSource;
            var lastLoadOptions = this._lastLoadOptions;
            this.customizeStoreLoadOptions.fire(options);
            options.delay = this.option("loadingTimeout");
            options.originalStoreLoadOptions = options.storeLoadOptions;
            options.remoteOperations = (0, _extend.extend)({}, this.remoteOperations());
            var isFullReload = !this.isLoaded() && !this._isRefreshing;
            if (this.option("integrationOptions.renderedOnServer") && !this.isLoaded()) {
                options.delay = void 0
            }
            var loadOptions = (0, _extend.extend)({
                pageIndex: this.pageIndex(),
                pageSize: this.pageSize()
            }, options.storeLoadOptions);
            var operationTypes = calculateOperationTypes(loadOptions, lastLoadOptions, isFullReload);
            this._customizeRemoteOperations(options, operationTypes);
            if (!options.isCustomLoading) {
                var isRefreshing = this._isRefreshing;
                options.pageIndex = dataSource.pageIndex();
                options.lastLoadOptions = loadOptions;
                options.operationTypes = operationTypes;
                this._loadingOperationTypes = operationTypes;
                this._isRefreshing = true;
                (0, _deferred.when)(isRefreshing || this._isRefreshed || this.refresh(options, operationTypes)).done((function() {
                    if (_this4._lastOperationId === options.operationId) {
                        _this4._isRefreshed = true;
                        _this4.load().always((function() {
                            _this4._isRefreshed = false
                        }))
                    }
                })).fail((function() {
                    dataSource.cancel(options.operationId)
                })).always((function() {
                    _this4._isRefreshing = false
                }));
                dataSource.cancel(this._lastOperationId);
                this._lastOperationId = options.operationId;
                if (this._isRefreshing) {
                    dataSource.cancel(this._lastOperationId)
                }
            }
            this._handleDataLoadingCore(options)
        },
        _handleDataLoadingCore: function(options) {
            var remoteOperations = options.remoteOperations;
            options.loadOptions = {};
            var cachedExtra = options.cachedData.extra;
            var localLoadOptionNames = {
                filter: !remoteOperations.filtering,
                sort: !remoteOperations.sorting,
                group: !remoteOperations.grouping,
                summary: !remoteOperations.summary,
                skip: !remoteOperations.paging,
                take: !remoteOperations.paging,
                requireTotalCount: cachedExtra && "totalCount" in cachedExtra || !remoteOperations.paging,
                langParams: !remoteOperations.filtering || !remoteOperations.sorting
            };
            (0, _iterator.each)(options.storeLoadOptions, (function(optionName, optionValue) {
                if (localLoadOptionNames[optionName]) {
                    options.loadOptions[optionName] = optionValue;
                    delete options.storeLoadOptions[optionName]
                }
            }));
            if (cachedExtra) {
                options.extra = cachedExtra
            }
        },
        _handleDataLoaded: function(options) {
            var _this5 = this;
            var _a, _b;
            var loadOptions = options.loadOptions;
            var localPaging = options.remoteOperations && !options.remoteOperations.paging;
            var cachedData = options.cachedData;
            var storeLoadOptions = options.storeLoadOptions;
            var needCache = false !== this.option("cacheEnabled") && storeLoadOptions;
            var needPageCache = needCache && !options.isCustomLoading && cachedData && (!localPaging || storeLoadOptions.group);
            var needPagingCache = needCache && localPaging;
            var needStoreCache = needPagingCache && !options.isCustomLoading;
            if (!loadOptions) {
                this._dataSource.cancel(options.operationId);
                return
            }
            if (localPaging) {
                options.skip = loadOptions.skip;
                options.take = loadOptions.take;
                delete loadOptions.skip;
                delete loadOptions.take
            }
            if (loadOptions.group) {
                loadOptions.group = options.group || loadOptions.group
            }
            var groupCount = _module_utils.default.normalizeSortingInfo(options.group || storeLoadOptions.group || loadOptions.group).length;
            if (options.cachedDataPartBegin) {
                options.data = options.cachedDataPartBegin.concat(options.data)
            }
            if (options.cachedDataPartEnd) {
                options.data = options.data.concat(options.cachedDataPartEnd)
            }
            if (!needPageCache || !getPageDataFromCache(options)) {
                if (needPagingCache && options.cachedPagingData) {
                    options.data = cloneItems(options.cachedPagingData, groupCount)
                } else {
                    if (needStoreCache) {
                        if (!this._cachedStoreData) {
                            this._cachedStoreData = cloneItems(options.data, _module_utils.default.normalizeSortingInfo(storeLoadOptions.group).length)
                        } else if (options.mergeStoreLoadData) {
                            options.data = this._cachedStoreData = this._cachedStoreData.concat(options.data)
                        }
                    }
                    new _array_store.default(options.data).load(loadOptions).done((function(data) {
                        options.data = data;
                        if (needStoreCache) {
                            _this5._cachedPagingData = cloneItems(options.data, groupCount)
                        }
                    })).fail((function(error) {
                        options.data = (new _deferred.Deferred).reject(error)
                    }))
                }
                if (loadOptions.requireTotalCount && localPaging) {
                    options.extra = (0, _type.isPlainObject)(options.extra) ? options.extra : {};
                    options.extra.totalCount = options.data.length
                }
                if (options.extra && options.extra.totalCount >= 0 && (false === storeLoadOptions.requireTotalCount || false === loadOptions.requireTotalCount)) {
                    options.extra.totalCount = -1
                }
                if (!loadOptions.data && (storeLoadOptions.requireTotalCount || (null !== (_b = null === (_a = options.extra) || void 0 === _a ? void 0 : _a.totalCount) && void 0 !== _b ? _b : -1) >= 0)) {
                    this._totalCountCorrection = 0
                }
                this._handleDataLoadedCore(options);
                if (needPageCache) {
                    cachedData.extra = cachedData.extra || (0, _extend.extend)({}, options.extra);
                    (0, _deferred.when)(options.data).done((function(data) {
                        ! function(options, data, groupCount) {
                            var _a, _b, _c, _d;
                            var storeLoadOptions = options.storeLoadOptions;
                            var skip = null !== (_b = null !== (_a = options.skip) && void 0 !== _a ? _a : storeLoadOptions.skip) && void 0 !== _b ? _b : 0;
                            var take = null !== (_d = null !== (_c = options.take) && void 0 !== _c ? _c : storeLoadOptions.take) && void 0 !== _d ? _d : 0;
                            for (var i = 0; i < take; i++) {
                                var globalIndex = i + skip;
                                var cacheItems = options.cachedData.items;
                                var skips = 0 === i && options.skips || [];
                                cacheItems[globalIndex] = getCacheItem(cacheItems[globalIndex], data[i], groupCount, skips)
                            }
                        }(options, data, groupCount)
                    }))
                }
            }(0, _deferred.when)(options.data).done((function() {
                if (options.lastLoadOptions) {
                    _this5._lastLoadOptions = options.lastLoadOptions;
                    Object.keys(options.operationTypes).forEach((function(operationType) {
                        _this5._lastOperationTypes[operationType] = _this5._lastOperationTypes[operationType] || options.operationTypes[operationType]
                    }))
                }
            }));
            options.storeLoadOptions = options.originalStoreLoadOptions
        },
        _handleDataLoadedCore: function(options) {
            if (options.remoteOperations && !options.remoteOperations.paging && Array.isArray(options.data)) {
                if (void 0 !== options.skip) {
                    options.data = options.data.slice(options.skip)
                }
                if (void 0 !== options.take) {
                    options.data = options.data.slice(0, options.take)
                }
            }
        },
        _handleLoadingChanged: function(isLoading) {
            this.loadingChanged.fire(isLoading)
        },
        _handleLoadError: function(error) {
            this.loadError.fire(error);
            this.changed.fire({
                changeType: "loadError",
                error: error
            })
        },
        _loadPageSize: function() {
            return this.pageSize()
        },
        _handleDataChanged: function(args) {
            var currentTotalCount;
            var dataSource = this._dataSource;
            var isLoading = false;
            var isDataLoading = !args || (0, _type.isDefined)(args.changeType);
            var itemsCount = this.itemsCount();
            if (isDataLoading) {
                this._isLastPage = !itemsCount || !this._loadPageSize() || itemsCount < this._loadPageSize();
                if (this._isLastPage) {
                    this._hasLastPage = true
                }
            }
            if (dataSource.totalCount() >= 0) {
                if (dataSource.pageIndex() >= this.pageCount()) {
                    dataSource.pageIndex(this.pageCount() - 1);
                    this.pageIndex(dataSource.pageIndex());
                    this.resetPagesCache();
                    dataSource.load();
                    isLoading = true
                }
            } else if (isDataLoading) {
                currentTotalCount = dataSource.pageIndex() * this.pageSize() + itemsCount;
                if (currentTotalCount > this._currentTotalCount) {
                    this._currentTotalCount = currentTotalCount;
                    if (0 === dataSource.pageIndex() || !this.option("scrolling.legacyMode")) {
                        this._totalCountCorrection = 0
                    }
                }
                if (0 === itemsCount && dataSource.pageIndex() >= this.pageCount()) {
                    dataSource.pageIndex(this.pageCount() - 1);
                    if ("infinite" !== this.option("scrolling.mode")) {
                        dataSource.load();
                        isLoading = true
                    }
                }
            }
            if (!isLoading) {
                this._operationTypes = this._lastOperationTypes;
                this._lastOperationTypes = {};
                this.component._optionCache = {};
                this.changed.fire(args);
                this.component._optionCache = void 0
            }
        },
        _scheduleCustomLoadCallbacks: function(deferred) {
            var that = this;
            that._isCustomLoading = true;
            deferred.always((function() {
                that._isCustomLoading = false
            }))
        },
        loadingOperationTypes: function() {
            return this._loadingOperationTypes
        },
        operationTypes: function() {
            return this._operationTypes
        },
        lastLoadOptions: function() {
            return this._lastLoadOptions || {}
        },
        isLastPage: function() {
            return this._isLastPage
        },
        _dataSourceTotalCount: function() {
            return this._dataSource.totalCount()
        },
        totalCount: function() {
            return parseInt((this._currentTotalCount || this._dataSourceTotalCount()) + this._totalCountCorrection)
        },
        totalCountCorrection: function() {
            return this._totalCountCorrection
        },
        itemsCount: function() {
            return this._dataSource.items().length
        },
        totalItemsCount: function() {
            return this.totalCount()
        },
        pageSize: function() {
            var dataSource = this._dataSource;
            if (!arguments.length && !dataSource.paginate()) {
                return 0
            }
            return dataSource.pageSize.apply(dataSource, arguments)
        },
        pageCount: function() {
            var count = this.totalItemsCount() - this._totalCountCorrection;
            var pageSize = this.pageSize();
            if (pageSize && count > 0) {
                return Math.max(1, Math.ceil(count / pageSize))
            }
            return 1
        },
        hasKnownLastPage: function() {
            return this._hasLastPage || this._dataSource.totalCount() >= 0
        },
        loadFromStore: function(loadOptions, store) {
            var dataSource = this._dataSource;
            var d = new _deferred.Deferred;
            if (!dataSource) {
                return
            }
            store = store || dataSource.store();
            store.load(loadOptions).done((function(data, extra) {
                if (data && !Array.isArray(data) && Array.isArray(data.data)) {
                    extra = data;
                    data = data.data
                }
                d.resolve(data, extra)
            })).fail(d.reject);
            return d
        },
        isCustomLoading: function() {
            return !!this._isCustomLoading
        },
        load: function(options) {
            var _this6 = this;
            var that = this;
            var dataSource = that._dataSource;
            var d = new _deferred.Deferred;
            if (options) {
                var store = dataSource.store();
                var dataSourceLoadOptions = dataSource.loadOptions();
                var loadResult = {
                    storeLoadOptions: (0, _extend.extend)({}, options, {
                        langParams: null === dataSourceLoadOptions || void 0 === dataSourceLoadOptions ? void 0 : dataSourceLoadOptions.langParams
                    }),
                    isCustomLoading: true
                };
                (0, _iterator.each)(store._customLoadOptions() || [], (function(_, optionName) {
                    if (!(optionName in loadResult.storeLoadOptions)) {
                        loadResult.storeLoadOptions[optionName] = dataSourceLoadOptions[optionName]
                    }
                }));
                this._isLoadingAll = options.isLoadingAll;
                that._scheduleCustomLoadCallbacks(d);
                dataSource._scheduleLoadCallbacks(d);
                that._handleCustomizeStoreLoadOptions(loadResult);
                ! function(action, timeout) {
                    if ((0, _type.isDefined)(timeout)) {
                        (0, _common.executeAsync)(action, timeout)
                    } else {
                        action()
                    }
                }((function() {
                    if (!dataSource.store()) {
                        return d.reject("canceled")
                    }(0, _deferred.when)(loadResult.data || that.loadFromStore(loadResult.storeLoadOptions)).done((function(data, extra) {
                        loadResult.data = data;
                        loadResult.extra = extra || {};
                        that._handleDataLoaded(loadResult);
                        if (options.requireTotalCount && void 0 === loadResult.extra.totalCount) {
                            loadResult.extra.totalCount = store.totalCount(loadResult.storeLoadOptions)
                        }(0, _deferred.when)(loadResult.data, loadResult.extra.totalCount).done((function(data, totalCount) {
                            loadResult.extra.totalCount = totalCount;
                            d.resolve(data, loadResult.extra)
                        })).fail(d.reject)
                    })).fail(d.reject)
                }), that.option("loadingTimeout"));
                return d.fail((function() {
                    that._eventsStrategy.fireEvent("loadError", arguments)
                })).always((function() {
                    _this6._isLoadingAll = false
                })).promise()
            }
            return dataSource.load()
        },
        reload: function(full) {
            return full ? this._dataSource.reload() : this._dataSource.load()
        },
        getCachedStoreData: function() {
            return this._cachedStoreData
        }
    };
    return members
}());
exports.default = _default;