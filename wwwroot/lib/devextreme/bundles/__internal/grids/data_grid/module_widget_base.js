/**
 * DevExtreme (bundles/__internal/grids/data_grid/module_widget_base.js)
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
var _renderer = _interopRequireDefault(require("../../../core/renderer"));
var _component_registrator = _interopRequireDefault(require("../../../core/component_registrator"));
var _common = require("../../../core/utils/common");
var _type = require("../../../core/utils/type");
var _iterator = require("../../../core/utils/iterator");
var _extend = require("../../../core/utils/extend");
var _console = require("../../../core/utils/console");
var _browser = _interopRequireDefault(require("../../../core/utils/browser"));
var _ui = _interopRequireDefault(require("../../../ui/widget/ui.widget"));
var _themes = require("../../../ui/themes");
var _uiGrid_core = _interopRequireDefault(require("../../../ui/grid_core/ui.grid_core.utils"));
var _module_core = _interopRequireDefault(require("./module_core"));
require("./module_not_extended/column_headers");
require("./module_columns_controller");
require("./module_data_controller");
require("./module_not_extended/sorting");
require("./module_not_extended/rows");
require("./module_not_extended/context_menu");
require("./module_not_extended/error_handling");
require("./module_not_extended/grid_view");
require("./module_not_extended/header_panel");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var DATAGRID_ROW_SELECTOR = ".dx-row";
var DATAGRID_DEPRECATED_TEMPLATE_WARNING = "Specifying grid templates with the jQuery selector name is now deprecated. Use the DOM Node or the jQuery object that references this selector instead.";
_module_core.default.registerModulesOrder(["stateStoring", "columns", "selection", "editorFactory", "columnChooser", "grouping", "editing", "editingRowBased", "editingFormBased", "editingCellBased", "masterDetail", "validating", "adaptivity", "data", "virtualScrolling", "columnHeaders", "filterRow", "headerPanel", "headerFilter", "sorting", "search", "rows", "pager", "columnsResizingReordering", "contextMenu", "keyboardNavigation", "errorHandling", "summary", "columnFixing", "export", "gridView"]);
var DataGrid = _ui.default.inherit({
    _activeStateUnit: DATAGRID_ROW_SELECTOR,
    _getDefaultOptions: function() {
        var result = this.callBase();
        (0, _iterator.each)(_module_core.default.modules, (function() {
            if ((0, _type.isFunction)(this.defaultOptions)) {
                (0, _extend.extend)(true, result, this.defaultOptions())
            }
        }));
        return result
    },
    _setDeprecatedOptions: function() {
        this.callBase();
        (0, _extend.extend)(this._deprecatedOptions, {
            useKeyboard: {
                since: "19.2",
                alias: "keyboardNavigation.enabled"
            },
            rowTemplate: {
                since: "21.2",
                message: 'Use the "dataRowTemplate" option instead'
            },
            "columnChooser.allowSearch": {
                since: "23.1",
                message: 'Use the "columnChooser.search.enabled" option instead'
            },
            "columnChooser.searchTimeout": {
                since: "23.1",
                message: 'Use the "columnChooser.search.timeout" option instead'
            }
        })
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: {
                platform: "ios"
            },
            options: {
                showRowLines: true
            }
        }, {
            device: function() {
                return (0, _themes.isMaterial)()
            },
            options: {
                showRowLines: true,
                showColumnLines: false,
                headerFilter: {
                    height: 315
                },
                editing: {
                    useIcons: true
                },
                selection: {
                    showCheckBoxesMode: "always"
                }
            }
        }, {
            device: function() {
                return _browser.default.webkit
            },
            options: {
                loadingTimeout: 30,
                loadPanel: {
                    animation: {
                        show: {
                            easing: "cubic-bezier(1, 0, 1, 0)",
                            duration: 500,
                            from: {
                                opacity: 0
                            },
                            to: {
                                opacity: 1
                            }
                        }
                    }
                }
            }
        }, {
            device: function(_device) {
                return "desktop" !== _device.deviceType
            },
            options: {
                grouping: {
                    expandMode: "rowClick"
                }
            }
        }])
    },
    _init: function() {
        this.callBase();
        _uiGrid_core.default.logHeaderFilterDeprecatedWarningIfNeed(this);
        _module_core.default.processModules(this, _module_core.default);
        _module_core.default.callModuleItemsMethod(this, "init")
    },
    _clean: _common.noop,
    _optionChanged: function(args) {
        _module_core.default.callModuleItemsMethod(this, "optionChanged", [args]);
        if (!args.handled) {
            this.callBase(args)
        }
    },
    _dimensionChanged: function() {
        this.updateDimensions(true)
    },
    _visibilityChanged: function(visible) {
        if (visible) {
            this.updateDimensions()
        }
    },
    _initMarkup: function() {
        this.callBase.apply(this, arguments);
        this.getView("gridView").render(this.$element())
    },
    _renderContentImpl: function() {
        this.getView("gridView").update()
    },
    _renderContent: function() {
        var that = this;
        (0, _common.deferRender)((function() {
            that._renderContentImpl()
        }))
    },
    _getTemplate: function(templateName) {
        var template = templateName;
        if ((0, _type.isString)(template) && template.startsWith("#")) {
            template = (0, _renderer.default)(templateName);
            _console.logger.warn(DATAGRID_DEPRECATED_TEMPLATE_WARNING)
        }
        return this.callBase(template)
    },
    _dispose: function() {
        this.callBase();
        _module_core.default.callModuleItemsMethod(this, "dispose")
    },
    isReady: function() {
        return this.getController("data").isReady()
    },
    beginUpdate: function() {
        this.callBase();
        _module_core.default.callModuleItemsMethod(this, "beginUpdate")
    },
    endUpdate: function() {
        _module_core.default.callModuleItemsMethod(this, "endUpdate");
        this.callBase()
    },
    getController: function(name) {
        return this._controllers[name]
    },
    getView: function(name) {
        return this._views[name]
    },
    focus: function(element) {
        this.getController("keyboardNavigation").focus(element)
    }
});
DataGrid.registerModule = _module_core.default.registerModule.bind(_module_core.default);
(0, _component_registrator.default)("dxDataGrid", DataGrid);
var _default = DataGrid;
exports.default = _default;