/**
 * DevExtreme (bundles/__internal/grids/pivot_grid/data_source/module.js)
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
exports.default = exports.PivotGridDataSource = void 0;
var _utils = require("../../../../data/data_source/utils");
var _abstract_store = _interopRequireDefault(require("../../../../data/abstract_store"));
var _common = require("../../../../core/utils/common");
var _type = require("../../../../core/utils/type");
var _extend = require("../../../../core/utils/extend");
var _array = require("../../../../core/utils/array");
var _iterator = require("../../../../core/utils/iterator");
var _deferred = require("../../../../core/utils/deferred");
var _class = _interopRequireDefault(require("../../../../core/class"));
var _events_strategy = require("../../../../core/events_strategy");
var _inflector = require("../../../../core/utils/inflector");
var _module = require("../local_store/module");
var _module2 = require("../remote_store/module");
var _module_utils = require("./module_utils");
var _module3 = _interopRequireDefault(require("../xmla_store/module"));
var _module4 = _interopRequireDefault(require("../summary_display_modes/module"));
var _module_widget_utils = require("../module_widget_utils");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var DESCRIPTION_NAME_BY_AREA = {
    row: "rows",
    column: "columns",
    data: "values",
    filter: "filters"
};
var STATE_PROPERTIES = ["area", "areaIndex", "sortOrder", "filterType", "filterValues", "sortBy", "sortBySummaryField", "sortBySummaryPath", "expanded", "summaryType", "summaryDisplayMode"];
var CALCULATED_PROPERTIES = ["format", "selector", "customizeText", "caption"];
var ALL_CALCULATED_PROPERTIES = CALCULATED_PROPERTIES.concat(["allowSorting", "allowSortingBySummary", "allowFiltering", "allowExpandAll"]);

function createCaption(field) {
    var caption = field.dataField || field.groupName || "";
    var summaryType = (field.summaryType || "").toLowerCase();
    if ((0, _type.isString)(field.groupInterval)) {
        caption += "_".concat(field.groupInterval)
    }
    if (summaryType && "custom" !== summaryType) {
        summaryType = summaryType.replace(/^./, summaryType[0].toUpperCase());
        if (caption.length) {
            summaryType = " (".concat(summaryType, ")")
        }
    } else {
        summaryType = ""
    }
    return (0, _inflector.titleize)(caption) + summaryType
}

function resetFieldState(field, properties) {
    var initialProperties = field._initProperties || {};
    (0, _iterator.each)(properties, (function(_, prop) {
        if (Object.prototype.hasOwnProperty.call(initialProperties, prop)) {
            field[prop] = initialProperties[prop]
        }
    }))
}

function updateCalculatedFieldProperties(field, calculatedProperties) {
    resetFieldState(field, calculatedProperties);
    if (!(0, _type.isDefined)(field.caption)) {
        (0, _module_widget_utils.setFieldProperty)(field, "caption", createCaption(field))
    }
}

function areExpressionsUsed(dataFields) {
    return dataFields.some((function(field) {
        return field.summaryDisplayMode || field.calculateSummaryValue
    }))
}

function isRunningTotalUsed(dataFields) {
    return dataFields.some((function(field) {
        return !!field.runningTotal
    }))
}

function isDataExists(data) {
    return data.rows.length || data.columns.length || data.values.length
}
var PivotGridDataSource = _class.default.inherit(function() {
    var findHeaderItem = function(headerItems, path) {
        if (headerItems._cacheByPath) {
            return headerItems._cacheByPath[path.join(".")] || null
        }
        return
    };
    var getHeaderItemsLastIndex = function getHeaderItemsLastIndex(headerItems, grandTotalIndex) {
        var i;
        var lastIndex = -1;
        var headerItem;
        if (headerItems) {
            for (i = 0; i < headerItems.length; i += 1) {
                headerItem = headerItems[i];
                if (void 0 !== headerItem.index) {
                    lastIndex = Math.max(lastIndex, headerItem.index)
                }
                if (headerItem.children) {
                    lastIndex = Math.max(lastIndex, getHeaderItemsLastIndex(headerItem.children))
                } else if (headerItem.collapsedChildren) {
                    lastIndex = Math.max(lastIndex, getHeaderItemsLastIndex(headerItem.collapsedChildren))
                }
            }
        }
        if ((0, _type.isDefined)(grandTotalIndex)) {
            lastIndex = Math.max(lastIndex, grandTotalIndex)
        }
        return lastIndex
    };
    var updateHeaderItemChildren = function(headerItems, headerItem, children, grandTotalIndex) {
        var applyingHeaderItemsCount = getHeaderItemsLastIndex(children) + 1;
        var emptyIndex = getHeaderItemsLastIndex(headerItems, grandTotalIndex) + 1;
        var index;
        var applyingItemIndexesToCurrent = [];
        var needIndexUpdate = false;
        var d = new _deferred.Deferred;
        if (headerItem.children && headerItem.children.length === children.length) {
            for (var i = 0; i < children.length; i += 1) {
                var child = children[i];
                if (void 0 !== child.index) {
                    if (void 0 === headerItem.children[i].index) {
                        child.index = applyingItemIndexesToCurrent[child.index] = emptyIndex++;
                        headerItem.children[i] = child
                    } else {
                        applyingItemIndexesToCurrent[child.index] = headerItem.children[i].index
                    }
                }
            }
        } else {
            needIndexUpdate = true;
            for (index = 0; index < applyingHeaderItemsCount; index += 1) {
                applyingItemIndexesToCurrent[index] = emptyIndex++
            }
            headerItem.children = children
        }(0, _deferred.when)((0, _module_widget_utils.foreachTreeAsync)(headerItem.children, (function(items) {
            if (needIndexUpdate) {
                items[0].index = applyingItemIndexesToCurrent[items[0].index]
            }
        }))).done((function() {
            d.resolve(applyingItemIndexesToCurrent)
        }));
        return d
    };
    var updateHeaderItems = function(headerItems, newHeaderItems, grandTotalIndex) {
        var d = new _deferred.Deferred;
        var emptyIndex = grandTotalIndex >= 0 && getHeaderItemsLastIndex(headerItems, grandTotalIndex) + 1;
        var applyingItemIndexesToCurrent = [];
        (0, _deferred.when)((0, _module_widget_utils.foreachTreeAsync)(headerItems, (function(items) {
            delete items[0].collapsedChildren
        }))).done((function() {
            (0, _deferred.when)((0, _module_widget_utils.foreachTreeAsync)(newHeaderItems, (function(newItems, index) {
                var newItem = newItems[0];
                if (newItem.index >= 0) {
                    var headerItem = findHeaderItem(headerItems, (0, _module_widget_utils.createPath)(newItems));
                    if (headerItem && headerItem.index >= 0) {
                        applyingItemIndexesToCurrent[newItem.index] = headerItem.index
                    } else if (emptyIndex) {
                        var path = (0, _module_widget_utils.createPath)(newItems.slice(1));
                        headerItem = findHeaderItem(headerItems, path);
                        var parentItems = path.length ? headerItem && headerItem.children : headerItems;
                        if (parentItems) {
                            parentItems[index] = newItem;
                            newItem.index = applyingItemIndexesToCurrent[newItem.index] = emptyIndex++
                        }
                    }
                }
            }))).done((function() {
                d.resolve(applyingItemIndexesToCurrent)
            }))
        }));
        return d
    };
    var updateDataSourceCells = function(dataSource, newDataSourceCells, newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent) {
        var newRowIndex;
        var newColumnIndex;
        var newRowCells;
        var newCell;
        var rowIndex;
        var columnIndex;
        var dataSourceCells = dataSource.values;
        if (newDataSourceCells) {
            for (newRowIndex = 0; newRowIndex < newDataSourceCells.length; newRowIndex += 1) {
                newRowCells = newDataSourceCells[newRowIndex];
                rowIndex = newRowItemIndexesToCurrent[newRowIndex];
                if (!(0, _type.isDefined)(rowIndex)) {
                    rowIndex = dataSource.grandTotalRowIndex
                }
                if (newRowCells && (0, _type.isDefined)(rowIndex)) {
                    if (!dataSourceCells[rowIndex]) {
                        dataSourceCells[rowIndex] = []
                    }
                    for (newColumnIndex = 0; newColumnIndex < newRowCells.length; newColumnIndex += 1) {
                        newCell = newRowCells[newColumnIndex];
                        columnIndex = newColumnItemIndexesToCurrent[newColumnIndex];
                        if (!(0, _type.isDefined)(columnIndex)) {
                            columnIndex = dataSource.grandTotalColumnIndex
                        }
                        if ((0, _type.isDefined)(newCell) && (0, _type.isDefined)(columnIndex)) {
                            dataSourceCells[rowIndex][columnIndex] = newCell
                        }
                    }
                }
            }
        }
    };

    function createLocalOrRemoteStore(dataSourceOptions, notifyProgress) {
        var StoreConstructor = dataSourceOptions.remoteOperations || dataSourceOptions.paginate ? _module2.RemoteStore : _module.LocalStore;
        return new StoreConstructor((0, _extend.extend)((0, _utils.normalizeDataSourceOptions)(dataSourceOptions), {
            onChanged: null,
            onLoadingChanged: null,
            onProgressChanged: notifyProgress
        }))
    }

    function getExpandedPaths(dataSource, loadOptions, dimensionName, prevLoadOptions) {
        var result = [];
        var fields = loadOptions && loadOptions[dimensionName] || [];
        var prevFields = prevLoadOptions && prevLoadOptions[dimensionName] || [];
        (0, _module_widget_utils.foreachTree)(dataSource[dimensionName], (function(items) {
            var item = items[0];
            var path = (0, _module_widget_utils.createPath)(items);
            if (item.children && fields[path.length - 1] && !fields[path.length - 1].expanded) {
                if (path.length < fields.length && (!prevLoadOptions || function(fields, prevFields, count) {
                        for (var i = 0; i < count; i += 1) {
                            if (!fields[i] || !prevFields[i] || fields[i].index !== prevFields[i].index) {
                                return false
                            }
                        }
                        return true
                    }(fields, prevFields, path.length))) {
                    result.push(path.slice())
                }
            }
        }), true);
        return result
    }

    function setFieldProperties(field, srcField, skipInitPropertySave, properties) {
        if (srcField) {
            (0, _iterator.each)(properties, (function(_, name) {
                if (skipInitPropertySave) {
                    field[name] = srcField[name]
                } else {
                    if (("summaryType" === name || "summaryDisplayMode" === name) && void 0 === srcField[name]) {
                        return
                    }(0, _module_widget_utils.setFieldProperty)(field, name, srcField[name])
                }
            }))
        } else {
            resetFieldState(field, properties)
        }
        return field
    }

    function getFieldsState(fields, properties) {
        var result = [];
        (0, _iterator.each)(fields, (function(_, field) {
            result.push(setFieldProperties({
                dataField: field.dataField,
                name: field.name
            }, field, true, properties))
        }));
        return result
    }

    function getFieldStateId(field) {
        if (field.name) {
            return field.name
        }
        return "".concat(field.dataField)
    }

    function getFieldsById(fields, id) {
        var result = [];
        (0, _iterator.each)(fields || [], (function(_, field) {
            if (getFieldStateId(field) === id) {
                result.push(field)
            }
        }));
        return result
    }

    function setFieldsState(stateFields, fields) {
        stateFields = stateFields || [];
        var fieldsById = {};
        var id;
        (0, _iterator.each)(fields, (function(_, field) {
            id = getFieldStateId(field);
            if (!fieldsById[id]) {
                fieldsById[id] = getFieldsById(fields, getFieldStateId(field))
            }
        }));
        (0, _iterator.each)(fieldsById, (function(id, fields) {
            ! function(stateFields, fields) {
                stateFields = stateFields || [];
                (0, _iterator.each)(fields, (function(index, field) {
                    setFieldProperties(field, stateFields[index], false, STATE_PROPERTIES);
                    updateCalculatedFieldProperties(field, CALCULATED_PROPERTIES)
                }));
                return fields
            }(getFieldsById(stateFields, id), fields)
        }));
        return fields
    }

    function sortFieldsByAreaIndex(fields) {
        fields.sort((function(field1, field2) {
            return field1.areaIndex - field2.areaIndex || field1.groupIndex - field2.groupIndex
        }))
    }

    function getFieldId(field, retrieveFieldsOptionValue) {
        var groupName = field.groupName || "";
        return (field.dataField || groupName) + (field.groupInterval ? groupName + field.groupInterval : "NOGROUP") + (retrieveFieldsOptionValue ? "" : groupName)
    }

    function mergeFields(fields, storeFields, retrieveFieldsOptionValue) {
        var result = [];
        var fieldsDictionary = {};
        var removedFields = {};
        var dataTypes = (0, _module_widget_utils.getFieldsDataType)(fields);
        if (storeFields) {
            (0, _iterator.each)(storeFields, (function(_, field) {
                fieldsDictionary[getFieldId(field, retrieveFieldsOptionValue)] = field
            }));
            (0, _iterator.each)(fields, (function(_, field) {
                var fieldKey = getFieldId(field, retrieveFieldsOptionValue);
                var storeField = fieldsDictionary[fieldKey] || removedFields[fieldKey];
                var mergedField;
                if (storeField) {
                    if (storeField._initProperties) {
                        resetFieldState(storeField, ALL_CALCULATED_PROPERTIES)
                    }
                    mergedField = (0, _extend.extend)({}, storeField, field, {
                        _initProperties: null
                    })
                } else {
                    fieldsDictionary[fieldKey] = mergedField = field
                }
                if (!mergedField.dataType && dataTypes[field.dataField]) {
                    mergedField.dataType = dataTypes[field.dataField]
                }
                delete fieldsDictionary[fieldKey];
                removedFields[fieldKey] = storeField;
                result.push(mergedField)
            }));
            if (retrieveFieldsOptionValue) {
                (0, _iterator.each)(fieldsDictionary, (function(_, field) {
                    result.push(field)
                }))
            }
        } else {
            result = fields
        }
        result.push.apply(result, []);
        ! function(fields) {
            fields.forEach((function(field) {
                if (field.groupName && field.groupInterval && void 0 === field.groupIndex) {
                    var maxGroupIndex = fields.filter((function(f) {
                        return f.groupName === field.groupName && (0, _type.isNumeric)(f.groupIndex)
                    })).map((function(f) {
                        return f.groupIndex
                    })).reduce((function(prev, current) {
                        return Math.max(prev, current)
                    }), -1);
                    field.groupIndex = maxGroupIndex + 1
                }
            }))
        }(result);
        return result
    }

    function getFields(that) {
        var result = new _deferred.Deferred;
        var store = that._store;
        var storeFields = store && store.getFields(that._fields);
        var mergedFields;
        (0, _deferred.when)(storeFields).done((function(storeFields) {
            that._storeFields = storeFields;
            mergedFields = mergeFields(that._fields, storeFields, that._retrieveFields);
            result.resolve(mergedFields)
        })).fail(result.reject);
        return result
    }

    function formatHeaderItems(data, loadOptions, headerName) {
        return (0, _module_widget_utils.foreachTreeAsync)(data[headerName], (function(items) {
            var item = items[0];
            item.text = item.text || (0, _module_widget_utils.formatValue)(item.value, loadOptions[headerName][(0, _module_widget_utils.createPath)(items).length - 1])
        }))
    }

    function formatHeaders(loadOptions, data) {
        return (0, _deferred.when)(formatHeaderItems(data, loadOptions, "columns"), formatHeaderItems(data, loadOptions, "rows"))
    }

    function updateCache(headerItems) {
        var d = new _deferred.Deferred;
        var cacheByPath = {};
        (0, _deferred.when)((0, _module_widget_utils.foreachTreeAsync)(headerItems, (function(items) {
            var path = (0, _module_widget_utils.createPath)(items).join(".");
            cacheByPath[path] = items[0]
        }))).done(d.resolve);
        headerItems._cacheByPath = cacheByPath;
        return d
    }

    function _getAreaFields(fields, area) {
        var areaFields = [];
        (0, _iterator.each)(fields, (function() {
            if (function(field, area) {
                    var canAddFieldInArea = "data" === area || false !== field.visible;
                    return field.area === area && !(0, _type.isDefined)(field.groupIndex) && canAddFieldInArea
                }(this, area)) {
                areaFields.push(this)
            }
        }));
        return areaFields
    }
    return {
        ctor: function(options) {
            var _this = this;
            options = options || {};
            this._eventsStrategy = new _events_strategy.EventsStrategy(this);
            var that = this;
            var store = function(dataSourceOptions, notifyProgress) {
                var store;
                var storeOptions;
                if ((0, _type.isPlainObject)(dataSourceOptions) && dataSourceOptions.load) {
                    store = createLocalOrRemoteStore(dataSourceOptions, notifyProgress)
                } else {
                    if (dataSourceOptions && !dataSourceOptions.store) {
                        dataSourceOptions = {
                            store: dataSourceOptions
                        }
                    }
                    storeOptions = dataSourceOptions.store;
                    if ("xmla" === storeOptions.type) {
                        store = new _module3.default.XmlaStore(storeOptions)
                    } else if ((0, _type.isPlainObject)(storeOptions) && storeOptions.type || storeOptions instanceof _abstract_store.default || Array.isArray(storeOptions)) {
                        store = createLocalOrRemoteStore(dataSourceOptions, notifyProgress)
                    } else if (storeOptions instanceof _class.default) {
                        store = storeOptions
                    }
                }
                return store
            }(options, (function(progress) {
                that._eventsStrategy.fireEvent("progressChanged", [progress])
            }));
            that._store = store;
            that._paginate = !!options.paginate;
            that._pageSize = options.pageSize || 40;
            that._data = {
                rows: [],
                columns: [],
                values: []
            };
            that._loadingCount = 0;
            that._isFieldsModified = false;
            (0, _iterator.each)(["changed", "loadError", "loadingChanged", "progressChanged", "fieldsPrepared", "expandValueChanging"], (function(_, eventName) {
                var optionName = "on".concat(eventName[0].toUpperCase()).concat(eventName.slice(1));
                if (Object.prototype.hasOwnProperty.call(options, optionName)) {
                    _this.on(eventName, options[optionName])
                }
            }));
            that._retrieveFields = (0, _type.isDefined)(options.retrieveFields) ? options.retrieveFields : true;
            that._fields = options.fields || [];
            that._descriptions = options.descriptions ? (0, _extend.extend)(that._createDescriptions(), options.descriptions) : void 0;
            if (!store) {
                (0, _extend.extend)(true, that._data, options.store || options)
            }
        },
        getData: function() {
            return this._data
        },
        getAreaFields: function(area, collectGroups) {
            var areaFields = [];
            var descriptions;
            if (collectGroups || "data" === area) {
                areaFields = _getAreaFields(this._fields, area);
                sortFieldsByAreaIndex(areaFields)
            } else {
                descriptions = this._descriptions || {};
                areaFields = descriptions[DESCRIPTION_NAME_BY_AREA[area]] || []
            }
            return areaFields
        },
        fields: function(_fields) {
            if (_fields) {
                this._fields = mergeFields(_fields, this._storeFields, this._retrieveFields);
                this._fieldsPrepared(this._fields)
            }
            return this._fields
        },
        field: function(id, options) {
            var fields = this._fields;
            var field = fields && fields[(0, _type.isNumeric)(id) ? id : (0, _module_widget_utils.findField)(fields, id)];
            var levels;
            if (field && options) {
                (0, _iterator.each)(options, (function(optionName, optionValue) {
                    var isInitialization = !STATE_PROPERTIES.includes(optionName);
                    (0, _module_widget_utils.setFieldProperty)(field, optionName, optionValue, isInitialization);
                    if ("sortOrder" === optionName) {
                        levels = field.levels || [];
                        for (var i = 0; i < levels.length; i += 1) {
                            levels[i][optionName] = optionValue
                        }
                    }
                }));
                updateCalculatedFieldProperties(field, CALCULATED_PROPERTIES);
                this._descriptions = this._createDescriptions(field);
                this._isFieldsModified = true;
                this._eventsStrategy.fireEvent("fieldChanged", [field])
            }
            return field
        },
        getFieldValues: function(index, applyFilters, options) {
            var that = this;
            var field = this._fields && this._fields[index];
            var store = this.store();
            var loadFields = [];
            var loadOptions = {
                columns: loadFields,
                rows: [],
                values: this.getAreaFields("data"),
                filters: applyFilters ? this._fields.filter((function(f) {
                    return f !== field && f.area && f.filterValues && f.filterValues.length
                })) : [],
                skipValues: true
            };
            var searchValue;
            var d = new _deferred.Deferred;
            if (options) {
                searchValue = options.searchValue;
                loadOptions.columnSkip = options.skip;
                loadOptions.columnTake = options.take
            }
            if (field && store) {
                (0, _iterator.each)(field.levels || [field], (function() {
                    loadFields.push((0, _extend.extend)({}, this, {
                        expanded: true,
                        filterValues: null,
                        sortOrder: "asc",
                        sortBySummaryField: null,
                        searchValue: searchValue
                    }))
                }));
                store.load(loadOptions).done((function(data) {
                    if (loadOptions.columnSkip) {
                        data.columns = data.columns.slice(loadOptions.columnSkip)
                    }
                    if (loadOptions.columnTake) {
                        data.columns = data.columns.slice(0, loadOptions.columnTake)
                    }
                    formatHeaders(loadOptions, data);
                    if (!loadOptions.columnTake) {
                        that._sort(loadOptions, data)
                    }
                    d.resolve(data.columns)
                })).fail(d)
            } else {
                d.reject()
            }
            return d
        },
        reload: function() {
            return this.load({
                reload: true
            })
        },
        filter: function() {
            var store = this._store;
            return store.filter.apply(store, arguments)
        },
        load: function(options) {
            var that = this;
            var d = new _deferred.Deferred;
            options = options || {};
            that.beginLoading();
            d.fail((function(e) {
                that._eventsStrategy.fireEvent("loadError", [e])
            })).always((function() {
                that.endLoading()
            }));

            function loadTask() {
                that._delayedLoadTask = void 0;
                if (!that._descriptions) {
                    (0, _deferred.when)(getFields(that)).done((function(fields) {
                        that._fieldsPrepared(fields);
                        that._loadCore(options, d)
                    })).fail(d.reject).fail(that._loadErrorHandler)
                } else {
                    that._loadCore(options, d)
                }
            }
            if (that.store()) {
                that._delayedLoadTask = (0, _common.executeAsync)(loadTask)
            } else {
                loadTask()
            }
            return d
        },
        createDrillDownDataSource: function(params) {
            return this._store.createDrillDownDataSource(this._descriptions, params)
        },
        _createDescriptions: function(currentField) {
            var fields = this.fields();
            var descriptions = {
                rows: [],
                columns: [],
                values: [],
                filters: []
            };
            (0, _iterator.each)(["row", "column", "data", "filter"], (function(_, areaName) {
                (0, _array.normalizeIndexes)(_getAreaFields(fields, areaName), "areaIndex", currentField)
            }));
            (0, _iterator.each)(fields || [], (function(_, field) {
                var descriptionName = DESCRIPTION_NAME_BY_AREA[field.area];
                var dimension = descriptions[descriptionName];
                var groupName = field.groupName;
                if (groupName && !(0, _type.isNumeric)(field.groupIndex)) {
                    field.levels = function(fields, groupingField) {
                        return fields.filter((function(field) {
                            return field.groupName === groupingField.groupName && (0, _type.isNumeric)(field.groupIndex) && false !== field.visible
                        })).map((function(field) {
                            return (0, _extend.extend)(field, {
                                areaIndex: groupingField.areaIndex,
                                area: groupingField.area,
                                expanded: (0, _type.isDefined)(field.expanded) ? field.expanded : groupingField.expanded,
                                dataField: field.dataField || groupingField.dataField,
                                dataType: field.dataType || groupingField.dataType,
                                sortBy: field.sortBy || groupingField.sortBy,
                                sortOrder: field.sortOrder || groupingField.sortOrder,
                                sortBySummaryField: field.sortBySummaryField || groupingField.sortBySummaryField,
                                sortBySummaryPath: field.sortBySummaryPath || groupingField.sortBySummaryPath,
                                visible: field.visible || groupingField.visible,
                                showTotals: (0, _type.isDefined)(field.showTotals) ? field.showTotals : groupingField.showTotals,
                                showGrandTotals: (0, _type.isDefined)(field.showGrandTotals) ? field.showGrandTotals : groupingField.showGrandTotals
                            })
                        })).sort((function(a, b) {
                            return a.groupIndex - b.groupIndex
                        }))
                    }(fields, field)
                }
                if (!dimension || groupName && (0, _type.isNumeric)(field.groupIndex) || false === field.visible && "data" !== field.area && "filter" !== field.area) {
                    return
                }
                if (field.levels && dimension !== descriptions.filters && dimension !== descriptions.values) {
                    dimension.push.apply(dimension, field.levels);
                    if (field.filterValues && field.filterValues.length) {
                        descriptions.filters.push(field)
                    }
                } else {
                    dimension.push(field)
                }
            }));
            (0, _iterator.each)(descriptions, (function(_, fields) {
                sortFieldsByAreaIndex(fields)
            }));
            var indices = {};
            (0, _iterator.each)(descriptions.values, (function(_, field) {
                var expression = field.calculateSummaryValue;
                if ((0, _type.isFunction)(expression)) {
                    var summaryCell = _module4.default.createMockSummaryCell(descriptions, fields, indices);
                    expression(summaryCell)
                }
            }));
            return descriptions
        },
        _fieldsPrepared: function(fields) {
            this._fields = fields;
            (0, _iterator.each)(fields, (function(index, field) {
                field.index = index;
                updateCalculatedFieldProperties(field, ALL_CALCULATED_PROPERTIES)
            }));
            var currentFieldState = getFieldsState(fields, ["caption"]);
            this._eventsStrategy.fireEvent("fieldsPrepared", [fields]);
            for (var i = 0; i < fields.length; i += 1) {
                if (fields[i].caption !== currentFieldState[i].caption) {
                    (0, _module_widget_utils.setFieldProperty)(fields[i], "caption", fields[i].caption, true)
                }
            }
            this._descriptions = this._createDescriptions()
        },
        isLoading: function() {
            return this._loadingCount > 0
        },
        state: function(_state, skipLoading) {
            var that = this;
            if (arguments.length) {
                _state = (0, _extend.extend)({
                    rowExpandedPaths: [],
                    columnExpandedPaths: []
                }, _state);
                if (!that._descriptions) {
                    that.beginLoading();
                    (0, _deferred.when)(getFields(that)).done((function(fields) {
                        that._fields = setFieldsState(_state.fields, fields);
                        that._fieldsPrepared(fields);
                        !skipLoading && that.load(_state)
                    })).always((function() {
                        that.endLoading()
                    }))
                } else {
                    that._fields = setFieldsState(_state.fields, that._fields);
                    that._descriptions = that._createDescriptions();
                    !skipLoading && that.load(_state)
                }
                return
            }
            return {
                fields: getFieldsState(that._fields, STATE_PROPERTIES),
                columnExpandedPaths: getExpandedPaths(that._data, that._descriptions, "columns", that._lastLoadOptions),
                rowExpandedPaths: getExpandedPaths(that._data, that._descriptions, "rows", that._lastLoadOptions)
            }
        },
        beginLoading: function() {
            this._changeLoadingCount(1)
        },
        endLoading: function() {
            this._changeLoadingCount(-1)
        },
        _changeLoadingCount: function(increment) {
            var oldLoading = this.isLoading();
            this._loadingCount += increment;
            var newLoading = this.isLoading();
            if (oldLoading ^ newLoading) {
                this._eventsStrategy.fireEvent("loadingChanged", [newLoading])
            }
        },
        _hasPagingValues: function(options, area, oppositeIndex) {
            var takeField = "".concat(area, "Take");
            var skipField = "".concat(area, "Skip");
            var values = this._data.values;
            var items = this._data["".concat(area, "s")];
            var oppositeArea = "row" === area ? "column" : "row";
            var indices = [];
            if (options.path && options.area === area) {
                var headerItem = findHeaderItem(items, options.path);
                items = headerItem && headerItem.children;
                if (!items) {
                    return false
                }
            }
            if (options.oppositePath && options.area === oppositeArea) {
                var _headerItem = findHeaderItem(items, options.oppositePath);
                items = _headerItem && _headerItem.children;
                if (!items) {
                    return false
                }
            }
            for (var i = options[skipField]; i < options[skipField] + options[takeField]; i += 1) {
                if (items[i]) {
                    indices.push(items[i].index)
                }
            }
            return indices.every((function(index) {
                if (void 0 !== index) {
                    if ("row" === area) {
                        return (values[index] || [])[oppositeIndex]
                    }
                    return (values[oppositeIndex] || [])[index]
                }
                return
            }))
        },
        _processPagingCacheByArea: function(options, pageSize, area) {
            var takeField = "".concat(area, "Take");
            var skipField = "".concat(area, "Skip");
            var items = this._data["".concat(area, "s")];
            var oppositeArea = "row" === area ? "column" : "row";
            var item;
            if (options[takeField]) {
                if (options.path && options.area === area) {
                    var headerItem = findHeaderItem(items, options.path);
                    items = headerItem && headerItem.children || []
                }
                if (options.oppositePath && options.area === oppositeArea) {
                    var _headerItem2 = findHeaderItem(items, options.oppositePath);
                    items = _headerItem2 && _headerItem2.children || []
                }
                do {
                    item = items[options[skipField]];
                    if (item && void 0 !== item.index) {
                        if (this._hasPagingValues(options, oppositeArea, item.index)) {
                            options[skipField]++;
                            options[takeField]--
                        } else {
                            break
                        }
                    }
                } while (item && void 0 !== item.index && options[takeField]);
                if (options[takeField]) {
                    var start = Math.floor(options[skipField] / pageSize) * pageSize;
                    var end = Math.ceil((options[skipField] + options[takeField]) / pageSize) * pageSize;
                    options[skipField] = start;
                    options[takeField] = end - start
                }
            }
        },
        _processPagingCache: function(storeLoadOptions) {
            var pageSize = this._pageSize;
            if (pageSize < 0) {
                return
            }
            for (var i = 0; i < storeLoadOptions.length; i += 1) {
                this._processPagingCacheByArea(storeLoadOptions[i], pageSize, "row");
                this._processPagingCacheByArea(storeLoadOptions[i], pageSize, "column")
            }
        },
        _loadCore: function(options, deferred) {
            var that = this;
            var store = this._store;
            var descriptions = this._descriptions;
            var reload = options.reload || this.paginate() && that._isFieldsModified;
            var paginate = this.paginate();
            var headerName = DESCRIPTION_NAME_BY_AREA[options.area];
            options = options || {};
            if (store) {
                (0, _extend.extend)(options, descriptions);
                options.columnExpandedPaths = options.columnExpandedPaths || getExpandedPaths(this._data, options, "columns", that._lastLoadOptions);
                options.rowExpandedPaths = options.rowExpandedPaths || getExpandedPaths(this._data, options, "rows", that._lastLoadOptions);
                if (paginate) {
                    options.pageSize = this._pageSize
                }
                if (headerName) {
                    options.headerName = headerName
                }
                that.beginLoading();
                deferred.always((function() {
                    that.endLoading()
                }));
                var storeLoadOptions = [options];
                that._eventsStrategy.fireEvent("customizeStoreLoadOptions", [storeLoadOptions, reload]);
                if (!reload) {
                    that._processPagingCache(storeLoadOptions)
                }
                storeLoadOptions = storeLoadOptions.filter((function(options) {
                    return !(options.rows.length && 0 === options.rowTake) && !(options.columns.length && 0 === options.columnTake)
                }));
                if (!storeLoadOptions.length) {
                    that._update(deferred);
                    return
                }
                var results = storeLoadOptions.map((function(options) {
                    return store.load(options)
                }));
                _deferred.when.apply(null, results).done((function() {
                    var results = arguments;
                    for (var i = 0; i < results.length; i += 1) {
                        var _options = storeLoadOptions[i];
                        var data = results[i];
                        var isLast = i === results.length - 1;
                        if (_options.path) {
                            that.applyPartialDataSource(_options.area, _options.path, data, isLast ? deferred : false, _options.oppositePath)
                        } else if (paginate && !reload && isDataExists(that._data)) {
                            that.mergePartialDataSource(data, isLast ? deferred : false)
                        } else {
                            (0, _extend.extend)(that._data, data);
                            that._lastLoadOptions = _options;
                            that._update(isLast ? deferred : false)
                        }
                    }
                })).fail(deferred.reject)
            } else {
                that._update(deferred)
            }
        },
        _sort: function(descriptions, data, getAscOrder) {
            var store = this._store;
            if (store && !this._paginate) {
                (0, _module_utils.sort)(descriptions, data, getAscOrder)
            }
        },
        sortLocal: function() {
            this._sort(this._descriptions, this._data, areExpressionsUsed(this._descriptions.values));
            this._eventsStrategy.fireEvent("changed")
        },
        paginate: function() {
            return this._paginate && this._store && this._store.supportPaging()
        },
        isEmpty: function() {
            var dataFields = this.getAreaFields("data").filter((function(f) {
                return false !== f.visible
            }));
            var data = this.getData();
            return !dataFields.length || !data.values.length
        },
        _update: function(deferred) {
            var that = this;
            var descriptions = that._descriptions;
            var loadedData = that._data;
            var dataFields = descriptions.values;
            var expressionsUsed = areExpressionsUsed(dataFields);
            (0, _deferred.when)(formatHeaders(descriptions, loadedData), updateCache(loadedData.rows), updateCache(loadedData.columns)).done((function() {
                if (expressionsUsed) {
                    that._sort(descriptions, loadedData, expressionsUsed);
                    !that.isEmpty() && _module4.default.applyDisplaySummaryMode(descriptions, loadedData)
                }
                that._sort(descriptions, loadedData);
                !that.isEmpty() && isRunningTotalUsed(dataFields) && _module4.default.applyRunningTotal(descriptions, loadedData);
                that._data = loadedData;
                false !== deferred && (0, _deferred.when)(deferred).done((function() {
                    that._isFieldsModified = false;
                    that._eventsStrategy.fireEvent("changed");
                    if ((0, _type.isDefined)(that._data.grandTotalRowIndex)) {
                        loadedData.grandTotalRowIndex = that._data.grandTotalRowIndex
                    }
                    if ((0, _type.isDefined)(that._data.grandTotalColumnIndex)) {
                        loadedData.grandTotalColumnIndex = that._data.grandTotalColumnIndex
                    }
                }));
                deferred && deferred.resolve(that._data)
            }));
            return deferred
        },
        store: function() {
            return this._store
        },
        collapseHeaderItem: function(area, path) {
            var headerItems = "column" === area ? this._data.columns : this._data.rows;
            var headerItem = findHeaderItem(headerItems, path);
            var field = this.getAreaFields(area)[path.length - 1];
            if (headerItem && headerItem.children) {
                this._eventsStrategy.fireEvent("expandValueChanging", [{
                    area: area,
                    path: path,
                    expanded: false
                }]);
                if (field) {
                    field.expanded = false
                }
                headerItem.collapsedChildren = headerItem.children;
                delete headerItem.children;
                this._update();
                if (this.paginate()) {
                    this.load()
                }
                return true
            }
            return false
        },
        collapseAll: function(id) {
            var _this2 = this;
            var dataChanged = false;
            var field = this.field(id) || {};
            var areaOffsets = [this.getAreaFields(field.area).indexOf(field)];
            field.expanded = false;
            if (field && field.levels) {
                areaOffsets = [];
                field.levels.forEach((function(f) {
                    areaOffsets.push(_this2.getAreaFields(field.area).indexOf(f));
                    f.expanded = false
                }))
            }(0, _module_widget_utils.foreachTree)(this._data["".concat(field.area, "s")], (function(items) {
                var item = items[0];
                var path = (0, _module_widget_utils.createPath)(items);
                if (item && item.children && areaOffsets.includes(path.length - 1)) {
                    item.collapsedChildren = item.children;
                    delete item.children;
                    dataChanged = true
                }
            }), true);
            dataChanged && this._update()
        },
        expandAll: function(id) {
            var field = this.field(id);
            if (field && field.area) {
                field.expanded = true;
                if (field && field.levels) {
                    field.levels.forEach((function(f) {
                        f.expanded = true
                    }))
                }
                this.load()
            }
        },
        expandHeaderItem: function(area, path) {
            var headerItems = "column" === area ? this._data.columns : this._data.rows;
            var headerItem = findHeaderItem(headerItems, path);
            if (headerItem && !headerItem.children) {
                var hasCache = !!headerItem.collapsedChildren;
                var options = {
                    area: area,
                    path: path,
                    expanded: true,
                    needExpandData: !hasCache
                };
                this._eventsStrategy.fireEvent("expandValueChanging", [options]);
                if (hasCache) {
                    headerItem.children = headerItem.collapsedChildren;
                    delete headerItem.collapsedChildren;
                    this._update()
                } else if (this.store()) {
                    this.load(options)
                }
                return hasCache
            }
            return false
        },
        mergePartialDataSource: function(dataSource, deferred) {
            var that = this;
            var loadedData = that._data;
            var newRowItemIndexesToCurrent;
            var newColumnItemIndexesToCurrent;
            if (dataSource && dataSource.values) {
                dataSource.rows = dataSource.rows || [];
                dataSource.columns = dataSource.columns || [];
                newRowItemIndexesToCurrent = updateHeaderItems(loadedData.rows, dataSource.rows, loadedData.grandTotalColumnIndex);
                newColumnItemIndexesToCurrent = updateHeaderItems(loadedData.columns, dataSource.columns, loadedData.grandTotalColumnIndex);
                (0, _deferred.when)(newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent).done((function(newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent) {
                    if (newRowItemIndexesToCurrent.length || newColumnItemIndexesToCurrent.length) {
                        updateDataSourceCells(loadedData, dataSource.values, newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent)
                    }
                    that._update(deferred)
                }))
            }
        },
        applyPartialDataSource: function(area, path, dataSource, deferred, oppositePath) {
            var that = this;
            var loadedData = that._data;
            var headerItems = "column" === area ? loadedData.columns : loadedData.rows;
            var headerItem;
            var oppositeHeaderItems = "column" === area ? loadedData.rows : loadedData.columns;
            var oppositeHeaderItem;
            var newRowItemIndexesToCurrent;
            var newColumnItemIndexesToCurrent;
            if (dataSource && dataSource.values) {
                dataSource.rows = dataSource.rows || [];
                dataSource.columns = dataSource.columns || [];
                headerItem = findHeaderItem(headerItems, path);
                oppositeHeaderItem = oppositePath && findHeaderItem(oppositeHeaderItems, oppositePath);
                if (headerItem) {
                    if ("column" === area) {
                        newColumnItemIndexesToCurrent = updateHeaderItemChildren(headerItems, headerItem, dataSource.columns, loadedData.grandTotalColumnIndex);
                        if (oppositeHeaderItem) {
                            newRowItemIndexesToCurrent = updateHeaderItemChildren(oppositeHeaderItems, oppositeHeaderItem, dataSource.rows, loadedData.grandTotalRowIndex)
                        } else {
                            newRowItemIndexesToCurrent = updateHeaderItems(loadedData.rows, dataSource.rows, loadedData.grandTotalRowIndex)
                        }
                    } else {
                        newRowItemIndexesToCurrent = updateHeaderItemChildren(headerItems, headerItem, dataSource.rows, loadedData.grandTotalRowIndex);
                        if (oppositeHeaderItem) {
                            newColumnItemIndexesToCurrent = updateHeaderItemChildren(oppositeHeaderItems, oppositeHeaderItem, dataSource.columns, loadedData.grandTotalColumnIndex)
                        } else {
                            newColumnItemIndexesToCurrent = updateHeaderItems(loadedData.columns, dataSource.columns, loadedData.grandTotalColumnIndex)
                        }
                    }(0, _deferred.when)(newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent).done((function(newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent) {
                        if ("row" === area && newRowItemIndexesToCurrent.length || "column" === area && newColumnItemIndexesToCurrent.length) {
                            updateDataSourceCells(loadedData, dataSource.values, newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent)
                        }
                        that._update(deferred)
                    }))
                }
            }
        },
        on: function(eventName, eventHandler) {
            this._eventsStrategy.on(eventName, eventHandler);
            return this
        },
        off: function(eventName, eventHandler) {
            this._eventsStrategy.off(eventName, eventHandler);
            return this
        },
        dispose: function() {
            var delayedLoadTask = this._delayedLoadTask;
            this._eventsStrategy.dispose();
            if (delayedLoadTask) {
                delayedLoadTask.abort()
            }
            this._isDisposed = true
        },
        isDisposed: function() {
            return !!this._isDisposed
        }
    }
}());
exports.PivotGridDataSource = PivotGridDataSource;
var _default = {
    PivotGridDataSource: PivotGridDataSource
};
exports.default = _default;
