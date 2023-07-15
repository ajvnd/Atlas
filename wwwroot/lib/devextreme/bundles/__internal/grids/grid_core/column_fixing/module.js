/**
 * DevExtreme (bundles/__internal/grids/grid_core/column_fixing/module.js)
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
exports.columnFixingModule = void 0;
var _size = require("../../../../core/utils/size");
var _renderer = _interopRequireDefault(require("../../../../core/renderer"));
var _events_engine = _interopRequireDefault(require("../../../../events/core/events_engine"));
var _wheel = require("../../../../events/core/wheel");
var _message = _interopRequireDefault(require("../../../../localization/message"));
var _type = require("../../../../core/utils/type");
var _extend = require("../../../../core/utils/extend");
var _iterator = require("../../../../core/utils/iterator");
var _browser = _interopRequireDefault(require("../../../../core/utils/browser"));
var _position = require("../../../../core/utils/position");
var _translator = require("../../../../animation/translator");
var _ui = _interopRequireDefault(require("../../../../ui/scroll_view/ui.scrollable"));
var _module_utils = _interopRequireDefault(require("../module_utils"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var CONTENT_CLASS = "content";
var CONTENT_FIXED_CLASS = "content-fixed";
var MASTER_DETAIL_CELL_CLASS = "dx-master-detail-cell";
var FIRST_CELL_CLASS = "dx-first-cell";
var LAST_CELL_CLASS = "dx-last-cell";
var HOVER_STATE_CLASS = "dx-state-hover";
var FIXED_COL_CLASS = "dx-col-fixed";
var FIXED_COLUMNS_CLASS = "dx-fixed-columns";
var POINTER_EVENTS_NONE_CLASS = "dx-pointer-events-none";
var COMMAND_TRANSPARENT = "transparent";
var GROUP_ROW_CLASS = "dx-group-row";
var DETAIL_ROW_CLASS = "dx-master-detail-row";
var getTransparentColumnIndex = function(fixedColumns) {
    var transparentColumnIndex = -1;
    (0, _iterator.each)(fixedColumns, (function(index, column) {
        if (column.command === COMMAND_TRANSPARENT) {
            transparentColumnIndex = index;
            return false
        }
        return
    }));
    return transparentColumnIndex
};
var normalizeColumnWidths = function(fixedColumns, widths, fixedWidths) {
    var fixedColumnIndex = 0;
    if (fixedColumns && widths && fixedWidths) {
        for (var i = 0; i < fixedColumns.length; i++) {
            if (fixedColumns[i].command === COMMAND_TRANSPARENT) {
                fixedColumnIndex += fixedColumns[i].colspan
            } else {
                if (widths[fixedColumnIndex] < fixedWidths[i]) {
                    widths[fixedColumnIndex] = fixedWidths[i]
                }
                fixedColumnIndex++
            }
        }
    }
    return widths
};
var baseFixedColumns = {
    init: function() {
        this.callBase();
        this._isFixedTableRendering = false;
        this._isFixedColumns = false
    },
    _createCol: function(column) {
        return this.callBase(column).toggleClass(FIXED_COL_CLASS, !!(this._isFixedTableRendering && (column.fixed || column.command && column.command !== COMMAND_TRANSPARENT)))
    },
    _correctColumnIndicesForFixedColumns: function(fixedColumns, change) {
        var transparentColumnIndex = getTransparentColumnIndex(fixedColumns);
        var transparentColspan = fixedColumns[transparentColumnIndex].colspan;
        var columnIndices = change && change.columnIndices;
        if (columnIndices) {
            change.columnIndices = columnIndices.map((function(columnIndices) {
                if (columnIndices) {
                    return columnIndices.map((function(columnIndex) {
                        if (columnIndex < transparentColumnIndex) {
                            return columnIndex
                        }
                        if (columnIndex >= transparentColumnIndex + transparentColspan) {
                            return columnIndex - transparentColspan + 1
                        }
                        return -1
                    })).filter((function(columnIndex) {
                        return columnIndex >= 0
                    }))
                }
            }))
        }
    },
    _partialUpdateFixedTable: function(fixedColumns) {
        var fixedTableElement = this._fixedTableElement;
        var $rows = this._getRowElementsCore(fixedTableElement);
        var $colgroup = fixedTableElement.children("colgroup");
        $colgroup.replaceWith(this._createColGroup(fixedColumns));
        for (var i = 0; i < $rows.length; i++) {
            this._partialUpdateFixedRow((0, _renderer.default)($rows[i]), fixedColumns)
        }
    },
    _partialUpdateFixedRow: function($row, fixedColumns) {
        var _a;
        var cellElements = $row.get(0).childNodes;
        var transparentColumnIndex = getTransparentColumnIndex(fixedColumns);
        var transparentColumn = fixedColumns[transparentColumnIndex];
        var columnIndexOffset = this._columnsController.getColumnIndexOffset();
        var groupCellOptions;
        var colIndex = columnIndexOffset + 1;
        var colspan = transparentColumn.colspan;
        if ($row.hasClass(DETAIL_ROW_CLASS)) {
            cellElements[0].setAttribute("colspan", null === (_a = this._columnsController.getVisibleColumns()) || void 0 === _a ? void 0 : _a.length);
            return
        }
        if ($row.hasClass(GROUP_ROW_CLASS)) {
            groupCellOptions = this._getGroupCellOptions({
                row: $row.data("options"),
                columns: this._columnsController.getVisibleColumns()
            });
            colspan = groupCellOptions.colspan - Math.max(0, cellElements.length - (groupCellOptions.columnIndex + 2))
        }
        for (var j = 0; j < cellElements.length; j++) {
            var needUpdateColspan = groupCellOptions ? j === groupCellOptions.columnIndex + 1 : j === transparentColumnIndex;
            cellElements[j].setAttribute("aria-colindex", colIndex);
            if (needUpdateColspan) {
                cellElements[j].setAttribute("colspan", colspan);
                colIndex += colspan
            } else {
                colIndex++
            }
        }
    },
    _renderTable: function(options) {
        var $fixedTable;
        var fixedColumns = this.getFixedColumns();
        this._isFixedColumns = !!fixedColumns.length;
        var $table = this.callBase(options);
        if (this._isFixedColumns) {
            var change = null === options || void 0 === options ? void 0 : options.change;
            this._isFixedTableRendering = true;
            if ((null === change || void 0 === change ? void 0 : change.virtualColumnsScrolling) && true !== this.option("scrolling.legacyMode")) {
                this._partialUpdateFixedTable(fixedColumns);
                this._isFixedTableRendering = false
            } else {
                var columnIndices = null === change || void 0 === change ? void 0 : change.columnIndices;
                this._correctColumnIndicesForFixedColumns(fixedColumns, change);
                $fixedTable = this._createTable(fixedColumns);
                this._renderRows($fixedTable, (0, _extend.extend)({}, options, {
                    columns: fixedColumns
                }));
                this._updateContent($fixedTable, change, true);
                if (columnIndices) {
                    change.columnIndices = columnIndices
                }
                this._isFixedTableRendering = false
            }
        } else {
            this._fixedTableElement && this._fixedTableElement.parent().remove();
            this._fixedTableElement = null
        }
        return $table
    },
    _renderRow: function($table, options) {
        var fixedCorrection;
        var cells = options.row.cells;
        this.callBase.apply(this, arguments);
        if (this._isFixedTableRendering && cells && cells.length) {
            fixedCorrection = 0;
            var fixedCells = options.row.cells || [];
            cells = cells.slice();
            options.row.cells = cells;
            for (var i = 0; i < fixedCells.length; i++) {
                if (fixedCells[i].column && fixedCells[i].column.command === COMMAND_TRANSPARENT) {
                    fixedCorrection = (fixedCells[i].column.colspan || 1) - 1;
                    continue
                }
                cells[i + fixedCorrection] = fixedCells[i]
            }
        }
    },
    _createCell: function(options) {
        var that = this;
        var column = options.column;
        var columnCommand = column && column.command;
        var rowType = options.rowType;
        var $cell = that.callBase.apply(that, arguments);
        var fixedColumns;
        var prevFixedColumn;
        var transparentColumnIndex;
        if (that._isFixedTableRendering || "filter" === rowType) {
            fixedColumns = that.getFixedColumns();
            transparentColumnIndex = getTransparentColumnIndex(fixedColumns);
            prevFixedColumn = fixedColumns[transparentColumnIndex - 1]
        }
        if (that._isFixedTableRendering) {
            if (columnCommand === COMMAND_TRANSPARENT) {
                $cell.addClass(POINTER_EVENTS_NONE_CLASS).toggleClass(FIRST_CELL_CLASS, 0 === transparentColumnIndex || prevFixedColumn && "expand" === prevFixedColumn.command).toggleClass(LAST_CELL_CLASS, fixedColumns.length && transparentColumnIndex === fixedColumns.length - 1);
                if ("freeSpace" !== rowType) {
                    _module_utils.default.setEmptyText($cell)
                }
            }
        } else if ("filter" === rowType) {
            $cell.toggleClass(FIRST_CELL_CLASS, options.columnIndex === transparentColumnIndex)
        }
        var isRowAltStyle = that.option("rowAlternationEnabled") && options.isAltRow;
        var isSelectAllCell = "multiple" === that.option("selection.mode") && 0 === options.columnIndex && "header" === options.rowType;
        if (_browser.default.mozilla && options.column.fixed && "group" !== options.rowType && !isRowAltStyle && !isSelectAllCell) {
            $cell.addClass(FIXED_COL_CLASS)
        }
        return $cell
    },
    _getContent: function(isFixedTableRendering) {
        var _a;
        return isFixedTableRendering ? null === (_a = this._fixedTableElement) || void 0 === _a ? void 0 : _a.parent() : this.callBase.apply(this, arguments)
    },
    _wrapTableInScrollContainer: function($table, isFixedTableRendering) {
        var $scrollContainer = this.callBase.apply(this, arguments);
        if (this._isFixedTableRendering || isFixedTableRendering) {
            $scrollContainer.addClass(this.addWidgetPrefix(CONTENT_FIXED_CLASS))
        }
        return $scrollContainer
    },
    _renderCellContent: function($cell, options) {
        var isEmptyCell;
        var column = options.column;
        var isFixedTableRendering = this._isFixedTableRendering;
        var isGroupCell = "group" === options.rowType && (0, _type.isDefined)(column.groupIndex);
        if (isFixedTableRendering && isGroupCell && !column.command && !column.groupCellTemplate) {
            $cell.css("pointerEvents", "none")
        }
        if (!isFixedTableRendering && this._isFixedColumns) {
            isEmptyCell = column.fixed || column.command && false !== column.fixed;
            if (isGroupCell) {
                isEmptyCell = false;
                if (options.row.summaryCells && options.row.summaryCells.length) {
                    var columns = this._columnsController.getVisibleColumns();
                    var alignByFixedColumnCellCount = this._getAlignByColumnCellCount ? this._getAlignByColumnCellCount(column.colspan, {
                        columns: columns,
                        row: options.row,
                        isFixed: true
                    }) : 0;
                    if (alignByFixedColumnCellCount > 0) {
                        var transparentColumnIndex = getTransparentColumnIndex(this._columnsController.getFixedColumns());
                        isEmptyCell = columns.length - alignByFixedColumnCellCount < transparentColumnIndex
                    }
                }
            }
            if (isEmptyCell) {
                if (column.command && "buttons" !== column.type || "group" === options.rowType) {
                    $cell.html("&nbsp;").addClass(column.cssClass);
                    return
                }
                $cell.addClass("dx-hidden-cell")
            }
        }
        if (column.command !== COMMAND_TRANSPARENT) {
            this.callBase.apply(this, arguments)
        }
    },
    _getCellElementsCore: function(rowIndex) {
        var _this = this;
        var cellElements = this.callBase.apply(this, arguments);
        var isGroupRow = cellElements.parent().hasClass(GROUP_ROW_CLASS);
        var headerRowIndex = "columnHeadersView" === this.name ? rowIndex : void 0;
        if (this._fixedTableElement && cellElements) {
            var fixedColumns = this.getFixedColumns(headerRowIndex);
            var fixedCellElements = this._getRowElements(this._fixedTableElement).eq(rowIndex).children("td");
            (0, _iterator.each)(fixedCellElements, (function(columnIndex, cell) {
                if (isGroupRow) {
                    if (cellElements[columnIndex] && "hidden" !== cell.style.visibility) {
                        cellElements[columnIndex] = cell
                    }
                } else {
                    var fixedColumn = fixedColumns[columnIndex];
                    if (fixedColumn) {
                        if (fixedColumn.command === COMMAND_TRANSPARENT) {
                            if (fixedCellElements.eq(columnIndex).hasClass(MASTER_DETAIL_CELL_CLASS)) {
                                cellElements[columnIndex] = cell || cellElements[columnIndex]
                            }
                        } else {
                            var fixedColumnIndex = _this._columnsController.getVisibleIndexByColumn(fixedColumn, headerRowIndex);
                            cellElements[fixedColumnIndex] = cell || cellElements[fixedColumnIndex]
                        }
                    }
                }
            }))
        }
        return cellElements
    },
    getColumnWidths: function() {
        var result = this.callBase();
        var fixedColumns = this.getFixedColumns();
        var fixedWidths = this._fixedTableElement && result.length ? this.callBase(this._fixedTableElement) : void 0;
        return normalizeColumnWidths(fixedColumns, result, fixedWidths)
    },
    getTableElement: function(isFixedTableRendering) {
        isFixedTableRendering = this._isFixedTableRendering || isFixedTableRendering;
        var tableElement = isFixedTableRendering ? this._fixedTableElement : this.callBase();
        return tableElement
    },
    setTableElement: function(tableElement, isFixedTableRendering) {
        if (this._isFixedTableRendering || isFixedTableRendering) {
            this._fixedTableElement = tableElement.addClass(POINTER_EVENTS_NONE_CLASS)
        } else {
            this.callBase(tableElement)
        }
    },
    getColumns: function(rowIndex, $tableElement) {
        $tableElement = $tableElement || this.getTableElement();
        if (this._isFixedTableRendering || $tableElement && $tableElement.closest("table").parent(".".concat(this.addWidgetPrefix(CONTENT_FIXED_CLASS))).length) {
            return this.getFixedColumns(rowIndex)
        }
        return this.callBase(rowIndex, $tableElement)
    },
    getRowIndex: function($row) {
        var $fixedTable = this._fixedTableElement;
        if ($fixedTable && $fixedTable.find($row).length) {
            return this._getRowElements($fixedTable).index($row)
        }
        return this.callBase($row)
    },
    getTableElements: function() {
        var result = this.callBase.apply(this, arguments);
        if (this._fixedTableElement) {
            result = (0, _renderer.default)([result.get(0), this._fixedTableElement.get(0)])
        }
        return result
    },
    getFixedColumns: function(rowIndex) {
        return this._columnsController.getFixedColumns(rowIndex)
    },
    getFixedColumnsOffset: function() {
        var offset = {
            left: 0,
            right: 0
        };
        var $transparentColumn;
        if (this._fixedTableElement) {
            $transparentColumn = this.getTransparentColumnElement();
            var positionTransparentColumn = $transparentColumn.position();
            offset = {
                left: positionTransparentColumn.left,
                right: (0, _size.getOuterWidth)(this.element(), true) - ((0, _size.getOuterWidth)($transparentColumn, true) + positionTransparentColumn.left)
            }
        }
        return offset
    },
    getTransparentColumnElement: function() {
        return this._fixedTableElement && this._fixedTableElement.find(".".concat(POINTER_EVENTS_NONE_CLASS)).first()
    },
    getFixedTableElement: function() {
        return this._fixedTableElement
    },
    isFixedColumns: function() {
        return this._isFixedColumns
    },
    _resizeCore: function() {
        this.callBase();
        this.synchronizeRows()
    },
    setColumnWidths: function(options) {
        var columns;
        var visibleColumns = this._columnsController.getVisibleColumns();
        var widths = options.widths;
        var isWidthsSynchronized = widths && widths.length && (0, _type.isDefined)(visibleColumns[0].visibleWidth);
        var optionNames = options.optionNames;
        var isColumnWidthChanged = optionNames && optionNames.width;
        var useVisibleColumns = false;
        this.callBase.apply(this, arguments);
        if (this._fixedTableElement) {
            var hasAutoWidth = widths && widths.some((function(width) {
                return "auto" === width
            }));
            useVisibleColumns = hasAutoWidth && (!isWidthsSynchronized || !this.isScrollbarVisible(true));
            if (useVisibleColumns) {
                columns = visibleColumns
            }
            this.callBase((0, _extend.extend)({}, options, {
                $tableElement: this._fixedTableElement,
                columns: columns,
                fixed: true
            }))
        }
        if (isWidthsSynchronized || isColumnWidthChanged && this.option("wordWrapEnabled")) {
            this.synchronizeRows()
        }
    },
    _createColGroup: function(columns) {
        if (this._isFixedTableRendering && !this.option("columnAutoWidth")) {
            var visibleColumns = this._columnsController.getVisibleColumns();
            var useVisibleColumns = visibleColumns.filter((function(column) {
                return !column.width
            })).length;
            if (useVisibleColumns) {
                columns = visibleColumns
            }
        }
        return this.callBase(columns)
    },
    _getClientHeight: function(element) {
        var boundingClientRectElement = element.getBoundingClientRect && (0, _position.getBoundingRect)(element);
        return boundingClientRectElement && boundingClientRectElement.height ? boundingClientRectElement.height : element.clientHeight
    },
    synchronizeRows: function() {
        var _this2 = this;
        var rowHeights = [];
        var fixedRowHeights = [];
        var rowIndex;
        var $rowElements;
        var $fixedRowElements;
        var $contentElement;
        this.waitAsyncTemplates(true).done((function() {
            if (_this2._isFixedColumns && _this2._tableElement && _this2._fixedTableElement) {
                var heightTable = _this2._getClientHeight(_this2._tableElement.get(0));
                var heightFixedTable = _this2._getClientHeight(_this2._fixedTableElement.get(0));
                $rowElements = _this2._getRowElements(_this2._tableElement);
                $fixedRowElements = _this2._getRowElements(_this2._fixedTableElement);
                $contentElement = _this2._findContentElement();
                if (heightTable !== heightFixedTable) {
                    $contentElement && $contentElement.css("height", heightTable);
                    $rowElements.css("height", "");
                    $fixedRowElements.css("height", "");
                    for (rowIndex = 0; rowIndex < $rowElements.length; rowIndex++) {
                        rowHeights.push(_this2._getClientHeight($rowElements.get(rowIndex)));
                        fixedRowHeights.push(_this2._getClientHeight($fixedRowElements.get(rowIndex)))
                    }
                    for (rowIndex = 0; rowIndex < $rowElements.length; rowIndex++) {
                        var rowHeight = rowHeights[rowIndex];
                        var fixedRowHeight = fixedRowHeights[rowIndex];
                        if (rowHeight > fixedRowHeight) {
                            $fixedRowElements.eq(rowIndex).css("height", rowHeight)
                        } else if (rowHeight < fixedRowHeight) {
                            $rowElements.eq(rowIndex).css("height", fixedRowHeight)
                        }
                    }
                    $contentElement && $contentElement.css("height", "")
                }
            }
        }))
    },
    setScrollerSpacing: function(width) {
        var rtlEnabled = this.option("rtlEnabled");
        this.callBase(width);
        this.element().children(".".concat(this.addWidgetPrefix(CONTENT_FIXED_CLASS))).css({
            paddingLeft: rtlEnabled ? width : "",
            paddingRight: !rtlEnabled ? width : ""
        })
    }
};
var ColumnHeadersViewFixedColumnsExtender = (0, _extend.extend)({}, baseFixedColumns, {
    _getRowVisibleColumns: function(rowIndex) {
        if (this._isFixedTableRendering) {
            return this.getFixedColumns(rowIndex)
        }
        return this.callBase(rowIndex)
    },
    getContextMenuItems: function(options) {
        var _this3 = this;
        var column = options.column;
        var columnFixingOptions = this.option("columnFixing");
        var items = this.callBase(options);
        if (options.row && "header" === options.row.rowType) {
            if (true === columnFixingOptions.enabled && column && column.allowFixing) {
                var onItemClick = function(params) {
                    switch (params.itemData.value) {
                        case "none":
                            _this3._columnsController.columnOption(column.index, "fixed", false);
                            break;
                        case "left":
                            _this3._columnsController.columnOption(column.index, {
                                fixed: true,
                                fixedPosition: "left"
                            });
                            break;
                        case "right":
                            _this3._columnsController.columnOption(column.index, {
                                fixed: true,
                                fixedPosition: "right"
                            })
                    }
                };
                items = items || [];
                items.push({
                    text: columnFixingOptions.texts.fix,
                    beginGroup: true,
                    items: [{
                        text: columnFixingOptions.texts.leftPosition,
                        value: "left",
                        disabled: column.fixed && (!column.fixedPosition || "left" === column.fixedPosition),
                        onItemClick: onItemClick
                    }, {
                        text: columnFixingOptions.texts.rightPosition,
                        value: "right",
                        disabled: column.fixed && "right" === column.fixedPosition,
                        onItemClick: onItemClick
                    }]
                }, {
                    text: columnFixingOptions.texts.unfix,
                    value: "none",
                    disabled: !column.fixed,
                    onItemClick: onItemClick
                })
            }
        }
        return items
    },
    getFixedColumnElements: function(rowIndex) {
        if ((0, _type.isDefined)(rowIndex)) {
            return this._fixedTableElement && this._getRowElements(this._fixedTableElement).eq(rowIndex).children()
        }
        var columnElements = this.getColumnElements();
        var $transparentColumnElement = this.getTransparentColumnElement();
        if (columnElements && $transparentColumnElement && $transparentColumnElement.length) {
            var transparentColumnIndex = getTransparentColumnIndex(this.getFixedColumns());
            columnElements.splice(transparentColumnIndex, $transparentColumnElement.get(0).colSpan, $transparentColumnElement.get(0))
        }
        return columnElements
    },
    getColumnWidths: function() {
        var fixedWidths;
        var result = this.callBase();
        var $fixedColumnElements = this.getFixedColumnElements();
        var fixedColumns = this.getFixedColumns();
        if (this._fixedTableElement) {
            if ($fixedColumnElements && $fixedColumnElements.length) {
                fixedWidths = this._getWidths($fixedColumnElements)
            } else {
                fixedWidths = this.callBase(this._fixedTableElement)
            }
        }
        return normalizeColumnWidths(fixedColumns, result, fixedWidths)
    }
});
var RowsViewFixedColumnsExtender = (0, _extend.extend)({}, baseFixedColumns, {
    _detachHoverEvents: function() {
        this._fixedTableElement && _events_engine.default.off(this._fixedTableElement, "mouseover mouseout", ".dx-data-row");
        this._tableElement && _events_engine.default.off(this._tableElement, "mouseover mouseout", ".dx-data-row")
    },
    _attachHoverEvents: function() {
        var that = this;
        var attachHoverEvent = function($table) {
            _events_engine.default.on($table, "mouseover mouseout", ".dx-data-row", that.createAction((function(args) {
                var event = args.event;
                var rowIndex = that.getRowIndex((0, _renderer.default)(event.target).closest(".dx-row"));
                var isHover = "mouseover" === event.type;
                if (rowIndex >= 0) {
                    that._tableElement && that._getRowElements(that._tableElement).eq(rowIndex).toggleClass(HOVER_STATE_CLASS, isHover);
                    that._fixedTableElement && that._getRowElements(that._fixedTableElement).eq(rowIndex).toggleClass(HOVER_STATE_CLASS, isHover)
                }
            })))
        };
        if (that._fixedTableElement && that._tableElement) {
            attachHoverEvent(that._fixedTableElement);
            attachHoverEvent(that._tableElement)
        }
    },
    _getScrollDelay: function() {
        var _a;
        var hasResizeTimeout = null === (_a = this.getController("resizing")) || void 0 === _a ? void 0 : _a.hasResizeTimeout();
        if (hasResizeTimeout) {
            return this.option("scrolling.updateTimeout")
        }
        return _browser.default.mozilla ? 60 : 0
    },
    _findContentElement: function(isFixedTableRendering) {
        var _this4 = this;
        var $content;
        var scrollTop;
        var contentClass = this.addWidgetPrefix(CONTENT_CLASS);
        var element = this.element();
        isFixedTableRendering = this._isFixedTableRendering || isFixedTableRendering;
        if (element && isFixedTableRendering) {
            $content = element.children(".".concat(contentClass));
            var scrollable = this.getScrollable();
            if (!$content.length && scrollable) {
                $content = (0, _renderer.default)("<div>").addClass(contentClass);
                _events_engine.default.on($content, "scroll", (function(e) {
                    var target = e.target;
                    var scrollDelay = _this4._getScrollDelay();
                    clearTimeout(_this4._fixedScrollTimeout);
                    _this4._fixedScrollTimeout = setTimeout((function() {
                        scrollTop = (0, _renderer.default)(target).scrollTop();
                        scrollable.scrollTo({
                            y: scrollTop
                        })
                    }), scrollDelay)
                }));
                _events_engine.default.on($content, _wheel.name, (function(e) {
                    var $nearestScrollable = (0, _renderer.default)(e.target).closest(".dx-scrollable");
                    var shouldScroll = false;
                    if (scrollable && scrollable.$element().is($nearestScrollable)) {
                        shouldScroll = true
                    } else {
                        var nearestScrollableInstance = $nearestScrollable.length && _ui.default.getInstance($nearestScrollable.get(0));
                        var nearestScrollableHasVerticalScrollbar = nearestScrollableInstance && nearestScrollableInstance.scrollHeight() - nearestScrollableInstance.clientHeight() > 0;
                        shouldScroll = nearestScrollableInstance && !nearestScrollableHasVerticalScrollbar
                    }
                    if (shouldScroll) {
                        scrollTop = scrollable.scrollTop();
                        scrollable.scrollTo({
                            y: scrollTop - e.delta
                        });
                        var scrollableTop = scrollable.scrollTop() + scrollable.clientHeight();
                        var scrollableHeight = scrollable.scrollHeight() + _this4.getScrollbarWidth();
                        var isPreventDefault = scrollable.scrollTop() > 0 && scrollableTop < scrollableHeight;
                        if (isPreventDefault) {
                            return false
                        }
                    }
                    return
                }));
                $content.appendTo(element)
            }
            return $content
        }
        return this.callBase()
    },
    _updateScrollable: function() {
        this.callBase();
        var scrollable = this.getScrollable();
        if (null === scrollable || void 0 === scrollable ? void 0 : scrollable._disposed) {
            return
        }
        var scrollTop = scrollable && scrollable.scrollOffset().top;
        this._updateFixedTablePosition(scrollTop)
    },
    _renderContent: function(contentElement, tableElement, isFixedTableRendering) {
        if (this._isFixedTableRendering || isFixedTableRendering) {
            return contentElement.empty().addClass("".concat(this.addWidgetPrefix(CONTENT_CLASS), " ").concat(this.addWidgetPrefix(CONTENT_FIXED_CLASS))).append(tableElement)
        }
        return this.callBase(contentElement, tableElement)
    },
    _getGroupCellOptions: function(options) {
        if (this._isFixedTableRendering) {
            return this.callBase((0, _extend.extend)({}, options, {
                columns: this._columnsController.getVisibleColumns()
            }))
        }
        return this.callBase(options)
    },
    _renderGroupedCells: function($row, options) {
        return this.callBase($row, (0, _extend.extend)({}, options, {
            columns: this._columnsController.getVisibleColumns()
        }))
    },
    _renderGroupSummaryCells: function($row, options) {
        if (this._isFixedTableRendering) {
            this.callBase($row, (0, _extend.extend)({}, options, {
                columns: this._columnsController.getVisibleColumns()
            }))
        } else {
            this.callBase($row, options)
        }
    },
    _hasAlignByColumnSummaryItems: function(columnIndex, options) {
        var result = this.callBase.apply(this, arguments);
        var column = options.columns[columnIndex];
        if (options.isFixed) {
            return column.fixed && (result || "right" === column.fixedPosition)
        }
        return result && (!this._isFixedColumns || !column.fixed)
    },
    _renderGroupSummaryCellsCore: function($groupCell, options, groupCellColSpan, alignByColumnCellCount) {
        var alignByFixedColumnCellCount;
        if (this._isFixedTableRendering) {
            options.isFixed = true;
            alignByFixedColumnCellCount = this._getAlignByColumnCellCount(groupCellColSpan, options);
            options.isFixed = false;
            var startColumnIndex = options.columns.length - alignByFixedColumnCellCount;
            options = (0, _extend.extend)({}, options, {
                columns: this.getFixedColumns()
            });
            var transparentColumnIndex = getTransparentColumnIndex(options.columns);
            if (startColumnIndex < transparentColumnIndex) {
                alignByFixedColumnCellCount -= options.columns[transparentColumnIndex].colspan - 1 || 0;
                groupCellColSpan -= options.columns[transparentColumnIndex].colspan - 1 || 0
            } else if (alignByColumnCellCount > 0) {
                $groupCell.css("visibility", "hidden")
            }
            alignByColumnCellCount = alignByFixedColumnCellCount
        }
        this.callBase($groupCell, options, groupCellColSpan, alignByColumnCellCount)
    },
    _getSummaryCellIndex: function(columnIndex, columns) {
        if (this._isFixedTableRendering) {
            var transparentColumnIndex = getTransparentColumnIndex(columns);
            if (columnIndex > transparentColumnIndex) {
                columnIndex += columns[transparentColumnIndex].colspan - 1
            }
            return columnIndex
        }
        return this.callBase.apply(this, arguments)
    },
    _renderCore: function(change) {
        var _this5 = this;
        this._detachHoverEvents();
        var deferred = this.callBase(change);
        var isFixedColumns = this._isFixedColumns;
        this.element().toggleClass(FIXED_COLUMNS_CLASS, isFixedColumns);
        if (this.option("hoverStateEnabled") && isFixedColumns) {
            deferred.done((function() {
                _this5._attachHoverEvents()
            }))
        }
        return deferred
    },
    setRowsOpacity: function(columnIndex, value) {
        this.callBase(columnIndex, value);
        var $rows = this._getRowElements(this._fixedTableElement);
        this._setRowsOpacityCore($rows, this.getFixedColumns(), columnIndex, value)
    },
    optionChanged: function(args) {
        this.callBase(args);
        if ("hoverStateEnabled" === args.name && this._isFixedColumns) {
            args.value ? this._attachHoverEvents() : this._detachHoverEvents()
        }
    },
    getCellIndex: function($cell) {
        var $fixedTable = this._fixedTableElement;
        var cellIndex = 0;
        if ($fixedTable && $cell.is("td") && $cell.closest($fixedTable).length) {
            var columns = this.getFixedColumns();
            (0, _iterator.each)(columns, (function(index, column) {
                if (index === $cell[0].cellIndex) {
                    return false
                }
                if (column.colspan) {
                    cellIndex += column.colspan;
                    return
                }
                cellIndex++;
                return
            }));
            return cellIndex
        }
        return this.callBase.apply(this, arguments)
    },
    _updateFixedTablePosition: function(scrollTop, needFocus) {
        if (this._fixedTableElement && this._tableElement) {
            var $focusedElement;
            var editorFactory = this.getController("editorFactory");
            this._fixedTableElement.parent().scrollTop(scrollTop);
            if (needFocus && editorFactory) {
                $focusedElement = editorFactory.focus();
                $focusedElement && editorFactory.focus($focusedElement)
            }
        }
    },
    setScrollerSpacing: function(vWidth, hWidth) {
        var styles = {
            marginBottom: 0
        };
        var $fixedContent = this.element().children(".".concat(this.addWidgetPrefix(CONTENT_FIXED_CLASS)));
        if ($fixedContent.length && this._fixedTableElement) {
            $fixedContent.css(styles);
            this._fixedTableElement.css(styles);
            styles[this.option("rtlEnabled") ? "marginLeft" : "marginRight"] = vWidth;
            styles.marginBottom = hWidth;
            var useNativeScrolling = this._scrollable && this._scrollable.option("useNative");
            (useNativeScrolling ? $fixedContent : this._fixedTableElement).css(styles)
        }
    },
    _getElasticScrollTop: function(e) {
        var elasticScrollTop = 0;
        if (e.scrollOffset.top < 0) {
            elasticScrollTop = -e.scrollOffset.top
        } else if (e.reachedBottom) {
            var $scrollableContent = (0, _renderer.default)(e.component.content());
            var $scrollableContainer = (0, _renderer.default)(e.component.container());
            var maxScrollTop = Math.max($scrollableContent.get(0).clientHeight - $scrollableContainer.get(0).clientHeight, 0);
            elasticScrollTop = Math.min(maxScrollTop - e.scrollOffset.top, 0)
        }
        return Math.floor(elasticScrollTop)
    },
    _applyElasticScrolling: function(e) {
        if (this._fixedTableElement) {
            var elasticScrollTop = this._getElasticScrollTop(e);
            if (0 !== Math.ceil(elasticScrollTop)) {
                (0, _translator.move)(this._fixedTableElement, {
                    top: elasticScrollTop
                })
            } else {
                this._fixedTableElement.css("transform", "")
            }
        }
    },
    _handleScroll: function(e) {
        this._updateFixedTablePosition(e.scrollOffset.top, true);
        this._applyElasticScrolling(e);
        this.callBase(e)
    },
    _updateContentPosition: function(isRender) {
        this.callBase.apply(this, arguments);
        if (!isRender) {
            this._updateFixedTablePosition(this._scrollTop)
        }
    },
    _afterRowPrepared: function(e) {
        if (this._isFixedTableRendering) {
            return
        }
        this.callBase(e)
    },
    _scrollToElement: function($element) {
        this.callBase($element, this.getFixedColumnsOffset())
    },
    dispose: function() {
        this.callBase.apply(this, arguments);
        clearTimeout(this._fixedScrollTimeout)
    }
});
var FooterViewFixedColumnsExtender = baseFixedColumns;
var columnFixingModule = {
    defaultOptions: function() {
        return {
            columnFixing: {
                enabled: false,
                texts: {
                    fix: _message.default.format("dxDataGrid-columnFixingFix"),
                    unfix: _message.default.format("dxDataGrid-columnFixingUnfix"),
                    leftPosition: _message.default.format("dxDataGrid-columnFixingLeftPosition"),
                    rightPosition: _message.default.format("dxDataGrid-columnFixingRightPosition")
                }
            }
        }
    },
    extenders: {
        views: {
            columnHeadersView: ColumnHeadersViewFixedColumnsExtender,
            rowsView: RowsViewFixedColumnsExtender,
            footerView: FooterViewFixedColumnsExtender
        },
        controllers: {
            draggingHeader: {
                _generatePointsByColumns: function(options) {
                    var visibleColumns = options.columns;
                    var targetDraggingPanel = options.targetDraggingPanel;
                    if (targetDraggingPanel && "headers" === targetDraggingPanel.getName() && targetDraggingPanel.isFixedColumns()) {
                        if (options.sourceColumn.fixed) {
                            if (!options.rowIndex) {
                                options.columnElements = targetDraggingPanel.getFixedColumnElements(0)
                            }
                            options.columns = targetDraggingPanel.getFixedColumns(options.rowIndex);
                            var pointsByColumns = this.callBase(options);
                            ! function(columns, fixedColumns, pointsByColumns) {
                                var transparentColumnIndex = getTransparentColumnIndex(fixedColumns);
                                var correctIndex = columns.length - fixedColumns.length;
                                (0, _iterator.each)(pointsByColumns, (function(_, point) {
                                    if (point.index > transparentColumnIndex) {
                                        point.columnIndex += correctIndex;
                                        point.index += correctIndex
                                    }
                                }));
                                return pointsByColumns
                            }(visibleColumns, options.columns, pointsByColumns);
                            return pointsByColumns
                        }
                    }
                    return this.callBase(options)
                },
                _pointCreated: function(point, columns, location, sourceColumn) {
                    var result = this.callBase.apply(this, arguments);
                    var targetColumn = columns[point.columnIndex];
                    var $transparentColumn = this._columnHeadersView.getTransparentColumnElement();
                    if (!result && "headers" === location && $transparentColumn && $transparentColumn.length) {
                        var boundingRect = (0, _position.getBoundingRect)($transparentColumn.get(0));
                        if (sourceColumn && sourceColumn.fixed) {
                            return "right" === sourceColumn.fixedPosition ? point.x < boundingRect.right : point.x > boundingRect.left
                        }
                        if (targetColumn && targetColumn.fixed && "right" !== targetColumn.fixedPosition) {
                            return true
                        }
                        return point.x < boundingRect.left || point.x > boundingRect.right
                    }
                    return result
                }
            },
            columnsResizer: {
                _generatePointsByColumns: function() {
                    var that = this;
                    var columnsController = that._columnsController;
                    var columns = columnsController && that._columnsController.getVisibleColumns();
                    var fixedColumns = columnsController && that._columnsController.getFixedColumns();
                    var transparentColumnIndex = getTransparentColumnIndex(fixedColumns);
                    var correctIndex = columns.length - fixedColumns.length;
                    var cells = that._columnHeadersView.getFixedColumnElements();
                    that.callBase();
                    if (cells && cells.length > 0) {
                        that._pointsByFixedColumns = _module_utils.default.getPointsByColumns(cells, (function(point) {
                            if (point.index > transparentColumnIndex) {
                                point.columnIndex += correctIndex;
                                point.index += correctIndex
                            }
                            return that._pointCreated(point, columns.length, columns)
                        }))
                    }
                },
                _getTargetPoint: function(pointsByColumns, currentX, deltaX) {
                    var $transparentColumn = this._columnHeadersView.getTransparentColumnElement();
                    if ($transparentColumn && $transparentColumn.length) {
                        var boundingRect = (0, _position.getBoundingRect)($transparentColumn.get(0));
                        if (currentX <= boundingRect.left || currentX >= boundingRect.right) {
                            return this.callBase(this._pointsByFixedColumns, currentX, deltaX)
                        }
                    }
                    return this.callBase(pointsByColumns, currentX, deltaX)
                }
            }
        }
    }
};
exports.columnFixingModule = columnFixingModule;