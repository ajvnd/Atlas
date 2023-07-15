/**
 * DevExtreme (bundles/__internal/grids/pivot_grid/area_item/module.js)
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
exports.getRealElementWidth = exports.default = exports.AreaItem = void 0;
var _size = require("../../../../core/utils/size");
var _renderer = _interopRequireDefault(require("../../../../core/renderer"));
var _class = _interopRequireDefault(require("../../../../core/class"));
var _element = require("../../../../core/element");
var _extend = require("../../../../core/utils/extend");
var _position = require("../../../../core/utils/position");
var _type = require("../../../../core/utils/type");
var _style = require("../../../../core/utils/style");
var _dom_adapter = _interopRequireDefault(require("../../../../core/dom_adapter"));
var _getMemoizeScrollTo2 = require("../../../../renovation/ui/common/utils/scroll/getMemoizeScrollTo");

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
var PIVOTGRID_EXPAND_CLASS = "dx-expand";
var getRealElementWidth = function(element) {
    var width = 0;
    var offsetWidth = element.offsetWidth;
    if (element.getBoundingClientRect) {
        var clientRect = (0, _position.getBoundingRect)(element);
        width = clientRect.width;
        if (!width) {
            width = clientRect.right - clientRect.left
        }
        if (width <= offsetWidth - 1) {
            width = offsetWidth
        }
    }
    return width > 0 ? width : offsetWidth
};
exports.getRealElementWidth = getRealElementWidth;

function getFakeTableOffset(scrollPos, elementOffset, tableSize, viewPortSize) {
    var offset = 0;
    var halfTableCount = 0;
    var halfTableSize = tableSize / 2;
    if (scrollPos + viewPortSize - (elementOffset + tableSize) > 1) {
        if (scrollPos >= elementOffset + tableSize + halfTableSize) {
            halfTableCount = parseInt((scrollPos - (elementOffset + tableSize)) / halfTableSize, 10)
        }
        offset = elementOffset + tableSize + halfTableSize * halfTableCount
    } else if (scrollPos < elementOffset) {
        if (scrollPos <= elementOffset - halfTableSize) {
            halfTableCount = parseInt((scrollPos - (elementOffset - halfTableSize)) / halfTableSize, 10)
        }
        offset = elementOffset - (tableSize - halfTableSize * halfTableCount)
    } else {
        offset = elementOffset
    }
    return offset
}
var AreaItem = _class.default.inherit({
    ctor: function(component) {
        this.component = component
    },
    option: function() {
        return this.component.option.apply(this.component, arguments)
    },
    _getRowElement: function(index) {
        if (this._tableElement && this._tableElement.length > 0) {
            return this._tableElement[0].rows[index]
        }
        return null
    },
    _createGroupElement: function() {
        return (0, _renderer.default)("<div>")
    },
    _createTableElement: function() {
        return (0, _renderer.default)("<table>")
    },
    _getCellText: function(cell, encodeHtml) {
        var cellText = cell.isWhiteSpace ? "&nbsp" : cell.text || "&nbsp";
        if (encodeHtml && (-1 !== cellText.indexOf("<") || -1 !== cellText.indexOf(">"))) {
            cellText = (0, _renderer.default)("<div>").text(cellText).html()
        }
        return cellText
    },
    _getRowClassNames: function() {},
    _applyCustomStyles: function(options) {
        if (options.cell.width) {
            options.cssArray.push("min-width:".concat(options.cell.width, "px"))
        }
        if (options.cell.sorted) {
            options.classArray.push("dx-pivotgrid-sorted")
        }
    },
    _getMainElementMarkup: function() {
        return _dom_adapter.default.createElement("tbody")
    },
    _getCloseMainElementMarkup: function() {
        return "</tbody>"
    },
    _renderTableContent: function(tableElement, data) {
        var rowsCount = data.length;
        var row;
        var cell;
        var i;
        var j;
        var cellText;
        var rtlEnabled = this.option("rtlEnabled");
        var encodeHtml = this.option("encodeHtml");
        var rowClassNames;
        tableElement.data("area", this._getAreaName());
        tableElement.data("data", data);
        tableElement.css("width", "");
        var tbody = this._getMainElementMarkup();
        for (i = 0; i < rowsCount; i += 1) {
            row = data[i];
            rowClassNames = [];
            var tr = _dom_adapter.default.createElement("tr");
            for (j = 0; j < row.length; j += 1) {
                cell = row[j];
                this._getRowClassNames(i, cell, rowClassNames);
                var td = _dom_adapter.default.createElement("td");
                if (cell) {
                    cell.rowspan && td.setAttribute("rowspan", cell.rowspan || 1);
                    cell.colspan && td.setAttribute("colspan", cell.colspan || 1);
                    var styleOptions = {
                        cellElement: void 0,
                        cell: cell,
                        cellsCount: row.length,
                        cellIndex: j,
                        rowElement: void 0,
                        rowIndex: i,
                        rowsCount: rowsCount,
                        rtlEnabled: rtlEnabled,
                        classArray: [],
                        cssArray: []
                    };
                    this._applyCustomStyles(styleOptions);
                    if (styleOptions.cssArray.length) {
                        (0, _style.setStyle)(td, styleOptions.cssArray.join(";"))
                    }
                    if (styleOptions.classArray.length) {
                        td.setAttribute("class", styleOptions.classArray.join(" "))
                    }
                    if ((0, _type.isDefined)(cell.expanded)) {
                        var div = _dom_adapter.default.createElement("div");
                        div.classList.add("dx-expand-icon-container");
                        var _span = _dom_adapter.default.createElement("span");
                        _span.classList.add(PIVOTGRID_EXPAND_CLASS);
                        div.appendChild(_span);
                        td.appendChild(div)
                    }
                    cellText = this._getCellText(cell, encodeHtml)
                } else {
                    cellText = ""
                }
                var span = _dom_adapter.default.createElement("span");
                if ((0, _type.isDefined)(cell.wordWrapEnabled)) {
                    span.style.whiteSpace = cell.wordWrapEnabled ? "normal" : "nowrap"
                }
                span.innerHTML = cellText;
                td.appendChild(span);
                if (cell.sorted) {
                    var _span2 = _dom_adapter.default.createElement("span");
                    _span2.classList.add("dx-icon-sorted");
                    td.appendChild(_span2)
                }
                tr.appendChild(td)
            }
            if (rowClassNames.length) {
                tr.setAttribute("class", rowClassNames.join(" "))
            }
            tbody.appendChild(tr)
        }
        tableElement.append(tbody);
        this._triggerOnCellPrepared(tableElement, data)
    },
    _triggerOnCellPrepared: function(tableElement, data) {
        var rowElements = tableElement.find("tr");
        var areaName = this._getAreaName();
        var onCellPrepared = this.option("onCellPrepared");
        var hasEvent = this.component._eventsStrategy.hasEvent("cellPrepared");
        var rowElement;
        var $cellElement;
        var onCellPreparedArgs;
        var defaultActionArgs = this.component._defaultActionArgs();
        var row;
        var cell;
        var rowIndex;
        var columnIndex;
        if (onCellPrepared || hasEvent) {
            for (rowIndex = 0; rowIndex < data.length; rowIndex += 1) {
                row = data[rowIndex];
                rowElement = rowElements.eq(rowIndex);
                for (columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
                    cell = row[columnIndex];
                    $cellElement = rowElement.children().eq(columnIndex);
                    onCellPreparedArgs = {
                        area: areaName,
                        rowIndex: rowIndex,
                        columnIndex: columnIndex,
                        cellElement: (0, _element.getPublicElement)($cellElement),
                        cell: cell
                    };
                    if (hasEvent) {
                        this.component._trigger("onCellPrepared", onCellPreparedArgs)
                    } else {
                        onCellPrepared((0, _extend.extend)(onCellPreparedArgs, defaultActionArgs))
                    }
                }
            }
        }
    },
    _getRowHeight: function(index) {
        var row = this._getRowElement(index);
        var height = 0;
        var offsetHeight = row.offsetHeight;
        if (row && row.lastChild) {
            if (row.getBoundingClientRect) {
                var clientRect = (0, _position.getBoundingRect)(row);
                height = clientRect.height;
                if (height <= offsetHeight - 1) {
                    height = offsetHeight
                }
            }
            return height > 0 ? height : offsetHeight
        }
        return 0
    },
    _setRowHeight: function(index, value) {
        var row = this._getRowElement(index);
        if (row) {
            row.style.height = "".concat(value, "px")
        }
    },
    getRowsLength: function() {
        if (this._tableElement && this._tableElement.length > 0) {
            return this._tableElement[0].rows.length
        }
        return 0
    },
    getRowsHeight: function() {
        var result = [];
        var rowsLength = this.getRowsLength();
        for (var i = 0; i < rowsLength; i += 1) {
            result.push(this._getRowHeight(i))
        }
        return result
    },
    setRowsHeight: function(values) {
        var totalHeight = 0;
        var valuesLength = values.length;
        for (var i = 0; i < valuesLength; i += 1) {
            totalHeight += values[i];
            this._setRowHeight(i, values[i])
        }
        this._tableHeight = totalHeight;
        this._tableElement[0].style.height = "".concat(totalHeight, "px")
    },
    getColumnsWidth: function() {
        var rowsLength = this.getRowsLength();
        var rowIndex;
        var row;
        var i;
        var columnIndex;
        var processedCells = [];
        var result = [];
        var fillCells = function(cells, rowIndex, columnIndex, rowSpan, colSpan) {
            var rowOffset;
            var columnOffset;
            for (rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
                for (columnOffset = 0; columnOffset < colSpan; columnOffset += 1) {
                    cells[rowIndex + rowOffset] = cells[rowIndex + rowOffset] || [];
                    cells[rowIndex + rowOffset][columnIndex + columnOffset] = true
                }
            }
        };
        if (rowsLength) {
            for (rowIndex = 0; rowIndex < rowsLength; rowIndex += 1) {
                processedCells[rowIndex] = processedCells[rowIndex] || [];
                row = this._getRowElement(rowIndex);
                for (i = 0; i < row.cells.length; i += 1) {
                    for (columnIndex = 0; processedCells[rowIndex][columnIndex]; columnIndex += 1) {}
                    fillCells(processedCells, rowIndex, columnIndex, row.cells[i].rowSpan, row.cells[i].colSpan);
                    if (1 === row.cells[i].colSpan) {
                        result[columnIndex] = result[columnIndex] || getRealElementWidth(row.cells[i])
                    }
                }
            }
        }
        return result
    },
    setColumnsWidth: function(values) {
        var i;
        var tableElement = this._tableElement[0];
        this._colgroupElement.html("");
        var columnsCount = this.getColumnsCount();
        var columnWidth = [];
        for (i = 0; i < columnsCount; i += 1) {
            columnWidth.push(values[i] || 0)
        }
        for (i = columnsCount; i < values.length && values; i += 1) {
            columnWidth[columnsCount - 1] += values[i]
        }
        for (i = 0; i < columnsCount; i += 1) {
            var col = _dom_adapter.default.createElement("col");
            col.style.width = "".concat(columnWidth[i], "px");
            this._colgroupElement.append(col)
        }
        this._tableWidth = columnWidth.reduce((function(sum, width) {
            return sum + width
        }), 0);
        tableElement.style.width = "".concat(this._tableWidth, "px");
        tableElement.style.tableLayout = "fixed"
    },
    resetColumnsWidth: function() {
        (0, _size.setWidth)(this._colgroupElement.find("col"), "auto");
        this._tableElement.css({
            width: "",
            tableLayout: ""
        })
    },
    setGroupWidth: function(value) {
        this._getScrollable().option("width", value)
    },
    setGroupHeight: function(value) {
        this._getScrollable().option("height", value)
    },
    getGroupHeight: function() {
        return this._getGroupElementSize("height")
    },
    getGroupWidth: function() {
        return this._getGroupElementSize("width")
    },
    _getGroupElementSize: function(dimension) {
        var size = this.groupElement()[0].style[dimension];
        if (size.indexOf("px") > 0) {
            return parseFloat(size)
        }
        return null
    },
    groupElement: function() {
        return this._groupElement
    },
    tableElement: function() {
        return this._tableElement
    },
    element: function() {
        return this._rootElement
    },
    headElement: function() {
        return this._tableElement.find("thead")
    },
    _setTableCss: function(styles) {
        if (this.option("rtlEnabled")) {
            styles.right = styles.left;
            delete styles.left
        }
        this.tableElement().css(styles)
    },
    setVirtualContentParams: function(params) {
        this._virtualContent.css({
            width: params.width,
            height: params.height
        });
        var scrollable = this._getScrollable();
        if (null === scrollable || void 0 === scrollable ? void 0 : scrollable.isRenovated()) {
            this._getScrollable().option("classes", "dx-virtual-mode")
        } else {
            this.groupElement().addClass("dx-virtual-mode")
        }
    },
    disableVirtualMode: function() {
        var scrollable = this._getScrollable();
        if (null === scrollable || void 0 === scrollable ? void 0 : scrollable.isRenovated()) {
            this._getScrollable().option("classes", "")
        } else {
            this.groupElement().removeClass("dx-virtual-mode")
        }
    },
    _renderVirtualContent: function() {
        if (!this._virtualContent && "virtual" === this.option("scrolling.mode")) {
            this._virtualContent = (0, _renderer.default)("<div>").addClass("dx-virtual-content").insertBefore(this._tableElement)
        }
    },
    reset: function() {
        var tableElement = this._tableElement[0];
        this._fakeTable && this._fakeTable.detach();
        this._fakeTable = null;
        this.disableVirtualMode();
        this.setGroupWidth("100%");
        this.setGroupHeight("auto");
        this.resetColumnsWidth();
        if (tableElement) {
            for (var i = 0; i < tableElement.rows.length; i += 1) {
                tableElement.rows[i].style.height = ""
            }
            tableElement.style.height = "";
            tableElement.style.width = "100%"
        }
    },
    _updateFakeTableVisibility: function() {
        var tableElement = this.tableElement()[0];
        var horizontalOffsetName = this.option("rtlEnabled") ? "right" : "left";
        var fakeTableElement = this._fakeTable[0];
        if (tableElement.style.top === fakeTableElement.style.top && fakeTableElement.style[horizontalOffsetName] === tableElement.style[horizontalOffsetName]) {
            this._fakeTable.addClass("dx-hidden")
        } else {
            this._fakeTable.removeClass("dx-hidden")
        }
    },
    _moveFakeTableHorizontally: function(scrollPos) {
        var rtlEnabled = this.option("rtlEnabled");
        var offsetStyleName = rtlEnabled ? "right" : "left";
        var tableElementOffset = parseFloat(this.tableElement()[0].style[offsetStyleName]);
        var offset = getFakeTableOffset(scrollPos, tableElementOffset, this._tableWidth, this.getGroupWidth());
        if (parseFloat(this._fakeTable[0].style[offsetStyleName]) !== offset) {
            this._fakeTable[0].style[offsetStyleName] = "".concat(offset, "px")
        }
    },
    _moveFakeTableTop: function(scrollPos) {
        var tableElementOffsetTop = parseFloat(this.tableElement()[0].style.top);
        var offsetTop = getFakeTableOffset(scrollPos, tableElementOffsetTop, this._tableHeight, this.getGroupHeight());
        if (parseFloat(this._fakeTable[0].style.top) !== offsetTop) {
            this._fakeTable[0].style.top = "".concat(offsetTop, "px")
        }
    },
    _moveFakeTable: function() {
        this._updateFakeTableVisibility()
    },
    _createFakeTable: function() {
        if (!this._fakeTable) {
            this._fakeTable = this.tableElement().clone().addClass("dx-pivot-grid-fake-table").appendTo(this._virtualContent)
        }
    },
    render: function(rootElement, data) {
        if (this._tableElement) {
            try {
                this._tableElement[0].innerHTML = ""
            } catch (e) {
                this._tableElement.empty()
            }
            this._tableElement.attr("style", "")
        } else {
            this._groupElement = this._createGroupElement();
            this._tableElement = this._createTableElement();
            this._tableElement.appendTo(this._groupElement);
            this._groupElement.appendTo(rootElement);
            this._rootElement = rootElement
        }
        this._colgroupElement = (0, _renderer.default)("<colgroup>").appendTo(this._tableElement);
        this._renderTableContent(this._tableElement, data);
        this._renderVirtualContent()
    },
    _getScrollable: function() {
        return this.groupElement().data("dxScrollable")
    },
    _getMemoizeScrollTo: function() {
        var _this = this;
        var _a;
        this._memoizeScrollTo = null !== (_a = this._memoizeScrollTo) && void 0 !== _a ? _a : (0, _getMemoizeScrollTo2.getMemoizeScrollTo)((function() {
            return _this._getScrollable()
        }));
        return this._memoizeScrollTo
    },
    _getMaxLeftOffset: function(scrollable) {
        var containerElement = (0, _renderer.default)(scrollable.container()).get(0);
        return containerElement.scrollWidth - containerElement.clientWidth
    },
    on: function(eventName, handler) {
        var that = this;
        var scrollable = that._getScrollable();
        if (scrollable) {
            scrollable.on(eventName, (function(e) {
                if (that.option("rtlEnabled") && (0, _type.isDefined)(e.scrollOffset.left)) {
                    e.scrollOffset.left = that._getMaxLeftOffset(scrollable) - e.scrollOffset.left
                }
                handler(e)
            }))
        }
        return this
    },
    off: function(eventName) {
        var scrollable = this._getScrollable();
        if (scrollable) {
            scrollable.off(eventName)
        }
        return this
    },
    scrollTo: function(pos) {
        var force = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : false;
        var scrollable = this._getScrollable();
        if (!scrollable) {
            return
        }
        var rtlEnabled = this.option("rtlEnabled");
        var areaName = this._getAreaName();
        var scrollablePos = _extends(_extends({}, pos), {
            left: rtlEnabled && ("column" === areaName || "data" === areaName) ? this._getMaxLeftOffset(scrollable) - pos.left : pos.left
        });
        var memoizeScrollTo = this._getMemoizeScrollTo();
        memoizeScrollTo(scrollablePos, force);
        if (this._virtualContent) {
            this._createFakeTable();
            this._moveFakeTable(pos)
        }
    },
    updateScrollable: function() {
        var scrollable = this._getScrollable();
        if (scrollable) {
            return scrollable.update()
        }
        return
    },
    getColumnsCount: function() {
        var columnCount = 0;
        var row = this._getRowElement(0);
        var cells;
        if (row) {
            cells = row.cells;
            for (var i = 0, len = cells.length; i < len; ++i) {
                columnCount += cells[i].colSpan
            }
        }
        return columnCount
    },
    getData: function() {
        var tableElement = this._tableElement;
        return tableElement ? tableElement.data("data") : []
    }
});
exports.AreaItem = AreaItem;
var _default = {
    AreaItem: AreaItem,
    getRealElementWidth: getRealElementWidth
};
exports.default = _default;