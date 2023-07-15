/**
 * DevExtreme (bundles/__internal/grids/tree_list/selection/module.js)
 * Version: 23.1.3
 * Build date: Fri Jun 09 2023
 *
 * Copyright (c) 2012 - 2023 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = _interopRequireDefault(require("../../../../core/renderer"));
var _common = require("../../../../core/utils/common");
var _extend = require("../../../../core/utils/extend");
var _type = require("../../../../core/utils/type");
var _uiGrid_core = require("../../../../ui/grid_core/ui.grid_core.selection");
var _module_core = _interopRequireDefault(require("../module_core"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var TREELIST_SELECT_ALL_CLASS = "dx-treelist-select-all";
var CELL_FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled";
var SELECT_CHECKBOX_CLASS = "dx-select-checkbox";
var originalRowClick = _uiGrid_core.selectionModule.extenders.views.rowsView._rowClick;
var originalHandleDataChanged = _uiGrid_core.selectionModule.extenders.controllers.data._handleDataChanged;
var nodeExists = function(array, currentKey) {
    return !!array.filter((function(key) {
        return key === currentKey
    })).length
};
_module_core.default.registerModule("selection", (0, _extend.extend)(true, {}, _uiGrid_core.selectionModule, {
    defaultOptions: function() {
        return (0, _extend.extend)(true, _uiGrid_core.selectionModule.defaultOptions(), {
            selection: {
                showCheckBoxesMode: "always",
                recursive: false
            }
        })
    },
    extenders: {
        controllers: {
            data: {
                _handleDataChanged: function(e) {
                    var selectionController = this.getController("selection");
                    var isRecursiveSelection = selectionController.isRecursiveSelection();
                    if (isRecursiveSelection && (!e || "updateSelectionState" !== e.changeType)) {
                        selectionController.updateSelectionState({
                            selectedItemKeys: this.option("selectedRowKeys")
                        })
                    }
                    originalHandleDataChanged.apply(this, arguments)
                },
                loadDescendants: function() {
                    var that = this;
                    var d = that.callBase.apply(that, arguments);
                    var selectionController = that.getController("selection");
                    var isRecursiveSelection = selectionController.isRecursiveSelection();
                    if (isRecursiveSelection) {
                        d.done((function() {
                            selectionController.updateSelectionState({
                                selectedItemKeys: that.option("selectedRowKeys")
                            })
                        }))
                    }
                    return d
                }
            },
            selection: {
                init: function() {
                    this.callBase.apply(this, arguments);
                    this._selectionStateByKey = {}
                },
                _getSelectionConfig: function() {
                    var _arguments = arguments,
                        _this = this;
                    var config = this.callBase.apply(this, arguments);
                    var plainItems = config.plainItems;
                    config.plainItems = function(cached) {
                        var result;
                        if (cached) {
                            result = _this._dataController.getCachedStoreData()
                        }
                        result || (result = plainItems.apply(_this, _arguments).map((function(item) {
                            return item.data
                        })));
                        return result || []
                    };
                    config.isItemSelected = function(item) {
                        var key = _this._dataController.keyOf(item);
                        return _this.isRowSelected(key)
                    };
                    config.isSelectableItem = function(item) {
                        return !!item
                    };
                    config.getItemData = function(item) {
                        return item
                    };
                    config.allowLoadByRange = function() {
                        return false
                    };
                    return config
                },
                renderSelectCheckBoxContainer: function($container, model) {
                    var rowsView = this.component.getView("rowsView");
                    $container.addClass(CELL_FOCUS_DISABLED_CLASS);
                    var $checkbox = rowsView._renderSelectCheckBox($container, {
                        value: model.row.isSelected,
                        row: model.row,
                        column: model.column
                    });
                    rowsView._attachCheckBoxClickEvent($checkbox)
                },
                _updateSelectColumn: _common.noop,
                _getSelectAllNodeKeys: function() {
                    var component = this.component;
                    var root = component.getRootNode();
                    var cache = {};
                    var keys = [];
                    var isRecursiveSelection = this.isRecursiveSelection();
                    root && _module_core.default.foreachNodes(root.children, (function(node) {
                        if (void 0 !== node.key && (node.visible || isRecursiveSelection)) {
                            keys.push(node.key)
                        }
                        if (!node.visible) {
                            return true
                        }
                        return isRecursiveSelection ? false : component.isRowExpanded(node.key, cache)
                    }));
                    return keys
                },
                isSelectAll: function() {
                    var selectedRowKeys = this.option("selectedRowKeys") || [];
                    if (0 === selectedRowKeys.length) {
                        return false
                    }
                    var component = this.component;
                    var visibleKeys = this._getSelectAllNodeKeys();
                    var isRecursiveSelection = this.isRecursiveSelection();
                    var hasIndeterminateState = false;
                    var selectedVisibleKeys = visibleKeys.filter((function(key) {
                        var isRowSelected = component.isRowSelected(key, isRecursiveSelection);
                        if (void 0 === isRowSelected) {
                            hasIndeterminateState = true
                        }
                        return isRowSelected
                    }));
                    if (!selectedVisibleKeys.length) {
                        return hasIndeterminateState ? void 0 : false
                    }
                    if (selectedVisibleKeys.length === visibleKeys.length) {
                        return true
                    }
                    return
                },
                selectAll: function() {
                    var _this2 = this;
                    var visibleKeys = this._getSelectAllNodeKeys().filter((function(key) {
                        return !_this2.isRowSelected(key)
                    }));
                    this.focusedItemIndex(-1);
                    return this.selectRows(visibleKeys, true)
                },
                deselectAll: function() {
                    var visibleKeys = this._getSelectAllNodeKeys();
                    this.focusedItemIndex(-1);
                    return this.deselectRows(visibleKeys)
                },
                selectedItemKeys: function(value, preserve, isDeselect, isSelectAll) {
                    var that = this;
                    var selectedRowKeys = that.option("selectedRowKeys");
                    var isRecursiveSelection = this.isRecursiveSelection();
                    var normalizedArgs = isRecursiveSelection && that._normalizeSelectionArgs({
                        keys: (0, _type.isDefined)(value) ? value : []
                    }, preserve, !isDeselect);
                    if (normalizedArgs && !(0, _common.equalByValue)(normalizedArgs.selectedRowKeys, selectedRowKeys)) {
                        that._isSelectionNormalizing = true;
                        return this.callBase(normalizedArgs.selectedRowKeys, false, false, false).always((function() {
                            that._isSelectionNormalizing = false
                        })).done((function(items) {
                            normalizedArgs.selectedRowsData = items;
                            that._fireSelectionChanged(normalizedArgs)
                        }))
                    }
                    return this.callBase(value, preserve, isDeselect, isSelectAll)
                },
                changeItemSelection: function(itemIndex, keyboardKeys) {
                    var _this3 = this;
                    var isRecursiveSelection = this.isRecursiveSelection();
                    if (isRecursiveSelection && !keyboardKeys.shift) {
                        var key = this._dataController.getKeyByRowIndex(itemIndex);
                        return this.selectedItemKeys(key, true, this.isRowSelected(key)).done((function() {
                            _this3.isRowSelected(key) && _this3.callBase(itemIndex, keyboardKeys, true)
                        }))
                    }
                    return this.callBase.apply(this, arguments)
                },
                _updateParentSelectionState: function(node, isSelected) {
                    var that = this;
                    var state = isSelected;
                    var parentNode = node.parent;
                    if (parentNode) {
                        if (parentNode.children.length > 1) {
                            if (false === isSelected) {
                                var hasSelectedState = parentNode.children.some((function(childNode) {
                                    return that._selectionStateByKey[childNode.key]
                                }));
                                state = hasSelectedState ? void 0 : false
                            } else if (true === isSelected) {
                                var hasNonSelectedState = parentNode.children.some((function(childNode) {
                                    return !that._selectionStateByKey[childNode.key]
                                }));
                                state = hasNonSelectedState ? void 0 : true
                            }
                        }
                        this._selectionStateByKey[parentNode.key] = state;
                        if (parentNode.parent && parentNode.parent.level >= 0) {
                            this._updateParentSelectionState(parentNode, state)
                        }
                    }
                },
                _updateChildrenSelectionState: function(node, isSelected) {
                    var that = this;
                    var children = node.children;
                    children && children.forEach((function(childNode) {
                        that._selectionStateByKey[childNode.key] = isSelected;
                        if (childNode.children.length > 0) {
                            that._updateChildrenSelectionState(childNode, isSelected)
                        }
                    }))
                },
                _updateSelectionStateCore: function(keys, isSelected) {
                    var dataController = this._dataController;
                    for (var i = 0; i < keys.length; i++) {
                        this._selectionStateByKey[keys[i]] = isSelected;
                        var node = dataController.getNodeByKey(keys[i]);
                        if (node) {
                            this._updateParentSelectionState(node, isSelected);
                            this._updateChildrenSelectionState(node, isSelected)
                        }
                    }
                },
                _getSelectedParentKeys: function(key, selectedItemKeys, useCash) {
                    var selectedParentNode;
                    var node = this._dataController.getNodeByKey(key);
                    var parentNode = node && node.parent;
                    var result = [];
                    while (parentNode && parentNode.level >= 0) {
                        result.unshift(parentNode.key);
                        var isSelected = useCash ? !nodeExists(selectedItemKeys, parentNode.key) && this.isRowSelected(parentNode.key) : selectedItemKeys.indexOf(parentNode.key) >= 0;
                        if (isSelected) {
                            selectedParentNode = parentNode;
                            result = this._getSelectedParentKeys(selectedParentNode.key, selectedItemKeys, useCash).concat(result);
                            break
                        } else if (useCash) {
                            break
                        }
                        parentNode = parentNode.parent
                    }
                    return selectedParentNode && result || []
                },
                _getSelectedChildKeys: function(key, keysToIgnore) {
                    var _this4 = this;
                    var childKeys = [];
                    var node = this._dataController.getNodeByKey(key);
                    node && _module_core.default.foreachNodes(node.children, (function(childNode) {
                        var ignoreKeyIndex = keysToIgnore.indexOf(childNode.key);
                        if (ignoreKeyIndex < 0) {
                            childKeys.push(childNode.key)
                        }
                        return ignoreKeyIndex > 0 || ignoreKeyIndex < 0 && void 0 === _this4._selectionStateByKey[childNode.key]
                    }));
                    return childKeys
                },
                _normalizeParentKeys: function(key, args) {
                    var keysToIgnore = [key];
                    var parentNodeKeys = this._getSelectedParentKeys(key, args.selectedRowKeys);
                    if (parentNodeKeys.length) {
                        keysToIgnore = keysToIgnore.concat(parentNodeKeys);
                        keysToIgnore.forEach((function(key) {
                            var index = args.selectedRowKeys.indexOf(key);
                            if (index >= 0) {
                                args.selectedRowKeys.splice(index, 1)
                            }
                        }));
                        var childKeys = this._getSelectedChildKeys(parentNodeKeys[0], keysToIgnore);
                        args.selectedRowKeys = args.selectedRowKeys.concat(childKeys)
                    }
                },
                _normalizeChildrenKeys: function(key, args) {
                    var _this5 = this;
                    var node = this._dataController.getNodeByKey(key);
                    node && node.children.forEach((function(childNode) {
                        var index = args.selectedRowKeys.indexOf(childNode.key);
                        if (index >= 0) {
                            args.selectedRowKeys.splice(index, 1)
                        }
                        _this5._normalizeChildrenKeys(childNode.key, args)
                    }))
                },
                _normalizeSelectedRowKeysCore: function(keys, args, preserve, isSelect) {
                    var that = this;
                    keys.forEach((function(key) {
                        if (preserve && that.isRowSelected(key) === isSelect) {
                            return
                        }
                        that._normalizeChildrenKeys(key, args);
                        var index = args.selectedRowKeys.indexOf(key);
                        if (isSelect) {
                            if (index < 0) {
                                args.selectedRowKeys.push(key)
                            }
                            args.currentSelectedRowKeys.push(key)
                        } else {
                            if (index >= 0) {
                                args.selectedRowKeys.splice(index, 1)
                            }
                            args.currentDeselectedRowKeys.push(key);
                            that._normalizeParentKeys(key, args)
                        }
                    }))
                },
                _normalizeSelectionArgs: function(args, preserve, isSelect) {
                    var result;
                    var keys = Array.isArray(args.keys) ? args.keys : [args.keys];
                    var selectedRowKeys = this.option("selectedRowKeys") || [];
                    if (keys.length) {
                        result = {
                            currentSelectedRowKeys: [],
                            currentDeselectedRowKeys: [],
                            selectedRowKeys: preserve ? selectedRowKeys.slice(0) : []
                        };
                        this._normalizeSelectedRowKeysCore(keys, result, preserve, isSelect)
                    }
                    return result
                },
                _updateSelectedItems: function(args) {
                    this.updateSelectionState(args);
                    this.callBase(args)
                },
                _fireSelectionChanged: function() {
                    if (!this._isSelectionNormalizing) {
                        this.callBase.apply(this, arguments)
                    }
                },
                _isModeLeavesOnly: function(mode) {
                    return "leavesOnly" === mode
                },
                _removeDuplicatedKeys: function(keys) {
                    var result = [];
                    var processedKeys = {};
                    keys.forEach((function(key) {
                        if (!processedKeys[key]) {
                            processedKeys[key] = true;
                            result.push(key)
                        }
                    }));
                    return result
                },
                _getAllChildKeys: function(key) {
                    var childKeys = [];
                    var node = this._dataController.getNodeByKey(key);
                    node && _module_core.default.foreachNodes(node.children, (function(childNode) {
                        childKeys.push(childNode.key)
                    }), true);
                    return childKeys
                },
                _getAllSelectedRowKeys: function(keys) {
                    var _this6 = this;
                    var result = [];
                    keys.forEach((function(key) {
                        var parentKeys = _this6._getSelectedParentKeys(key, [], true);
                        var childKeys = _this6._getAllChildKeys(key);
                        result.push.apply(result, parentKeys.concat([key], childKeys))
                    }));
                    result = this._removeDuplicatedKeys(result);
                    return result
                },
                _getParentSelectedRowKeys: function(keys) {
                    var that = this;
                    var result = [];
                    keys.forEach((function(key) {
                        var parentKeys = that._getSelectedParentKeys(key, keys);
                        !parentKeys.length && result.push(key)
                    }));
                    return result
                },
                _getLeafSelectedRowKeys: function(keys) {
                    var result = [];
                    var dataController = this._dataController;
                    keys.forEach((function(key) {
                        var node = dataController.getNodeByKey(key);
                        node && !node.hasChildren && result.push(key)
                    }));
                    return result
                },
                isRecursiveSelection: function() {
                    var selectionMode = this.option("selection.mode");
                    var isRecursive = this.option("selection.recursive");
                    return "multiple" === selectionMode && isRecursive
                },
                updateSelectionState: function(options) {
                    var removedItemKeys = options.removedItemKeys || [];
                    var selectedItemKeys = options.selectedItemKeys || [];
                    if (this.isRecursiveSelection()) {
                        this._updateSelectionStateCore(removedItemKeys, false);
                        this._updateSelectionStateCore(selectedItemKeys, true)
                    }
                },
                isRowSelected: function(key, isRecursiveSelection) {
                    var result = this.callBase.apply(this, arguments);
                    isRecursiveSelection = null !== isRecursiveSelection && void 0 !== isRecursiveSelection ? isRecursiveSelection : this.isRecursiveSelection();
                    if (!result && isRecursiveSelection) {
                        if (key in this._selectionStateByKey) {
                            return this._selectionStateByKey[key]
                        }
                        return false
                    }
                    return result
                },
                getSelectedRowKeys: function(mode) {
                    var that = this;
                    if (!that._dataController) {
                        return []
                    }
                    var selectedRowKeys = that.callBase.apply(that, arguments);
                    if (mode) {
                        if (this.isRecursiveSelection()) {
                            selectedRowKeys = this._getAllSelectedRowKeys(selectedRowKeys)
                        }
                        if ("all" !== mode) {
                            if ("excludeRecursive" === mode) {
                                selectedRowKeys = that._getParentSelectedRowKeys(selectedRowKeys)
                            } else if (that._isModeLeavesOnly(mode)) {
                                selectedRowKeys = that._getLeafSelectedRowKeys(selectedRowKeys)
                            }
                        }
                    }
                    return selectedRowKeys
                },
                getSelectedRowsData: function(mode) {
                    var dataController = this._dataController;
                    var selectedKeys = this.getSelectedRowKeys(mode) || [];
                    var selectedRowsData = [];
                    selectedKeys.forEach((function(key) {
                        var node = dataController.getNodeByKey(key);
                        node && selectedRowsData.push(node.data)
                    }));
                    return selectedRowsData
                },
                refresh: function() {
                    this._selectionStateByKey = {};
                    return this.callBase.apply(this, arguments)
                }
            }
        },
        views: {
            columnHeadersView: {
                _processTemplate: function(template, options) {
                    var that = this;
                    var resultTemplate;
                    var renderingTemplate = this.callBase(template, options);
                    var firstDataColumnIndex = that._columnsController.getFirstDataColumnIndex();
                    if (renderingTemplate && "header" === options.rowType && options.column.index === firstDataColumnIndex) {
                        resultTemplate = {
                            render: function(options) {
                                if ("multiple" === that.option("selection.mode")) {
                                    that.renderSelectAll(options.container, options.model)
                                }
                                renderingTemplate.render(options)
                            }
                        }
                    } else {
                        resultTemplate = renderingTemplate
                    }
                    return resultTemplate
                },
                renderSelectAll: function($cell, options) {
                    $cell.addClass(TREELIST_SELECT_ALL_CLASS);
                    this._renderSelectAllCheckBox($cell)
                },
                _isSortableElement: function($target) {
                    return this.callBase($target) && !$target.closest(".".concat(SELECT_CHECKBOX_CLASS)).length
                }
            },
            rowsView: {
                _renderIcons: function($iconContainer, options) {
                    this.callBase.apply(this, arguments);
                    if (!options.row.isNewRow && "multiple" === this.option("selection.mode")) {
                        this.getController("selection").renderSelectCheckBoxContainer($iconContainer, options)
                    }
                    return $iconContainer
                },
                _rowClick: function(e) {
                    var $targetElement = (0, _renderer.default)(e.event.target);
                    if (this.isExpandIcon($targetElement)) {
                        this.callBase.apply(this, arguments)
                    } else {
                        originalRowClick.apply(this, arguments)
                    }
                }
            }
        }
    }
}));
