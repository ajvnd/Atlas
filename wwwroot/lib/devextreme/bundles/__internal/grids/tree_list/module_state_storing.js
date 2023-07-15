/**
 * DevExtreme (bundles/__internal/grids/tree_list/module_state_storing.js)
 * Version: 23.1.3
 * Build date: Fri Jun 09 2023
 *
 * Copyright (c) 2012 - 2023 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _extend = require("../../../core/utils/extend");
var _uiGrid_core = require("../../../ui/grid_core/ui.grid_core.state_storing");
var _module_core = _interopRequireDefault(require("./module_core"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    }
}
var origApplyState = _uiGrid_core.stateStoringModule.extenders.controllers.stateStoring.applyState;
_module_core.default.registerModule("stateStoring", (0, _extend.extend)(true, {}, _uiGrid_core.stateStoringModule, {
    extenders: {
        controllers: {
            stateStoring: {
                applyState: function(state) {
                    origApplyState.apply(this, arguments);
                    this.option("expandedRowKeys", state.expandedRowKeys ? state.expandedRowKeys.slice() : [])
                }
            },
            data: {
                getUserState: function() {
                    var state = this.callBase.apply(this, arguments);
                    if (!this.option("autoExpandAll")) {
                        state.expandedRowKeys = this.option("expandedRowKeys")
                    }
                    return state
                }
            }
        }
    }
}));
