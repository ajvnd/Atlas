/**
 * DevExtreme (bundles/__internal/grids/grid_core/editor_factory/module.js)
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
exports.editorFactoryModule = exports.EditorFactory = void 0;
var _size = require("../../../../core/utils/size");
var _renderer = _interopRequireDefault(require("../../../../core/renderer"));
var _dom_adapter = _interopRequireDefault(require("../../../../core/dom_adapter"));
var _events_engine = _interopRequireDefault(require("../../../../events/core/events_engine"));
var _click = require("../../../../events/click");
var _pointer = _interopRequireDefault(require("../../../../events/pointer"));
var _position = _interopRequireDefault(require("../../../../animation/position"));
var _index = require("../../../../events/utils/index");
var _browser = _interopRequireDefault(require("../../../../core/utils/browser"));
var _extend = require("../../../../core/utils/extend");
var _position2 = require("../../../../core/utils/position");
var _ui = _interopRequireDefault(require("../../../../ui/shared/ui.editor_factory_mixin"));
var _modules = _interopRequireDefault(require("../modules"));
var _module_utils = _interopRequireDefault(require("../module_utils"));

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
var EDITOR_INLINE_BLOCK = "dx-editor-inline-block";
var CELL_FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled";
var FOCUS_OVERLAY_CLASS = "focus-overlay";
var CONTENT_CLASS = "content";
var FOCUSED_ELEMENT_CLASS = "dx-focused";
var ROW_CLASS = "dx-row";
var MODULE_NAMESPACE = "dxDataGridEditorFactory";
var UPDATE_FOCUS_EVENTS = (0, _index.addNamespace)([_pointer.default.down, "focusin", _click.name].join(" "), MODULE_NAMESPACE);
var DX_HIDDEN = "dx-hidden";
var ViewControllerWithMixin = _modules.default.ViewController.inherit(_ui.default);
var EditorFactory = function(_ViewControllerWithMi) {
    _inheritsLoose(EditorFactory, _ViewControllerWithMi);

    function EditorFactory() {
        return _ViewControllerWithMi.apply(this, arguments) || this
    }
    var _proto = EditorFactory.prototype;
    _proto._getFocusedElement = function($dataGridElement) {
        var rowSelector = this.option("focusedRowEnabled") ? "tr[tabindex]:focus" : "tr[tabindex]:not(.dx-data-row):focus";
        var focusedElementSelector = "td[tabindex]:focus, ".concat(rowSelector, ", input:focus, textarea:focus, .dx-lookup-field:focus, .dx-checkbox:focus, .dx-switch:focus, .dx-dropdownbutton .dx-buttongroup:focus, .dx-adaptive-item-text:focus");
        var $focusedElement = $dataGridElement.find(focusedElementSelector);
        return this.elementIsInsideGrid($focusedElement) && $focusedElement
    };
    _proto._getFocusCellSelector = function() {
        return ".dx-row > td"
    };
    _proto._updateFocusCore = function() {
        var $dataGridElement = this.component && this.component.$element();
        if ($dataGridElement) {
            var $focus = this._getFocusedElement($dataGridElement);
            if ($focus && $focus.length) {
                var isHideBorder;
                if (!$focus.hasClass(CELL_FOCUS_DISABLED_CLASS) && !$focus.hasClass(ROW_CLASS)) {
                    var $focusCell = $focus.closest("".concat(this._getFocusCellSelector(), ", .").concat(CELL_FOCUS_DISABLED_CLASS));
                    if ($focusCell.get(0) !== $focus.get(0)) {
                        isHideBorder = this._needHideBorder($focusCell);
                        $focus = $focusCell
                    }
                }
                if ($focus.length && !$focus.hasClass(CELL_FOCUS_DISABLED_CLASS)) {
                    this.focus($focus, isHideBorder);
                    return
                }
            }
        }
        this.loseFocus()
    };
    _proto._needHideBorder = function($element) {
        return $element.hasClass(EDITOR_INLINE_BLOCK)
    };
    _proto._updateFocus = function(e) {
        var that = this;
        var isFocusOverlay = e && e.event && (0, _renderer.default)(e.event.target).hasClass(that.addWidgetPrefix(FOCUS_OVERLAY_CLASS));
        that._isFocusOverlay = that._isFocusOverlay || isFocusOverlay;
        clearTimeout(that._updateFocusTimeoutID);
        that._updateFocusTimeoutID = setTimeout((function() {
            delete that._updateFocusTimeoutID;
            if (!that._isFocusOverlay) {
                that._updateFocusCore()
            }
            that._isFocusOverlay = false
        }))
    };
    _proto._updateFocusOverlaySize = function($element, position) {
        $element.hide();
        var location = _position.default.calculate($element, (0, _extend.extend)({
            collision: "fit"
        }, position));
        if (location.h.oversize > 0) {
            (0, _size.setOuterWidth)($element, (0, _size.getOuterWidth)($element) - location.h.oversize)
        }
        if (location.v.oversize > 0) {
            (0, _size.setOuterHeight)($element, (0, _size.getOuterHeight)($element) - location.v.oversize)
        }
        $element.show()
    };
    _proto.callbackNames = function() {
        return ["focused"]
    };
    _proto.focus = function($element, isHideBorder) {
        var that = this;
        if (void 0 === $element) {
            return that._$focusedElement
        }
        if ($element) {
            if (!$element.is(that._$focusedElement)) {
                that._$focusedElement && that._$focusedElement.removeClass(FOCUSED_ELEMENT_CLASS)
            }
            that._$focusedElement = $element;
            clearTimeout(that._focusTimeoutID);
            that._focusTimeoutID = setTimeout((function() {
                delete that._focusTimeoutID;
                that.renderFocusOverlay($element, isHideBorder);
                $element.addClass(FOCUSED_ELEMENT_CLASS);
                that.focused.fire($element)
            }))
        }
    };
    _proto.refocus = function() {
        var $focus = this.focus();
        this.focus($focus)
    };
    _proto.renderFocusOverlay = function($element, isHideBorder) {
        if (!_module_utils.default.isElementInCurrentGrid(this, $element)) {
            return
        }
        if (!this._$focusOverlay) {
            this._$focusOverlay = (0, _renderer.default)("<div>").addClass(this.addWidgetPrefix(FOCUS_OVERLAY_CLASS))
        }
        if (isHideBorder) {
            this._$focusOverlay.addClass(DX_HIDDEN)
        } else if ($element.length) {
            var align = _browser.default.mozilla ? "right bottom" : "left top";
            var $content = $element.closest(".".concat(this.addWidgetPrefix(CONTENT_CLASS)));
            var elemCoord = (0, _position2.getBoundingRect)($element.get(0));
            this._$focusOverlay.removeClass(DX_HIDDEN).appendTo($content);
            (0, _size.setOuterHeight)(this._$focusOverlay, elemCoord.bottom - elemCoord.top + 1);
            (0, _size.setOuterWidth)(this._$focusOverlay, elemCoord.right - elemCoord.left + 1);
            var focusOverlayPosition = {
                precise: true,
                my: align,
                at: align,
                of: $element,
                boundary: $content.length && $content
            };
            this._updateFocusOverlaySize(this._$focusOverlay, focusOverlayPosition);
            _position.default.setup(this._$focusOverlay, focusOverlayPosition);
            this._$focusOverlay.css("visibility", "visible")
        }
    };
    _proto.resize = function() {
        var $focusedElement = this._$focusedElement;
        if ($focusedElement) {
            this.focus($focusedElement)
        }
    };
    _proto.loseFocus = function() {
        this._$focusedElement && this._$focusedElement.removeClass(FOCUSED_ELEMENT_CLASS);
        this._$focusedElement = null;
        this._$focusOverlay && this._$focusOverlay.addClass(DX_HIDDEN)
    };
    _proto.init = function() {
        this.createAction("onEditorPreparing", {
            excludeValidators: ["disabled", "readOnly"],
            category: "rendering"
        });
        this.createAction("onEditorPrepared", {
            excludeValidators: ["disabled", "readOnly"],
            category: "rendering"
        });
        this._updateFocusHandler = this._updateFocusHandler || this.createAction(this._updateFocus.bind(this));
        this._subscribedContainerRoot = this._getContainerRoot();
        _events_engine.default.on(this._subscribedContainerRoot, UPDATE_FOCUS_EVENTS, this._updateFocusHandler);
        this._attachContainerEventHandlers()
    };
    _proto._getContainerRoot = function() {
        var _a;
        var $container = null === (_a = this.component) || void 0 === _a ? void 0 : _a.$element();
        var root = _dom_adapter.default.getRootNode(null === $container || void 0 === $container ? void 0 : $container.get(0));
        if (root.nodeType === Node.DOCUMENT_FRAGMENT_NODE && !root.host) {
            return _dom_adapter.default.getDocument()
        }
        return root
    };
    _proto._attachContainerEventHandlers = function() {
        var that = this;
        var $container = that.component && that.component.$element();
        if ($container) {
            _events_engine.default.on($container, (0, _index.addNamespace)("keydown", MODULE_NAMESPACE), (function(e) {
                if ("tab" === (0, _index.normalizeKeyName)(e)) {
                    that._updateFocusHandler(e)
                }
            }))
        }
    };
    _proto.dispose = function() {
        clearTimeout(this._focusTimeoutID);
        clearTimeout(this._updateFocusTimeoutID);
        _events_engine.default.off(this._subscribedContainerRoot, UPDATE_FOCUS_EVENTS, this._updateFocusHandler)
    };
    return EditorFactory
}(ViewControllerWithMixin);
exports.EditorFactory = EditorFactory;
var editorFactoryModule = {
    defaultOptions: function() {
        return {}
    },
    controllers: {
        editorFactory: EditorFactory
    }
};
exports.editorFactoryModule = editorFactoryModule;
