let state = {
    label: {
        text: 'استان'
    },
    editorType: 'dxTagBox',
    editorOptions: {
        valueExpr: "id",
        displayExpr: 'title',
        showSelectionControls: true,
        dataSource: new DevExpress.data.CustomStore({
            key: "id",
            load: function (options) {
                return devextremeLoadCall("/Provinces/List/", {}, false);
            },
            byKey: function (key) {
                return devextremeByKeyCall(`/Provinces/Get/${key}`);
            }
        })
    }
};

let domain = {
    label: {
        text: 'حوزه همکاری'
    },
    editorType: 'dxTagBox',
    editorOptions: {
        valueExpr: "id",
        displayExpr: 'title',
        showSelectionControls: true,
        dataSource: new DevExpress.data.CustomStore({
            key: "id",
            load: function (options) {
                return devextremeLoadCall("/Domains/List/", {}, false);
            },
            byKey: function (key) {
                return devextremeByKeyCall(`/Domains/Get/${key}`);
            }
        })
    }
}

let status = {
    label: {
        text: 'فعال'
    },
    editorType: 'dxSwitch',
};

let knowledgeBased = {
    label: {
        text: 'دانش بنیان'
    },
    editorType: 'dxSwitch',
};

let products = [state,
    domain,
    status
];

let researchers = [state,
    domain,
    status
];

let organizations = [state, domain,
    knowledgeBased,
    status,
];

let companies = [state, domain,
    {
        label: {
            text: 'سمتا'
        },
        editorType: 'dxSwitch',
    },
    knowledgeBased,
    status
];
