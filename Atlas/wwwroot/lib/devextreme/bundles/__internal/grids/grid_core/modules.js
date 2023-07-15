/**
 * DevExtreme (bundles/__internal/grids/grid_core/modules.js)
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
exports.processModules = processModules;
var _renderer = _interopRequireDefault(require("../../../core/renderer"));
var _class = _interopRequireDefault(require("../../../core/class"));
var _callbacks = _interopRequireDefault(require("../../../core/utils/callbacks"));
var _common = require("../../../core/utils/common");
var _type = require("../../../core/utils/type");
var _iterator = require("../../../core/utils/iterator");
var _message = _interopRequireDefault(require("../../../localization/message"));
var _window = require("../../../core/utils/window");
var _ui = _interopRequireDefault(require("../../../ui/widget/ui.errors"));

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

function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest()
}

function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
}

function _unsupportedIterableToArray(o, minLen) {
    if (!o) {
        return
    }
    if ("string" === typeof o) {
        return _arrayLikeToArray(o, minLen)
    }
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if ("Object" === n && o.constructor) {
        n = o.constructor.name
    }
    if ("Map" === n || "Set" === n) {
        return Array.from(o)
    }
    if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) {
        return _arrayLikeToArray(o, minLen)
    }
}

function _arrayLikeToArray(arr, len) {
    if (null == len || len > arr.length) {
        len = arr.length
    }
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i]
    }
    return arr2
}

function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
        var _s, _e, _x, _r, _arr = [],
            _n = !0,
            _d = !1;
        try {
            if (_x = (_i = _i.call(arr)).next, 0 === i) {
                if (Object(_i) !== _i) {
                    return
                }
                _n = !1
            } else {
                for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) {}
            }
        } catch (err) {
            _d = !0, _e = err
        } finally {
            try {
                if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) {
                    return
                }
            } finally {
                if (_d) {
                    throw _e
                }
            }
        }
        return _arr
    }
}

function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) {
        return arr
    }
}
var WIDGET_WITH_LEGACY_CONTAINER_NAME = "dxDataGrid";
var ModuleItem = _class.default.inherit({
    _endUpdateCore: function() {},
    ctor: function(component) {
        var that = this;
        that._updateLockCount = 0;
        that.component = component;
        that._actions = {};
        that._actionConfigs = {};
        (0, _iterator.each)(this.callbackNames() || [], (function(index, name) {
            var flags = that.callbackFlags(name) || {};
            flags.unique = true;
            flags.syncStrategy = true;
            that[this] = (0, _callbacks.default)(flags)
        }))
    },
    init: function() {},
    callbackNames: function() {},
    callbackFlags: function() {},
    publicMethods: function() {},
    beginUpdate: function() {
        this._updateLockCount++
    },
    endUpdate: function() {
        if (this._updateLockCount > 0) {
            this._updateLockCount--;
            if (!this._updateLockCount) {
                this._endUpdateCore()
            }
        }
    },
    option: function(name) {
        var component = this.component;
        var optionCache = component._optionCache;
        if (1 === arguments.length && optionCache) {
            if (!(name in optionCache)) {
                optionCache[name] = component.option(name)
            }
            return optionCache[name]
        }
        return component.option.apply(component, arguments)
    },
    _silentOption: function(name, value) {
        var component = this.component;
        var optionCache = component._optionCache;
        if (optionCache) {
            optionCache[name] = value
        }
        return component._setOptionWithoutOptionChange(name, value)
    },
    localize: function(name) {
        var optionCache = this.component._optionCache;
        if (optionCache) {
            if (!(name in optionCache)) {
                optionCache[name] = _message.default.format(name)
            }
            return optionCache[name]
        }
        return _message.default.format(name)
    },
    on: function() {
        return this.component.on.apply(this.component, arguments)
    },
    off: function() {
        return this.component.off.apply(this.component, arguments)
    },
    optionChanged: function(args) {
        if (args.name in this._actions) {
            this.createAction(args.name, this._actionConfigs[args.name]);
            args.handled = true
        }
    },
    getAction: function(actionName) {
        return this._actions[actionName]
    },
    setAria: function(name, value, $target) {
        var target = $target.get(0);
        var prefix = "role" !== name && "id" !== name ? "aria-" : "";
        if (target.setAttribute) {
            target.setAttribute(prefix + name, value)
        } else {
            $target.attr(prefix + name, value)
        }
    },
    _createComponent: function() {
        return this.component._createComponent.apply(this.component, arguments)
    },
    getController: function(name) {
        return this.component._controllers[name]
    },
    createAction: function(actionName, config) {
        if ((0, _type.isFunction)(actionName)) {
            var action = this.component._createAction(actionName.bind(this), config);
            return function(e) {
                action({
                    event: e
                })
            }
        }
        this._actions[actionName] = this.component._createActionByOption(actionName, config);
        this._actionConfigs[actionName] = config;
        return
    },
    executeAction: function(actionName, options) {
        var action = this._actions[actionName];
        return action && action(options)
    },
    dispose: function() {
        var that = this;
        (0, _iterator.each)(that.callbackNames() || [], (function() {
            that[this].empty()
        }))
    },
    addWidgetPrefix: function(className) {
        var componentName = this.component.NAME;
        return "dx-".concat(componentName.slice(2).toLowerCase()).concat(className ? "-".concat(className) : "")
    },
    getWidgetContainerClass: function() {
        var containerName = this.component.NAME === WIDGET_WITH_LEGACY_CONTAINER_NAME ? null : "container";
        return this.addWidgetPrefix(containerName)
    },
    elementIsInsideGrid: function($element) {
        var $gridElement = $element.closest(".".concat(this.getWidgetContainerClass())).parent();
        return $gridElement.is(this.component.$element())
    }
});
var Controller = ModuleItem;
var ViewController = Controller.inherit({
    getView: function(name) {
        return this.component._views[name]
    },
    getViews: function() {
        return this.component._views
    }
});
var View = ModuleItem.inherit({
    _isReady: function() {
        return this.component.isReady()
    },
    _endUpdateCore: function() {
        this.callBase();
        if (!this._isReady() && this._requireReady) {
            this._requireRender = false;
            this.component._requireResize = false
        }
        if (this._requireRender) {
            this._requireRender = false;
            this.render(this._$parent)
        }
    },
    _invalidate: function(requireResize, requireReady) {
        this._requireRender = true;
        this.component._requireResize = (0, _window.hasWindow)() && (this.component._requireResize || requireResize);
        this._requireReady = this._requireReady || requireReady
    },
    _renderCore: function() {},
    _resizeCore: function() {},
    _parentElement: function() {
        return this._$parent
    },
    ctor: function(component) {
        this.callBase(component);
        this.renderCompleted = (0, _callbacks.default)();
        this.resizeCompleted = (0, _callbacks.default)()
    },
    element: function() {
        return this._$element
    },
    getElementHeight: function() {
        var $element = this.element();
        if (!$element) {
            return 0
        }
        var marginTop = parseFloat($element.css("marginTop")) || 0;
        var marginBottom = parseFloat($element.css("marginBottom")) || 0;
        var _$element$get = $element.get(0),
            offsetHeight = _$element$get.offsetHeight;
        return offsetHeight + marginTop + marginBottom
    },
    isVisible: function() {
        return true
    },
    getTemplate: function(name) {
        return this.component._getTemplate(name)
    },
    render: function($parent, options) {
        var _this = this;
        var $element = this._$element;
        var isVisible = this.isVisible();
        if (!$element && !$parent) {
            return
        }
        this._requireReady = false;
        if (!$element) {
            $element = this._$element = (0, _renderer.default)("<div>").appendTo($parent);
            this._$parent = $parent
        }
        $element.toggleClass("dx-hidden", !isVisible);
        if (isVisible) {
            this.component._optionCache = {};
            var deferred = this._renderCore(options);
            this.component._optionCache = void 0;
            if (deferred) {
                deferred.done((function() {
                    _this.renderCompleted.fire(options)
                }))
            } else {
                this.renderCompleted.fire(options)
            }
        }
    },
    resize: function() {
        this.isResizing = true;
        this._resizeCore();
        this.resizeCompleted.fire();
        this.isResizing = false
    },
    focus: function(preventScroll) {
        this.element().get(0).focus({
            preventScroll: preventScroll
        })
    }
});
var MODULES_ORDER_MAX_INDEX = 1e6;

function getExtendedTypes(types) {
    var moduleExtenders = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    var extendTypes = {};
    Object.entries(moduleExtenders).forEach((function(_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            name = _ref2[0],
            extender = _ref2[1];
        var currentType = types[name];
        if (currentType) {
            if ((0, _type.isFunction)(extender)) {
                extendTypes[name] = extender(currentType)
            } else {
                var classType = currentType;
                extendTypes[name] = classType.inherit(extender)
            }
        }
    }));
    return extendTypes
}

function registerPublicMethods(componentInstance, name, moduleItem) {
    var publicMethods = moduleItem.publicMethods();
    if (publicMethods) {
        (0, _iterator.each)(publicMethods, (function(_, methodName) {
            if (moduleItem[methodName]) {
                if (!componentInstance[methodName]) {
                    componentInstance[methodName] = function() {
                        return moduleItem[methodName].apply(moduleItem, arguments)
                    }
                } else {
                    throw _ui.default.Error("E1005", methodName)
                }
            } else {
                throw _ui.default.Error("E1006", name, methodName)
            }
        }))
    }
}

function processModules(componentInstance, componentClass) {
    var modules = componentClass.modules;
    var modulesOrder = componentClass.modulesOrder;

    function createModuleItems(moduleTypes) {
        var moduleItems = {};
        (0, _iterator.each)(moduleTypes, (function(name, moduleType) {
            var moduleItem = new moduleType(componentInstance);
            moduleItem.name = name;
            registerPublicMethods(componentInstance, name, moduleItem);
            moduleItems[name] = moduleItem
        }));
        return moduleItems
    }
    if (modulesOrder) {
        modules.sort((function(module1, module2) {
            var orderIndex1 = modulesOrder.indexOf(module1.name);
            var orderIndex2 = modulesOrder.indexOf(module2.name);
            if (orderIndex1 < 0) {
                orderIndex1 = MODULES_ORDER_MAX_INDEX
            }
            if (orderIndex2 < 0) {
                orderIndex2 = MODULES_ORDER_MAX_INDEX
            }
            return orderIndex1 - orderIndex2
        }))
    }
    var rootControllerTypes = {};
    var rootViewTypes = {};
    modules.forEach((function(_ref3) {
        var moduleName = _ref3.name,
            _ref3$controllers = _ref3.controllers,
            controllers = void 0 === _ref3$controllers ? {} : _ref3$controllers,
            _ref3$views = _ref3.views,
            views = void 0 === _ref3$views ? {} : _ref3$views;
        Object.entries(controllers).forEach((function(_ref4) {
            var _ref5 = _slicedToArray(_ref4, 2),
                name = _ref5[0],
                type = _ref5[1];
            var _a;
            if (rootControllerTypes[name]) {
                throw _ui.default.Error("E1001", moduleName, name)
            } else if (!(null === (_a = null === type || void 0 === type ? void 0 : type.subclassOf) || void 0 === _a ? void 0 : _a.call(type, Controller))) {
                throw _ui.default.Error("E1002", moduleName, name)
            }
            rootControllerTypes[name] = type
        }));
        Object.entries(views).forEach((function(_ref6) {
            var _ref7 = _slicedToArray(_ref6, 2),
                name = _ref7[0],
                type = _ref7[1];
            var _a;
            if (rootViewTypes[name]) {
                throw _ui.default.Error("E1003", moduleName, name)
            } else if (!(null === (_a = null === type || void 0 === type ? void 0 : type.subclassOf) || void 0 === _a ? void 0 : _a.call(type, View))) {
                throw _ui.default.Error("E1004", moduleName, name)
            }
            rootViewTypes[name] = type
        }))
    }));
    var moduleExtenders = modules.filter((function(_ref8) {
        var extenders = _ref8.extenders;
        return !!extenders
    }));
    var controllerTypes = moduleExtenders.reduce((function(types, _ref9) {
        var extenders = _ref9.extenders;
        return _extends(_extends({}, types), getExtendedTypes(types, null === extenders || void 0 === extenders ? void 0 : extenders.controllers))
    }), rootControllerTypes);
    var viewTypes = moduleExtenders.reduce((function(types, _ref10) {
        var extenders = _ref10.extenders;
        return _extends(_extends({}, types), getExtendedTypes(types, null === extenders || void 0 === extenders ? void 0 : extenders.views))
    }), rootViewTypes);
    componentInstance._controllers = createModuleItems(controllerTypes);
    componentInstance._views = createModuleItems(viewTypes)
}
var callModuleItemsMethod = function(that, methodName, args) {
    args = args || [];
    if (that._controllers) {
        (0, _iterator.each)(that._controllers, (function() {
            this[methodName] && this[methodName].apply(this, args)
        }))
    }
    if (that._views) {
        (0, _iterator.each)(that._views, (function() {
            this[methodName] && this[methodName].apply(this, args)
        }))
    }
};
var _default = {
    modules: [],
    View: View,
    ViewController: ViewController,
    Controller: Controller,
    registerModule: function(name, module) {
        var modules = this.modules;
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].name === name) {
                return
            }
        }
        module.name = name;
        modules.push(module)
    },
    registerModulesOrder: function(moduleNames) {
        this.modulesOrder = moduleNames
    },
    unregisterModule: function(name) {
        this.modules = (0, _common.grep)(this.modules, (function(module) {
            return module.name !== name
        }))
    },
    processModules: processModules,
    callModuleItemsMethod: callModuleItemsMethod
};
exports.default = _default;
