/**
 * DevExtreme (bundles/__internal/grids/grid_core/master_detail/module.js)
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
exports.masterDetailModule = void 0;
var _size = require("../../../../core/utils/size");
var _renderer = _interopRequireDefault(require("../../../../core/renderer"));
var _common = require("../../../../core/utils/common");
var _iterator = require("../../../../core/utils/iterator");
var _type = require("../../../../core/utils/type");
var _deferred = require("../../../../core/utils/deferred");
var _module_utils = _interopRequireDefault(require("../module_utils"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var MASTER_DETAIL_CELL_CLASS = "dx-master-detail-cell";
var MASTER_DETAIL_ROW_CLASS = "dx-master-detail-row";
var CELL_FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled";
var ROW_LINES_CLASS = "dx-row-lines";
var masterDetailModule = {
    defaultOptions: function() {
        return {
            masterDetail: {
                enabled: false,
                autoExpandAll: false,
                template: null
            }
        }
    },
    extenders: {
        controllers: {
            columns: {
                _getExpandColumnsCore: function() {
                    var expandColumns = this.callBase();
                    if (this.option("masterDetail.enabled")) {
                        expandColumns.push({
                            type: "detailExpand",
                            cellTemplate: _module_utils.default.getExpandCellTemplate()
                        })
                    }
                    return expandColumns
                }
            },
            data: function() {
                var initMasterDetail = function(that) {
                    that._expandedItems = [];
                    that._isExpandAll = that.option("masterDetail.autoExpandAll")
                };
                return {
                    init: function() {
                        initMasterDetail(this);
                        this.callBase()
                    },
                    expandAll: function(groupIndex) {
                        var that = this;
                        if (groupIndex < 0) {
                            that._isExpandAll = true;
                            that._expandedItems = [];
                            that.updateItems()
                        } else {
                            that.callBase.apply(that, arguments)
                        }
                    },
                    collapseAll: function(groupIndex) {
                        var that = this;
                        if (groupIndex < 0) {
                            that._isExpandAll = false;
                            that._expandedItems = [];
                            that.updateItems()
                        } else {
                            that.callBase.apply(that, arguments)
                        }
                    },
                    isRowExpanded: function(key) {
                        var that = this;
                        var expandIndex = _module_utils.default.getIndexByKey(key, that._expandedItems);
                        if (Array.isArray(key)) {
                            return that.callBase.apply(that, arguments)
                        }
                        return !!(that._isExpandAll ^ (expandIndex >= 0 && that._expandedItems[expandIndex].visible))
                    },
                    _getRowIndicesForExpand: function(key) {
                        var rowIndex = this.getRowIndexByKey(key);
                        return [rowIndex, rowIndex + 1]
                    },
                    _changeRowExpandCore: function(key) {
                        var that = this;
                        var result;
                        if (Array.isArray(key)) {
                            result = that.callBase.apply(that, arguments)
                        } else {
                            var expandIndex = _module_utils.default.getIndexByKey(key, that._expandedItems);
                            if (expandIndex >= 0) {
                                var visible = that._expandedItems[expandIndex].visible;
                                that._expandedItems[expandIndex].visible = !visible
                            } else {
                                that._expandedItems.push({
                                    key: key,
                                    visible: true
                                })
                            }
                            that.updateItems({
                                changeType: "update",
                                rowIndices: that._getRowIndicesForExpand(key)
                            });
                            result = (new _deferred.Deferred).resolve()
                        }
                        return result
                    },
                    _processDataItem: function(data, options) {
                        var that = this;
                        var dataItem = that.callBase.apply(that, arguments);
                        dataItem.isExpanded = that.isRowExpanded(dataItem.key);
                        if (void 0 === options.detailColumnIndex) {
                            options.detailColumnIndex = -1;
                            (0, _iterator.each)(options.visibleColumns, (function(index, column) {
                                if ("expand" === column.command && !(0, _type.isDefined)(column.groupIndex)) {
                                    options.detailColumnIndex = index;
                                    return false
                                }
                                return
                            }))
                        }
                        if (options.detailColumnIndex >= 0) {
                            dataItem.values[options.detailColumnIndex] = dataItem.isExpanded
                        }
                        return dataItem
                    },
                    _processItems: function(items, change) {
                        var that = this;
                        var changeType = change.changeType;
                        var result = [];
                        items = that.callBase.apply(that, arguments);
                        if ("loadingAll" === changeType) {
                            return items
                        }
                        if ("refresh" === changeType) {
                            that._expandedItems = (0, _common.grep)(that._expandedItems, (function(item) {
                                return item.visible
                            }))
                        }(0, _iterator.each)(items, (function(index, item) {
                            result.push(item);
                            var expandIndex = _module_utils.default.getIndexByKey(item.key, that._expandedItems);
                            if ("data" === item.rowType && (item.isExpanded || expandIndex >= 0) && !item.isNewRow) {
                                result.push({
                                    visible: item.isExpanded,
                                    rowType: "detail",
                                    key: item.key,
                                    data: item.data,
                                    values: []
                                })
                            }
                        }));
                        return result
                    },
                    optionChanged: function(args) {
                        var isEnabledChanged;
                        var isAutoExpandAllChanged;
                        if ("masterDetail" === args.name) {
                            args.name = "dataSource";
                            switch (args.fullName) {
                                case "masterDetail":
                                    var value = args.value || {};
                                    var previousValue = args.previousValue || {};
                                    isEnabledChanged = value.enabled !== previousValue.enabled;
                                    isAutoExpandAllChanged = value.autoExpandAll !== previousValue.autoExpandAll;
                                    break;
                                case "masterDetail.template":
                                    initMasterDetail(this);
                                    break;
                                case "masterDetail.enabled":
                                    isEnabledChanged = true;
                                    break;
                                case "masterDetail.autoExpandAll":
                                    isAutoExpandAllChanged = true
                            }
                            if (isEnabledChanged || isAutoExpandAllChanged) {
                                initMasterDetail(this)
                            }
                        }
                        this.callBase(args)
                    }
                }
            }(),
            resizing: {
                fireContentReadyAction: function() {
                    this.callBase.apply(this, arguments);
                    this._updateParentDataGrids(this.component.$element())
                },
                _updateParentDataGrids: function($element) {
                    var _this = this;
                    var $masterDetailRow = $element.closest(".".concat(MASTER_DETAIL_ROW_CLASS));
                    if ($masterDetailRow.length) {
                        (0, _deferred.when)(this._updateMasterDataGrid($masterDetailRow, $element)).done((function() {
                            _this._updateParentDataGrids($masterDetailRow.parent())
                        }))
                    }
                },
                _updateMasterDataGrid: function($masterDetailRow, $detailElement) {
                    var masterRowOptions = (0, _renderer.default)($masterDetailRow).data("options");
                    var masterDataGrid = (0, _renderer.default)($masterDetailRow).closest(".".concat(this.getWidgetContainerClass())).parent().data("dxDataGrid");
                    if (masterRowOptions && masterDataGrid) {
                        return this._updateMasterDataGridCore(masterDataGrid, masterRowOptions)
                    }
                },
                _updateMasterDataGridCore: function(masterDataGrid, masterRowOptions) {
                    var d = (0, _deferred.Deferred)();
                    if (masterDataGrid.getView("rowsView").isFixedColumns()) {
                        this._updateFixedMasterDetailGrids(masterDataGrid, masterRowOptions.rowIndex, (0, _renderer.default)(masterRowOptions.rowElement)).done(d.resolve)
                    } else {
                        if (true === masterDataGrid.option("scrolling.useNative")) {
                            masterDataGrid.updateDimensions().done((function() {
                                return d.resolve(true)
                            }));
                            return
                        }
                        var scrollable = masterDataGrid.getScrollable();
                        if (scrollable) {
                            null === scrollable || void 0 === scrollable ? void 0 : scrollable.update().done((function() {
                                return d.resolve()
                            }))
                        } else {
                            d.resolve()
                        }
                    }
                    return d.promise()
                },
                _updateFixedMasterDetailGrids: function(masterDataGrid, masterRowIndex, $detailElement) {
                    var _this2 = this;
                    var d = (0, _deferred.Deferred)();
                    var $rows = (0, _renderer.default)(masterDataGrid.getRowElement(masterRowIndex));
                    var $tables = (0, _renderer.default)(masterDataGrid.getView("rowsView").getTableElements());
                    var rowsNotEqual = 2 === (null === $rows || void 0 === $rows ? void 0 : $rows.length) && (0, _size.getHeight)($rows.eq(0)) !== (0, _size.getHeight)($rows.eq(1));
                    var tablesNotEqual = 2 === (null === $tables || void 0 === $tables ? void 0 : $tables.length) && (0, _size.getHeight)($tables.eq(0)) !== (0, _size.getHeight)($tables.eq(1));
                    if (rowsNotEqual || tablesNotEqual) {
                        var detailElementWidth = (0, _size.getWidth)($detailElement);
                        masterDataGrid.updateDimensions().done((function() {
                            var isDetailHorizontalScrollCanBeShown = _this2.option("columnAutoWidth") && true === masterDataGrid.option("scrolling.useNative");
                            var isDetailGridWidthChanged = isDetailHorizontalScrollCanBeShown && detailElementWidth !== (0, _size.getWidth)($detailElement);
                            if (isDetailHorizontalScrollCanBeShown && isDetailGridWidthChanged) {
                                _this2.updateDimensions().done((function() {
                                    return d.resolve(true)
                                }))
                            } else {
                                d.resolve(true)
                            }
                        }));
                        return d.promise()
                    }
                    return (0, _deferred.Deferred)().resolve()
                },
                _toggleBestFitMode: function(isBestFit) {
                    this.callBase.apply(this, arguments);
                    if (this.option("masterDetail.template")) {
                        var $rowsTable = this._rowsView.getTableElement();
                        if ($rowsTable) {
                            $rowsTable.find(".dx-master-detail-cell").css("maxWidth", isBestFit ? 0 : "")
                        }
                    }
                }
            }
        },
        views: {
            rowsView: {
                _getCellTemplate: function(options) {
                    var that = this;
                    var column = options.column;
                    var editingController = that.getController("editing");
                    var isEditRow = editingController && editingController.isEditRow(options.rowIndex);
                    var template;
                    if ("detail" === column.command && !isEditRow) {
                        template = that.option("masterDetail.template") || {
                            allowRenderToDetachedContainer: false,
                            render: that._getDefaultTemplate(column)
                        }
                    } else {
                        template = that.callBase.apply(that, arguments)
                    }
                    return template
                },
                _isDetailRow: function(row) {
                    return row && row.rowType && 0 === row.rowType.indexOf("detail")
                },
                _createRow: function(row) {
                    var $row = this.callBase.apply(this, arguments);
                    if (row && this._isDetailRow(row)) {
                        this.option("showRowLines") && $row.addClass(ROW_LINES_CLASS);
                        $row.addClass(MASTER_DETAIL_ROW_CLASS);
                        if ((0, _type.isDefined)(row.visible)) {
                            $row.toggle(row.visible)
                        }
                    }
                    return $row
                },
                _renderCells: function($row, options) {
                    var row = options.row;
                    var $detailCell;
                    var visibleColumns = this._columnsController.getVisibleColumns();
                    if (row.rowType && this._isDetailRow(row)) {
                        if (this._needRenderCell(0, options.columnIndices)) {
                            $detailCell = this._renderCell($row, {
                                value: null,
                                row: row,
                                rowIndex: row.rowIndex,
                                column: {
                                    command: "detail"
                                },
                                columnIndex: 0,
                                change: options.change
                            });
                            $detailCell.addClass(CELL_FOCUS_DISABLED_CLASS).addClass(MASTER_DETAIL_CELL_CLASS).attr("colSpan", visibleColumns.length)
                        }
                    } else {
                        this.callBase.apply(this, arguments)
                    }
                }
            }
        }
    }
};
exports.masterDetailModule = masterDetailModule;