/**
 * DevExtreme (bundles/__internal/grids/grid_core/columns_resizing_reordering/module.js)
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
exports.columnsResizingReorderingModule = void 0;
var _size = require("../../../../core/utils/size");
var _renderer = _interopRequireDefault(require("../../../../core/renderer"));
var _dom_adapter = _interopRequireDefault(require("../../../../core/dom_adapter"));
var _events_engine = _interopRequireDefault(require("../../../../events/core/events_engine"));
var _callbacks = _interopRequireDefault(require("../../../../core/utils/callbacks"));
var _type = require("../../../../core/utils/type");
var _iterator = require("../../../../core/utils/iterator");
var _extend = require("../../../../core/utils/extend");
var _position = require("../../../../core/utils/position");
var _index = require("../../../../events/utils/index");
var _pointer = _interopRequireDefault(require("../../../../events/pointer"));
var _drag = require("../../../../events/drag");
var _fx = _interopRequireDefault(require("../../../../animation/fx"));
var _swatch_container = _interopRequireDefault(require("../../../../ui/widget/swatch_container"));
var _modules = _interopRequireDefault(require("../modules"));
var _module_utils = _interopRequireDefault(require("../module_utils"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var COLUMNS_SEPARATOR_CLASS = "columns-separator";
var COLUMNS_SEPARATOR_TRANSPARENT = "columns-separator-transparent";
var DRAGGING_HEADER_CLASS = "drag-header";
var CELL_CONTENT_CLASS = "text-content";
var HEADERS_DRAG_ACTION_CLASS = "drag-action";
var TRACKER_CLASS = "tracker";
var HEADERS_DROP_HIGHLIGHT_CLASS = "drop-highlight";
var BLOCK_SEPARATOR_CLASS = "dx-block-separator";
var HEADER_ROW_CLASS = "dx-header-row";
var WIDGET_CLASS = "dx-widget";
var DRAGGING_COMMAND_CELL_CLASS = "dx-drag-command-cell";
var MODULE_NAMESPACE = "dxDataGridResizingReordering";
var COLUMNS_SEPARATOR_TOUCH_TRACKER_WIDTH = 10;
var DRAGGING_DELTA = 5;
var COLUMN_OPACITY = .5;
var allowResizing = function(that) {
    return that.option("allowColumnResizing") || that.getController("columns").isColumnOptionUsed("allowResizing")
};
var allowReordering = function(that) {
    return that.option("allowColumnReordering") || that.getController("columns").isColumnOptionUsed("allowReordering")
};
var TrackerView = _modules.default.View.inherit({
    _renderCore: function() {
        var deferred = this.callBase();
        this.element().addClass(this.addWidgetPrefix(TRACKER_CLASS));
        this.hide();
        return deferred
    },
    _unsubscribeFromCallback: function() {
        if (this._positionChanged) {
            this._tablePositionController.positionChanged.remove(this._positionChanged)
        }
    },
    _subscribeToCallback: function() {
        var that = this;
        that._positionChanged = function(position) {
            var $element = that.element();
            if ($element && $element.hasClass(that.addWidgetPrefix(TRACKER_CLASS))) {
                $element.css({
                    top: position.top
                });
                (0, _size.setHeight)($element, position.height)
            }
        };
        this._tablePositionController.positionChanged.add(that._positionChanged)
    },
    optionChanged: function(args) {
        if ("allowColumnResizing" === args.name) {
            this._unsubscribeFromCallback();
            if (args.value) {
                this._subscribeToCallback();
                this._invalidate()
            }
        }
        this.callBase(args)
    },
    init: function() {
        this.callBase();
        this._tablePositionController = this.getController("tablePosition");
        this._subscribeToCallback()
    },
    isVisible: function() {
        return allowResizing(this)
    },
    show: function() {
        this.element().show()
    },
    hide: function() {
        this.element() && this.element().hide()
    },
    setHeight: function(value) {
        (0, _size.setHeight)(this.element(), value)
    },
    dispose: function() {
        this._unsubscribeFromCallback();
        this.callBase()
    }
});
var SeparatorView = _modules.default.View.inherit({
    _renderSeparator: function() {},
    _renderCore: function(options) {
        var deferred = this.callBase(options);
        this._isShown = true;
        this._renderSeparator();
        this.hide();
        return deferred
    },
    show: function() {
        this._isShown = true
    },
    hide: function() {
        this._isShown = false
    },
    height: function(value) {
        var $element = this.element();
        if ($element) {
            if ((0, _type.isDefined)(value)) {
                (0, _size.setHeight)($element, value)
            } else {
                return (0, _size.getHeight)($element)
            }
        }
    },
    width: function(value) {
        var $element = this.element();
        if ($element) {
            if ((0, _type.isDefined)(value)) {
                (0, _size.setWidth)($element, value)
            } else {
                return (0, _size.getWidth)($element)
            }
        }
    }
});
var ColumnsSeparatorView = SeparatorView.inherit({
    _renderSeparator: function() {
        this.callBase();
        var $element = this.element();
        $element.addClass(this.addWidgetPrefix(COLUMNS_SEPARATOR_CLASS))
    },
    _subscribeToCallback: function() {
        var that = this;
        var $element;
        that._positionChanged = function(position) {
            $element = that.element();
            if ($element) {
                $element.css({
                    top: position.top
                });
                (0, _size.setHeight)($element, position.height)
            }
        };
        that._tablePositionController.positionChanged.add(that._positionChanged)
    },
    _unsubscribeFromCallback: function() {
        this._positionChanged && this._tablePositionController.positionChanged.remove(this._positionChanged)
    },
    _init: function() {
        this._isTransparent = allowResizing(this);
        if (this.isVisible()) {
            this._subscribeToCallback()
        }
    },
    isVisible: function() {
        return this.option("showColumnHeaders") && (allowReordering(this) || allowResizing(this))
    },
    optionChanged: function(args) {
        if ("allowColumnResizing" === args.name) {
            if (args.value) {
                this._init();
                this._invalidate();
                this.hide(true)
            } else {
                this._unsubscribeFromCallback();
                this._isTransparent = allowResizing(this);
                this.hide(true)
            }
        }
        this.callBase(args)
    },
    init: function() {
        this.callBase();
        this._tablePositionController = this.getController("tablePosition");
        this._init()
    },
    show: function() {
        var $element = this.element();
        if ($element && !this._isShown) {
            if (this._isTransparent) {
                $element.removeClass(this.addWidgetPrefix(COLUMNS_SEPARATOR_TRANSPARENT))
            } else {
                $element.show()
            }
        }
        this.callBase()
    },
    hide: function(force) {
        var $element = this.element();
        var columnsSeparatorTransparent = this.addWidgetPrefix(COLUMNS_SEPARATOR_TRANSPARENT);
        if ($element && (this._isShown || force)) {
            if (this._isTransparent) {
                $element.addClass(columnsSeparatorTransparent);
                $element.css("left", "");
                $element.show()
            } else {
                if ($element.hasClass(columnsSeparatorTransparent)) {
                    $element.removeClass(columnsSeparatorTransparent)
                }
                $element.hide()
            }
        }
        this.callBase()
    },
    moveByX: function(outerX) {
        var $element = this.element();
        if ($element) {
            $element.css("left", null === outerX ? 0 : outerX - this._parentElement().offset().left);
            this._testPosX = outerX
        }
    },
    changeCursor: function(cursorName) {
        cursorName = (0, _type.isDefined)(cursorName) ? cursorName : "";
        var $element = this.element();
        if ($element) {
            $element.css("cursor", cursorName);
            this._testCursorName = cursorName
        }
    },
    dispose: function() {
        this._unsubscribeFromCallback();
        this.callBase()
    }
});
var BlockSeparatorView = SeparatorView.inherit({
    init: function() {
        var that = this;
        this.callBase();
        this.getController("data").loadingChanged.add((function(isLoading) {
            if (!isLoading) {
                that.hide()
            }
        }))
    },
    _renderSeparator: function() {
        this.callBase();
        this.element().addClass(BLOCK_SEPARATOR_CLASS).html("&nbsp;")
    },
    hide: function() {
        var $parent = this._parentElement();
        var $element = this.element();
        if ($element && this._isShown) {
            $element.css("display", "none")
        }
        if ($parent && !$parent.children(".".concat(BLOCK_SEPARATOR_CLASS)).length) {
            $parent.prepend(this.element())
        }
        this.callBase()
    },
    isVisible: function() {
        var groupPanelOptions = this.option("groupPanel");
        var columnChooserOptions = this.option("columnChooser");
        return groupPanelOptions && groupPanelOptions.visible || columnChooserOptions && columnChooserOptions.enabled
    },
    show: function(targetLocation) {
        var $element = this.element();
        var startAnimate = function(toOptions) {
            _fx.default.stop($element, true);
            _fx.default.animate($element, {
                type: "slide",
                from: {
                    width: 0,
                    display: toOptions.display
                },
                to: toOptions,
                duration: 300,
                easing: "swing"
            })
        };
        if ($element && !this._isShown) {
            switch (targetLocation) {
                case "group":
                    startAnimate({
                        width: "50px",
                        display: "inline-block"
                    });
                    break;
                case "columnChooser":
                    startAnimate({
                        width: "100%",
                        display: "block"
                    });
                    break;
                default:
                    $element.css("display", "")
            }
        }
        this.callBase()
    }
});
var DraggingHeaderView = _modules.default.View.inherit({
    _isDragging: false,
    isDragging: function() {
        return this._isDragging
    },
    _getDraggingPanelByPos: function(pos) {
        var result;
        (0, _iterator.each)(this._dragOptions.draggingPanels, (function(index, draggingPanel) {
            if (draggingPanel) {
                var boundingRect = draggingPanel.getBoundingRect();
                if (boundingRect && (void 0 === boundingRect.bottom || pos.y < boundingRect.bottom) && (void 0 === boundingRect.top || pos.y > boundingRect.top) && (void 0 === boundingRect.left || pos.x > boundingRect.left) && (void 0 === boundingRect.right || pos.x < boundingRect.right)) {
                    result = draggingPanel;
                    return false
                }
            }
            return
        }));
        return result
    },
    _renderCore: function() {
        this.element().addClass("".concat(this.addWidgetPrefix(DRAGGING_HEADER_CLASS), " ").concat(this.addWidgetPrefix(CELL_CONTENT_CLASS), " ").concat(WIDGET_CLASS)).hide()
    },
    _resetTargetColumnOptions: function() {
        var params = this._dropOptions;
        params.targetColumnIndex = -1;
        delete params.targetColumnElement;
        delete params.isLast;
        delete params.posX;
        delete params.posY
    },
    _getVisibleIndexObject: function(rowIndex, visibleIndex) {
        if ((0, _type.isDefined)(rowIndex)) {
            return {
                columnIndex: visibleIndex,
                rowIndex: rowIndex
            }
        }
        return visibleIndex
    },
    dispose: function() {
        var element = this.element();
        this._dragOptions = null;
        element && element.parent().find(".".concat(this.addWidgetPrefix(DRAGGING_HEADER_CLASS))).remove()
    },
    isVisible: function() {
        var columnsController = this.getController("columns");
        var commonColumnSettings = columnsController.getCommonSettings();
        return this.option("showColumnHeaders") && (allowReordering(this) || commonColumnSettings.allowGrouping || commonColumnSettings.allowHiding)
    },
    init: function() {
        var that = this;
        this.callBase();
        this._controller = this.getController("draggingHeader");
        this._columnsResizerViewController = this.getController("columnsResizer");
        this.getController("data").loadingChanged.add((function(isLoading) {
            var element = that.element();
            if (!isLoading && element) {
                element.hide()
            }
        }))
    },
    dragHeader: function(options) {
        var columnElement = options.columnElement;
        var isCommandColumn = !!options.sourceColumn.type;
        this._isDragging = true;
        this._dragOptions = options;
        this._dropOptions = {
            sourceIndex: options.index,
            sourceColumnIndex: this._getVisibleIndexObject(options.rowIndex, options.columnIndex),
            sourceColumnElement: options.columnElement,
            sourceLocation: options.sourceLocation
        };
        var document = _dom_adapter.default.getDocument();
        this._onSelectStart = document.onselectstart;
        document.onselectstart = function() {
            return false
        };
        this._controller.drag(this._dropOptions);
        this.element().css({
            textAlign: columnElement && columnElement.css("textAlign"),
            height: columnElement && (isCommandColumn && columnElement.get(0).clientHeight || (0, _size.getHeight)(columnElement)),
            width: columnElement && (isCommandColumn && columnElement.get(0).clientWidth || (0, _size.getWidth)(columnElement)),
            whiteSpace: columnElement && columnElement.css("whiteSpace")
        }).addClass(this.addWidgetPrefix(HEADERS_DRAG_ACTION_CLASS)).toggleClass(DRAGGING_COMMAND_CELL_CLASS, isCommandColumn).text(isCommandColumn ? "" : options.sourceColumn.caption);
        this.element().appendTo(_swatch_container.default.getSwatchContainer(columnElement))
    },
    moveHeader: function(args) {
        var e = args.event;
        var that = e.data.that;
        var eventData = (0, _index.eventData)(e);
        var isResizing = that._columnsResizerViewController ? that._columnsResizerViewController.isResizing() : false;
        var dragOptions = that._dragOptions;
        if (that._isDragging && !isResizing) {
            var $element = that.element();
            var moveDeltaX = Math.abs(eventData.x - dragOptions.columnElement.offset().left - dragOptions.deltaX);
            var moveDeltaY = Math.abs(eventData.y - dragOptions.columnElement.offset().top - dragOptions.deltaY);
            if ($element.is(":visible") || moveDeltaX > DRAGGING_DELTA || moveDeltaY > DRAGGING_DELTA) {
                $element.show();
                var newLeft = eventData.x - dragOptions.deltaX;
                var newTop = eventData.y - dragOptions.deltaY;
                $element.css({
                    left: newLeft,
                    top: newTop
                });
                that.dockHeader(eventData)
            }
            e.preventDefault()
        }
    },
    dockHeader: function(eventData) {
        var targetDraggingPanel = this._getDraggingPanelByPos(eventData);
        var controller = this._controller;
        var params = this._dropOptions;
        var dragOptions = this._dragOptions;
        if (targetDraggingPanel) {
            var rtlEnabled = this.option("rtlEnabled");
            var isVerticalOrientation = "columnChooser" === targetDraggingPanel.getName();
            var axisName = isVerticalOrientation ? "y" : "x";
            var targetLocation = targetDraggingPanel.getName();
            var rowIndex = "headers" === targetLocation ? dragOptions.rowIndex : void 0;
            var sourceColumn = dragOptions.sourceColumn;
            var columnElements = targetDraggingPanel.getColumnElements(rowIndex, null === sourceColumn || void 0 === sourceColumn ? void 0 : sourceColumn.ownerBand) || [];
            var pointsByTarget = dragOptions.pointsByTarget = dragOptions.pointsByTarget || {};
            var pointsByColumns = "columnChooser" === targetLocation ? [] : pointsByTarget[targetLocation] || controller._generatePointsByColumns((0, _extend.extend)({}, dragOptions, {
                targetDraggingPanel: targetDraggingPanel,
                columns: targetDraggingPanel.getColumns(rowIndex),
                columnElements: columnElements,
                isVerticalOrientation: isVerticalOrientation,
                startColumnIndex: "headers" === targetLocation && (0, _renderer.default)(columnElements[0]).index()
            }));
            pointsByTarget[targetLocation] = pointsByColumns;
            this._testPointsByColumns = pointsByColumns;
            params.targetLocation = targetLocation;
            if (pointsByColumns.length > 0) {
                for (var i = 0; i < pointsByColumns.length; i++) {
                    var centerPosition = pointsByColumns[i + 1] && (pointsByColumns[i][axisName] + pointsByColumns[i + 1][axisName]) / 2;
                    if (void 0 === centerPosition || (rtlEnabled && "x" === axisName ? eventData[axisName] > centerPosition : eventData[axisName] < centerPosition)) {
                        params.targetColumnIndex = this._getVisibleIndexObject(rowIndex, pointsByColumns[i].columnIndex);
                        if (columnElements[i]) {
                            params.targetColumnElement = columnElements.eq(i);
                            params.isLast = false
                        } else {
                            params.targetColumnElement = columnElements.last();
                            params.isLast = true
                        }
                        params.posX = pointsByColumns[i].x;
                        params.posY = pointsByColumns[i].y;
                        controller.dock(params);
                        break
                    }
                }
            } else {
                this._resetTargetColumnOptions();
                controller.dock(params)
            }
        }
    },
    dropHeader: function(args) {
        var e = args.event;
        var that = e.data.that;
        var controller = that._controller;
        that.element().hide();
        if (controller && that._isDragging) {
            controller.drop(that._dropOptions)
        }
        that.element().appendTo(that._parentElement());
        that._dragOptions = null;
        that._dropOptions = null;
        that._isDragging = false;
        _dom_adapter.default.getDocument().onselectstart = that._onSelectStart || null
    }
});
var isNextColumnResizingMode = function(that) {
    return "widget" !== that.option("columnResizingMode")
};
var ColumnsResizerViewController = _modules.default.ViewController.inherit({
    _isHeadersRowArea: function(posY) {
        if (this._columnHeadersView) {
            var element = this._columnHeadersView.element();
            if (element) {
                var offsetTop = element.offset().top;
                var headersRowHeight = this._columnHeadersView.getHeadersRowHeight();
                return posY >= offsetTop && posY <= offsetTop + headersRowHeight
            }
        }
        return false
    },
    _isRtlParentStyle: function() {
        var _a;
        return this.option("rtlEnabled") && "rtl" === (null === (_a = this._$parentContainer) || void 0 === _a ? void 0 : _a.parent().css("direction"))
    },
    _pointCreated: function(point, cellsLength, columns) {
        var isNextColumnMode = isNextColumnResizingMode(this);
        var rtlEnabled = this.option("rtlEnabled");
        var isRtlParentStyle = this._isRtlParentStyle();
        var firstPointColumnIndex = !isNextColumnMode && rtlEnabled && !isRtlParentStyle ? 0 : 1;
        if (point.index >= firstPointColumnIndex && point.index < cellsLength + (!isNextColumnMode && (!rtlEnabled || isRtlParentStyle) ? 1 : 0)) {
            point.columnIndex -= firstPointColumnIndex;
            var currentColumn = columns[point.columnIndex] || {};
            var nextColumn = columns[point.columnIndex + 1] || {};
            return !(isNextColumnMode ? currentColumn.allowResizing && nextColumn.allowResizing : currentColumn.allowResizing)
        }
        return true
    },
    _getTargetPoint: function(pointsByColumns, currentX, deltaX) {
        if (pointsByColumns) {
            for (var i = 0; i < pointsByColumns.length; i++) {
                if (pointsByColumns[i].x === pointsByColumns[0].x && pointsByColumns[i + 1] && pointsByColumns[i].x === pointsByColumns[i + 1].x) {
                    continue
                }
                if (pointsByColumns[i].x - deltaX <= currentX && currentX <= pointsByColumns[i].x + deltaX) {
                    return pointsByColumns[i]
                }
            }
        }
        return null
    },
    _moveSeparator: function(args) {
        var _a;
        var e = args.event;
        var that = e.data;
        var columnsSeparatorWidth = that._columnsSeparatorView.width();
        var isNextColumnMode = isNextColumnResizingMode(that);
        var deltaX = columnsSeparatorWidth / 2;
        var parentOffset = that._$parentContainer.offset();
        var parentOffsetLeft = parentOffset.left;
        var eventData = (0, _index.eventData)(e);
        var rtlEnabled = that.option("rtlEnabled");
        var isRtlParentStyle = this._isRtlParentStyle();
        var isDragging = null === (_a = that._draggingHeaderView) || void 0 === _a ? void 0 : _a.isDragging();
        if (that._isResizing && that._resizingInfo) {
            if ((parentOffsetLeft <= eventData.x || !isNextColumnMode && isRtlParentStyle) && (!isNextColumnMode || eventData.x <= parentOffsetLeft + (0, _size.getWidth)(that._$parentContainer))) {
                if (that._updateColumnsWidthIfNeeded(eventData.x)) {
                    var $cell = that._columnHeadersView.getColumnElements().eq(that._resizingInfo.currentColumnIndex);
                    var cell = $cell[0];
                    if (cell) {
                        var outerWidth = cell.getBoundingClientRect().width;
                        that._columnsSeparatorView.moveByX($cell.offset().left + ((isNextColumnMode || isRtlParentStyle) && rtlEnabled ? 0 : outerWidth));
                        that._tablePositionController.update(that._targetPoint.y);
                        e.preventDefault()
                    }
                }
            }
        } else if (!isDragging) {
            if (that._isHeadersRowArea(eventData.y)) {
                if (that._previousParentOffset) {
                    if (that._previousParentOffset.left !== parentOffset.left || that._previousParentOffset.top !== parentOffset.top) {
                        that.pointsByColumns(null)
                    }
                }
                that._targetPoint = that._getTargetPoint(that.pointsByColumns(), eventData.x, columnsSeparatorWidth);
                that._previousParentOffset = parentOffset;
                that._isReadyResizing = false;
                if (that._targetPoint) {
                    that._columnsSeparatorView.changeCursor("col-resize");
                    that._columnsSeparatorView.moveByX(that._targetPoint.x - deltaX);
                    that._tablePositionController.update(that._targetPoint.y);
                    that._isReadyResizing = true;
                    e.preventDefault()
                } else {
                    that._columnsSeparatorView.changeCursor();
                    that._columnsSeparatorView.moveByX(null)
                }
            } else {
                that.pointsByColumns(null);
                that._isReadyResizing = false;
                that._columnsSeparatorView.changeCursor();
                that._columnsSeparatorView.moveByX(null)
            }
        }
    },
    _endResizing: function(args) {
        var e = args.event;
        var that = e.data;
        if (that._isResizing) {
            that.pointsByColumns(null);
            that._resizingInfo = null;
            that._columnsSeparatorView.hide();
            that._columnsSeparatorView.changeCursor();
            that._trackerView.hide();
            that._isReadyResizing = false;
            that._isResizing = false
        }
    },
    _getNextColumnIndex: function(currentColumnIndex) {
        return currentColumnIndex + 1
    },
    _setupResizingInfo: function(posX) {
        var currentColumnIndex = this._targetPoint.columnIndex;
        var nextColumnIndex = this._getNextColumnIndex(currentColumnIndex);
        var currentHeader = this._columnHeadersView.getHeaderElement(currentColumnIndex);
        var nextHeader = this._columnHeadersView.getHeaderElement(nextColumnIndex);
        this._resizingInfo = {
            startPosX: posX,
            currentColumnIndex: currentColumnIndex,
            currentColumnWidth: currentHeader && currentHeader.length > 0 ? (0, _position.getBoundingRect)(currentHeader[0]).width : 0,
            nextColumnIndex: nextColumnIndex,
            nextColumnWidth: nextHeader && nextHeader.length > 0 ? (0, _position.getBoundingRect)(nextHeader[0]).width : 0
        }
    },
    _startResizing: function(args) {
        var e = args.event;
        var that = e.data;
        var eventData = (0, _index.eventData)(e);
        if ((0, _index.isTouchEvent)(e)) {
            if (that._isHeadersRowArea(eventData.y)) {
                that._targetPoint = that._getTargetPoint(that.pointsByColumns(), eventData.x, COLUMNS_SEPARATOR_TOUCH_TRACKER_WIDTH);
                if (that._targetPoint) {
                    that._columnsSeparatorView.moveByX(that._targetPoint.x - that._columnsSeparatorView.width() / 2);
                    that._isReadyResizing = true
                }
            } else {
                that._isReadyResizing = false
            }
        }
        if (that._isReadyResizing) {
            if (that._targetPoint) {
                that._testColumnIndex = that._targetPoint.columnIndex
            }
            that._setupResizingInfo(eventData.x);
            that._isResizing = true;
            that._tablePositionController.update(that._targetPoint.y);
            that._columnsSeparatorView.show();
            that._trackerView.show();
            var scrollable = that.component.getScrollable();
            if (scrollable && that._isRtlParentStyle()) {
                that._scrollRight = (0, _size.getWidth)(scrollable.$content()) - (0, _size.getWidth)(scrollable.container()) - scrollable.scrollLeft()
            }
            e.preventDefault();
            e.stopPropagation()
        }
        if (this.isResizing()) {
            this.getController("editorFactory").loseFocus()
        }
    },
    _generatePointsByColumns: function() {
        var that = this;
        var columns = that._columnsController ? that._columnsController.getVisibleColumns() : [];
        var cells = that._columnHeadersView.getColumnElements();
        var pointsByColumns = [];
        if (cells && cells.length > 0) {
            pointsByColumns = _module_utils.default.getPointsByColumns(cells, (function(point) {
                return that._pointCreated(point, cells.length, columns)
            }))
        }
        that._pointsByColumns = pointsByColumns
    },
    _unsubscribeFromEvents: function() {
        this._moveSeparatorHandler && _events_engine.default.off(_dom_adapter.default.getDocument(), (0, _index.addNamespace)(_pointer.default.move, MODULE_NAMESPACE), this._moveSeparatorHandler);
        this._startResizingHandler && _events_engine.default.off(this._$parentContainer, (0, _index.addNamespace)(_pointer.default.down, MODULE_NAMESPACE), this._startResizingHandler);
        if (this._endResizingHandler) {
            _events_engine.default.off(this._columnsSeparatorView.element(), (0, _index.addNamespace)(_pointer.default.up, MODULE_NAMESPACE), this._endResizingHandler);
            _events_engine.default.off(_dom_adapter.default.getDocument(), (0, _index.addNamespace)(_pointer.default.up, MODULE_NAMESPACE), this._endResizingHandler)
        }
    },
    _subscribeToEvents: function() {
        this._moveSeparatorHandler = this.createAction(this._moveSeparator);
        this._startResizingHandler = this.createAction(this._startResizing);
        this._endResizingHandler = this.createAction(this._endResizing);
        _events_engine.default.on(_dom_adapter.default.getDocument(), (0, _index.addNamespace)(_pointer.default.move, MODULE_NAMESPACE), this, this._moveSeparatorHandler);
        _events_engine.default.on(this._$parentContainer, (0, _index.addNamespace)(_pointer.default.down, MODULE_NAMESPACE), this, this._startResizingHandler);
        _events_engine.default.on(this._columnsSeparatorView.element(), (0, _index.addNamespace)(_pointer.default.up, MODULE_NAMESPACE), this, this._endResizingHandler);
        _events_engine.default.on(_dom_adapter.default.getDocument(), (0, _index.addNamespace)(_pointer.default.up, MODULE_NAMESPACE), this, this._endResizingHandler)
    },
    _updateColumnsWidthIfNeeded: function(posX) {
        var deltaX;
        var needUpdate;
        var contentWidth = this._rowsView.contentWidth();
        var resizingInfo = this._resizingInfo;
        var columnsController = this._columnsController;
        var visibleColumns = columnsController.getVisibleColumns();
        var columnsSeparatorWidth = this._columnsSeparatorView.width();
        var isNextColumnMode = isNextColumnResizingMode(this);
        var adaptColumnWidthByRatio = isNextColumnMode && this.option("adaptColumnWidthByRatio") && !this.option("columnAutoWidth");
        var rtlEnabled = this.option("rtlEnabled");
        var isRtlParentStyle = this._isRtlParentStyle();
        var column = visibleColumns[resizingInfo.currentColumnIndex];
        var nextColumn = visibleColumns[resizingInfo.nextColumnIndex];

        function isPercentWidth(width) {
            return (0, _type.isString)(width) && width.endsWith("%")
        }

        function setColumnWidth(column, columnWidth, contentWidth, adaptColumnWidthByRatio) {
            if (column) {
                var oldColumnWidth = column.width;
                if (oldColumnWidth) {
                    adaptColumnWidthByRatio = isPercentWidth(oldColumnWidth)
                }
                if (adaptColumnWidthByRatio) {
                    columnsController.columnOption(column.index, "visibleWidth", columnWidth);
                    columnsController.columnOption(column.index, "width", "".concat((columnWidth / contentWidth * 100).toFixed(3), "%"))
                } else {
                    columnsController.columnOption(column.index, "visibleWidth", null);
                    columnsController.columnOption(column.index, "width", columnWidth)
                }
            }
        }
        deltaX = posX - resizingInfo.startPosX;
        if ((isNextColumnMode || isRtlParentStyle) && rtlEnabled) {
            deltaX = -deltaX
        }
        var _calculateCellWidths = function(delta) {
                var nextMinWidth;
                var nextCellWidth;
                var needCorrectionNextCellWidth;
                var cellWidth = resizingInfo.currentColumnWidth + delta;
                var minWidth = column && column.minWidth || columnsSeparatorWidth;
                var result = {};
                if (cellWidth >= minWidth) {
                    result.cellWidth = cellWidth
                } else {
                    result.cellWidth = minWidth;
                    needCorrectionNextCellWidth = true
                }
                if (isNextColumnMode) {
                    nextCellWidth = resizingInfo.nextColumnWidth - delta;
                    nextMinWidth = nextColumn && nextColumn.minWidth || columnsSeparatorWidth;
                    if (nextCellWidth >= nextMinWidth) {
                        if (needCorrectionNextCellWidth) {
                            result.nextCellWidth = resizingInfo.nextColumnWidth - (delta + minWidth - cellWidth)
                        } else {
                            result.nextCellWidth = nextCellWidth
                        }
                    } else {
                        result.nextCellWidth = nextMinWidth;
                        result.cellWidth = resizingInfo.currentColumnWidth + (delta - nextMinWidth + nextCellWidth)
                    }
                }
                return result
            }(deltaX),
            cellWidth = _calculateCellWidths.cellWidth,
            nextCellWidth = _calculateCellWidths.nextCellWidth;
        needUpdate = column.width !== cellWidth;
        if (needUpdate) {
            columnsController.beginUpdate();
            cellWidth = Math.floor(cellWidth);
            contentWidth = function(contentWidth, visibleColumns) {
                var allColumnsHaveWidth = visibleColumns.every((function(column) {
                    return column.width
                }));
                if (allColumnsHaveWidth) {
                    var totalPercent = visibleColumns.reduce((function(sum, column) {
                        if (isPercentWidth(column.width)) {
                            sum += parseFloat(column.width)
                        }
                        return sum
                    }), 0);
                    if (totalPercent > 100) {
                        contentWidth = contentWidth / totalPercent * 100
                    }
                }
                return contentWidth
            }(contentWidth, visibleColumns);
            setColumnWidth(column, cellWidth, contentWidth, adaptColumnWidthByRatio);
            if (isNextColumnMode) {
                nextCellWidth = Math.floor(nextCellWidth);
                setColumnWidth(nextColumn, nextCellWidth, contentWidth, adaptColumnWidthByRatio)
            } else {
                var columnWidths = this._columnHeadersView.getColumnWidths();
                columnWidths[resizingInfo.currentColumnIndex] = cellWidth;
                var hasScroll = columnWidths.reduce((function(totalWidth, width) {
                    return totalWidth + width
                }), 0) > this._rowsView.contentWidth();
                if (!hasScroll) {
                    var lastColumnIndex = _module_utils.default.getLastResizableColumnIndex(visibleColumns);
                    if (lastColumnIndex >= 0) {
                        columnsController.columnOption(visibleColumns[lastColumnIndex].index, "visibleWidth", "auto")
                    }
                }
                for (var i = 0; i < columnWidths.length; i++) {
                    if (visibleColumns[i] && visibleColumns[i] !== column && void 0 === visibleColumns[i].width) {
                        columnsController.columnOption(visibleColumns[i].index, "width", columnWidths[i])
                    }
                }
            }
            columnsController.endUpdate();
            if (!isNextColumnMode) {
                this.component.updateDimensions();
                var scrollable = this.component.getScrollable();
                if (scrollable && isRtlParentStyle) {
                    var left = (0, _size.getWidth)(scrollable.$content()) - (0, _size.getWidth)(scrollable.container()) - this._scrollRight;
                    scrollable.scrollTo({
                        left: left
                    })
                }
            }
        }
        return needUpdate
    },
    _subscribeToCallback: function(callback, handler) {
        callback.add(handler);
        this._subscribesToCallbacks.push({
            callback: callback,
            handler: handler
        })
    },
    _unsubscribeFromCallbacks: function() {
        for (var i = 0; i < this._subscribesToCallbacks.length; i++) {
            var subscribe = this._subscribesToCallbacks[i];
            subscribe.callback.remove(subscribe.handler)
        }
        this._subscribesToCallbacks = []
    },
    _unsubscribes: function() {
        this._unsubscribeFromEvents();
        this._unsubscribeFromCallbacks()
    },
    _init: function() {
        var that = this;
        var generatePointsByColumnsHandler = function() {
            if (!that._isResizing) {
                that.pointsByColumns(null)
            }
        };
        var generatePointsByColumnsScrollHandler = function(offset) {
            if (that._scrollLeft !== offset.left) {
                that._scrollLeft = offset.left;
                that.pointsByColumns(null)
            }
        };
        that._columnsSeparatorView = that.getView("columnsSeparatorView");
        that._columnHeadersView = that.getView("columnHeadersView");
        that._trackerView = that.getView("trackerView");
        that._rowsView = that.getView("rowsView");
        that._columnsController = that.getController("columns");
        that._tablePositionController = that.getController("tablePosition");
        that._$parentContainer = that.component.$element();
        that._draggingHeaderView = that.component.getView("draggingHeaderView");
        that._subscribeToCallback(that._columnHeadersView.renderCompleted, generatePointsByColumnsHandler);
        that._subscribeToCallback(that._columnHeadersView.resizeCompleted, generatePointsByColumnsHandler);
        that._subscribeToCallback(that._columnsSeparatorView.renderCompleted, (function() {
            that._unsubscribeFromEvents();
            that._subscribeToEvents()
        }));
        that._subscribeToCallback(that._rowsView.renderCompleted, (function() {
            that._rowsView.scrollChanged.remove(generatePointsByColumnsScrollHandler);
            that._rowsView.scrollChanged.add(generatePointsByColumnsScrollHandler)
        }));
        var previousScrollbarVisibility = 0 !== that._rowsView.getScrollbarWidth();
        var previousTableHeight = 0;
        that._subscribeToCallback(that.getController("tablePosition").positionChanged, (function(e) {
            if (that._isResizing && !that._rowsView.isResizing) {
                var scrollbarVisibility = 0 !== that._rowsView.getScrollbarWidth();
                if (previousScrollbarVisibility !== scrollbarVisibility || previousTableHeight && previousTableHeight !== e.height) {
                    previousScrollbarVisibility = scrollbarVisibility;
                    previousTableHeight = e.height;
                    that.component.updateDimensions()
                } else {
                    that._rowsView.updateFreeSpaceRowHeight()
                }
            }
            previousTableHeight = e.height
        }))
    },
    optionChanged: function(args) {
        this.callBase(args);
        if ("allowColumnResizing" === args.name) {
            if (args.value) {
                this._init();
                this._subscribeToEvents()
            } else {
                this._unsubscribes()
            }
        }
    },
    isResizing: function() {
        return this._isResizing
    },
    init: function() {
        this._subscribesToCallbacks = [];
        if (allowResizing(this)) {
            this._init()
        }
    },
    pointsByColumns: function(value) {
        if (void 0 !== value) {
            this._pointsByColumns = value
        } else {
            if (!this._pointsByColumns) {
                this._generatePointsByColumns()
            }
            return this._pointsByColumns
        }
    },
    dispose: function() {
        this._unsubscribes();
        this.callBase()
    }
});
var TablePositionViewController = _modules.default.ViewController.inherit({
    update: function(top) {
        var params = {};
        var $element = this._columnHeadersView.element();
        var offset = $element && $element.offset();
        var offsetTop = offset && offset.top || 0;
        var diffOffsetTop = (0, _type.isDefined)(top) ? Math.abs(top - offsetTop) : 0;
        var columnsHeadersHeight = this._columnHeadersView ? this._columnHeadersView.getHeight() : 0;
        var scrollBarWidth = this._rowsView.getScrollbarWidth(true);
        var rowsHeight = this._rowsView ? this._rowsView.height() - scrollBarWidth : 0;
        var columnsResizerController = this.component.getController("columnsResizer");
        var draggingHeaderView = this.component.getView("draggingHeaderView");
        params.height = columnsHeadersHeight;
        var isDraggingOrResizing = columnsResizerController.isResizing() || draggingHeaderView.isDragging();
        if (isDraggingOrResizing) {
            params.height += rowsHeight - diffOffsetTop
        }
        if (null !== top && $element && $element.length) {
            params.top = $element[0].offsetTop + diffOffsetTop
        }
        this.positionChanged.fire(params)
    },
    init: function() {
        var that = this;
        that.callBase();
        that._columnHeadersView = this.getView("columnHeadersView");
        that._rowsView = this.getView("rowsView");
        that._pagerView = this.getView("pagerView");
        that._rowsView.resizeCompleted.add((function() {
            if (that.option("allowColumnResizing")) {
                var targetPoint = that.getController("columnsResizer")._targetPoint;
                that.update(targetPoint ? targetPoint.y : null)
            }
        }))
    },
    ctor: function(component) {
        this.callBase(component);
        this.positionChanged = (0, _callbacks.default)()
    }
});
var DraggingHeaderViewController = _modules.default.ViewController.inherit({
    _generatePointsByColumns: function(options) {
        var that = this;
        return _module_utils.default.getPointsByColumns(options.columnElements, (function(point) {
            return that._pointCreated(point, options.columns, options.targetDraggingPanel.getName(), options.sourceColumn)
        }), options.isVerticalOrientation, options.startColumnIndex)
    },
    _pointCreated: function(point, columns, location, sourceColumn) {
        var targetColumn = columns[point.columnIndex];
        var prevColumn = columns[point.columnIndex - 1];
        switch (location) {
            case "columnChooser":
                return true;
            case "headers":
                return sourceColumn && !sourceColumn.allowReordering || (!targetColumn || !targetColumn.allowReordering) && (!prevColumn || !prevColumn.allowReordering);
            default:
                return 0 === columns.length
        }
    },
    _subscribeToEvents: function(draggingHeader, draggingPanels) {
        var that = this;
        (0, _iterator.each)(draggingPanels, (function(_, draggingPanel) {
            if (draggingPanel) {
                var columns;
                var rowCount = draggingPanel.getRowCount ? draggingPanel.getRowCount() : 1;
                var nameDraggingPanel = draggingPanel.getName();
                var subscribeToEvents = function(index, columnElement) {
                    if (!columnElement) {
                        return
                    }
                    var $columnElement = (0, _renderer.default)(columnElement);
                    var column = columns[index];
                    if (column && draggingPanel.allowDragging(column)) {
                        $columnElement.addClass(that.addWidgetPrefix(HEADERS_DRAG_ACTION_CLASS));
                        _events_engine.default.on($columnElement, (0, _index.addNamespace)(_drag.start, MODULE_NAMESPACE), that.createAction((function(args) {
                            var e = args.event;
                            var eventData = (0, _index.eventData)(e);
                            draggingHeader.dragHeader({
                                deltaX: eventData.x - (0, _renderer.default)(e.currentTarget).offset().left,
                                deltaY: eventData.y - (0, _renderer.default)(e.currentTarget).offset().top,
                                sourceColumn: column,
                                index: column.index,
                                columnIndex: index,
                                columnElement: $columnElement,
                                sourceLocation: nameDraggingPanel,
                                draggingPanels: draggingPanels,
                                rowIndex: that._columnsController.getRowIndex(column.index, true)
                            })
                        })));
                        _events_engine.default.on($columnElement, (0, _index.addNamespace)(_drag.move, MODULE_NAMESPACE), {
                            that: draggingHeader
                        }, that.createAction(draggingHeader.moveHeader));
                        _events_engine.default.on($columnElement, (0, _index.addNamespace)(_drag.end, MODULE_NAMESPACE), {
                            that: draggingHeader
                        }, that.createAction(draggingHeader.dropHeader))
                    }
                };
                for (var i = 0; i < rowCount; i++) {
                    var columnElements = draggingPanel.getColumnElements(i) || [];
                    if (columnElements.length) {
                        columns = draggingPanel.getColumns(i) || [];
                        (0, _iterator.each)(columnElements, subscribeToEvents)
                    }
                }
            }
        }))
    },
    _unsubscribeFromEvents: function(draggingHeader, draggingPanels) {
        var that = this;
        (0, _iterator.each)(draggingPanels, (function(_, draggingPanel) {
            if (draggingPanel) {
                var columnElements = draggingPanel.getColumnElements() || [];
                (0, _iterator.each)(columnElements, (function(index, columnElement) {
                    var $columnElement = (0, _renderer.default)(columnElement);
                    _events_engine.default.off($columnElement, (0, _index.addNamespace)(_drag.start, MODULE_NAMESPACE));
                    _events_engine.default.off($columnElement, (0, _index.addNamespace)(_drag.move, MODULE_NAMESPACE));
                    _events_engine.default.off($columnElement, (0, _index.addNamespace)(_drag.end, MODULE_NAMESPACE));
                    $columnElement.removeClass(that.addWidgetPrefix(HEADERS_DRAG_ACTION_CLASS))
                }))
            }
        }))
    },
    _getSeparator: function(targetLocation) {
        return "headers" === targetLocation ? this._columnsSeparatorView : this._blockSeparatorView
    },
    hideSeparators: function(type) {
        var blockSeparator = this._blockSeparatorView;
        var columnsSeparator = this._columnsSeparatorView;
        this._animationColumnIndex = null;
        blockSeparator && blockSeparator.hide();
        "block" !== type && columnsSeparator && columnsSeparator.hide()
    },
    init: function() {
        var that = this;
        that.callBase();
        that._columnsController = that.getController("columns");
        that._columnHeadersView = that.getView("columnHeadersView");
        that._columnsSeparatorView = that.getView("columnsSeparatorView");
        that._draggingHeaderView = that.getView("draggingHeaderView");
        that._rowsView = that.getView("rowsView");
        that._blockSeparatorView = that.getView("blockSeparatorView");
        that._headerPanelView = that.getView("headerPanel");
        that._columnChooserView = that.getView("columnChooserView");
        var subscribeToEvents = function() {
            if (that._draggingHeaderView) {
                var draggingPanels = [that._columnChooserView, that._columnHeadersView, that._headerPanelView];
                that._unsubscribeFromEvents(that._draggingHeaderView, draggingPanels);
                that._subscribeToEvents(that._draggingHeaderView, draggingPanels)
            }
        };
        that._columnHeadersView.renderCompleted.add(subscribeToEvents);
        that._headerPanelView && that._headerPanelView.renderCompleted.add(subscribeToEvents);
        that._columnChooserView && that._columnChooserView.renderCompleted.add(subscribeToEvents)
    },
    allowDrop: function(parameters) {
        return this._columnsController.allowMoveColumn(parameters.sourceColumnIndex, parameters.targetColumnIndex, parameters.sourceLocation, parameters.targetLocation)
    },
    drag: function(parameters) {
        var sourceIndex = parameters.sourceIndex;
        var sourceLocation = parameters.sourceLocation;
        var sourceColumnElement = parameters.sourceColumnElement;
        var headersView = this._columnHeadersView;
        var rowsView = this._rowsView;
        if (sourceColumnElement) {
            sourceColumnElement.css({
                opacity: COLUMN_OPACITY
            });
            if ("headers" === sourceLocation) {
                headersView && headersView.setRowsOpacity(sourceIndex, COLUMN_OPACITY);
                rowsView && rowsView.setRowsOpacity(sourceIndex, COLUMN_OPACITY)
            }
        }
    },
    dock: function(parameters) {
        var that = this;
        var targetColumnIndex = (0, _type.isObject)(parameters.targetColumnIndex) ? parameters.targetColumnIndex.columnIndex : parameters.targetColumnIndex;
        var sourceLocation = parameters.sourceLocation;
        var targetLocation = parameters.targetLocation;
        var separator = that._getSeparator(targetLocation);
        var hasTargetVisibleIndex = targetColumnIndex >= 0;
        that._columnHeadersView.element().find(".".concat(HEADER_ROW_CLASS)).toggleClass(that.addWidgetPrefix(HEADERS_DROP_HIGHLIGHT_CLASS), "headers" !== sourceLocation && "headers" === targetLocation && !hasTargetVisibleIndex);
        if (separator) {
            if (that.allowDrop(parameters) && hasTargetVisibleIndex) {
                if ("group" === targetLocation || "columnChooser" === targetLocation) {
                    ! function() {
                        if (that._animationColumnIndex !== targetColumnIndex) {
                            that.hideSeparators();
                            separator.element()[parameters.isLast ? "insertAfter" : "insertBefore"](parameters.targetColumnElement);
                            that._animationColumnIndex = targetColumnIndex;
                            separator.show(targetLocation)
                        }
                    }()
                } else {
                    that.hideSeparators("block");
                    that.getController("tablePosition").update(parameters.posY);
                    separator.moveByX(parameters.posX - separator.width());
                    separator.show()
                }
            } else {
                that.hideSeparators()
            }
        }
    },
    drop: function(parameters) {
        var sourceColumnElement = parameters.sourceColumnElement;
        if (sourceColumnElement) {
            sourceColumnElement.css({
                opacity: ""
            });
            this._columnHeadersView.setRowsOpacity(parameters.sourceIndex, "");
            this._rowsView.setRowsOpacity(parameters.sourceIndex, "");
            this._columnHeadersView.element().find(".".concat(HEADER_ROW_CLASS)).removeClass(this.addWidgetPrefix(HEADERS_DROP_HIGHLIGHT_CLASS))
        }
        if (this.allowDrop(parameters)) {
            var separator = this._getSeparator(parameters.targetLocation);
            if (separator) {
                separator.hide()
            }
            this._columnsController.moveColumn(parameters.sourceColumnIndex, parameters.targetColumnIndex, parameters.sourceLocation, parameters.targetLocation)
        }
    },
    dispose: function() {
        if (this._draggingHeaderView) {
            this._unsubscribeFromEvents(this._draggingHeaderView, [this._columnChooserView, this._columnHeadersView, this._headerPanelView])
        }
    }
});
var columnsResizingReorderingModule = {
    views: {
        columnsSeparatorView: ColumnsSeparatorView,
        blockSeparatorView: BlockSeparatorView,
        draggingHeaderView: DraggingHeaderView,
        trackerView: TrackerView
    },
    controllers: {
        draggingHeader: DraggingHeaderViewController,
        tablePosition: TablePositionViewController,
        columnsResizer: ColumnsResizerViewController
    },
    extenders: {
        views: {
            rowsView: {
                _needUpdateRowHeight: function(itemCount) {
                    var wordWrapEnabled = this.option("wordWrapEnabled");
                    var columnsResizerController = this.getController("columnsResizer");
                    var isResizing = columnsResizerController.isResizing();
                    return this.callBase.apply(this, arguments) || itemCount > 0 && wordWrapEnabled && isResizing
                }
            }
        },
        controllers: {
            editorFactory: {
                renderFocusOverlay: function() {
                    if (this.getController("columnsResizer").isResizing()) {
                        return
                    }
                    return this.callBase.apply(this, arguments)
                }
            }
        }
    }
};
exports.columnsResizingReorderingModule = columnsResizingReorderingModule;
