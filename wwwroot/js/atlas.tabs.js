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

$(function () {
    
    $(".body-right-content").dxForm({
        items:products
    });
    
    $(".atlas-tab-content").dxTabs({
        keyExpr: 'key',
        selectedItem: 0,
        onItemClick: function (e) {
            let bodyRightContent = $(".body-right-content").dxForm('instance');
            switch (e.itemData.key) {
                case 0:
                    bodyRightContent.option('items', products);
                    break;
                case 1:
                    bodyRightContent.option('items', researchers);
                    break;
                case 2:
                    bodyRightContent.option('items', organizations);
                    break;
                case 3:
                    bodyRightContent.option('items', companies);
                    break;
            }
        },
        items: [
            {
                key: 0,
                template: '<div><i class="dx-icon dx-icon-product atlas-tab-content-icon">محصولات</i></div> ',

            }, {
                key: 1,
                template: '<div><i class="dx-icon dx-icon-group atlas-tab-content-icon">محققین</i></div>'
            }, {
                key: 2,
                template: '<div><i class="dx-icon dx-icon-home atlas-tab-content-icon">موسسات</i></div>'
            }, {
                key: 3,
                template: '<div><i class="dx-icon dx-icon-globe atlas-tab-content-icon">شرکت ها</i></div>'
            }]
    });
});