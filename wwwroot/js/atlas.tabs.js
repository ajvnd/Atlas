function arrayConverter(strInput) {
    if (strInput !== null)
        return strInput.length > 0 && strInput.includes(",") ? strInput.split(",").map(Number) : [Number(strInput)];
}

function setResult() {
    let targetAction = $(".atlas-tab-content").dxTabs('instance').option('selectedItem').key;

    let url = "";
    switch (targetAction) {
        case 0:
            url = "/Products/List"
            break;
        case 1:
            url = "/Researchers/List"
            break;
        case 2:
            url = "/Institutes/List"
            break;
        case 3:
            url = "/Companies/List"
            break;
    }
    makePostCall(url, {
        provinceIds: arrayConverter(localStorage.getItem('f.province')),
        domainIds: arrayConverter(localStorage.getItem('f.domain')),
        isEnabled: localStorage.getItem('f.isEnabled') === 'true',
        isKnowledgeBased: localStorage.getItem('f.isKnowledgeBased') === 'true',
        hasSamta: localStorage.getItem('f.hasSamta') === 'true',
    }, (e) => {
        localStorage.setItem("f.result", JSON.stringify(e));
        let isMap = Boolean(localStorage.getItem('isMap')) === true;
        if (isMap) {
            let leftContent = $(".body-left-content").dxDataGrid('instance');
            let result = localStorage.getItem('f.result');
            leftContent.option("dataSource", JSON.parse(result));
        } else {
        }
    });


}

let state = {
    name: 'province',
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
        }),
        onContentReady: function (e) {
            e.component.option('value', arrayConverter(localStorage.getItem('f.province')))
        },
        onValueChanged: function (e) {
            if (e.value === undefined || e.value.length === 0)
                localStorage.removeItem("f.province")
            else
                localStorage.setItem('f.province', e.value);
        }
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
        }),
        onContentReady: function (e) {
            e.component.option('value', arrayConverter(localStorage.getItem('f.domain')))
        },
        onValueChanged: function (e) {
            if (e.value === undefined || e.value.length === 0)
                localStorage.removeItem("f.domain")
            else
                localStorage.setItem('f.domain', e.value);
        }
    }
}
let isEnabled = {
    label: {
        text: 'فعال'
    },
    editorType: 'dxSwitch',
    editorOptions: {
        onContentReady: function (e) {
            e.component.option('value', Boolean(localStorage.getItem('f.isEnabled')))
        },
        onValueChanged(e) {
            localStorage.setItem('f.isEnabled', e.value);
        }
    }
};
let isKnowledgeBased = {
    label: {
        text: 'دانش بنیان'
    },
    editorType: 'dxSwitch',
    editorOptions: {
        onContentReady: function (e) {
            e.component.option('value', Boolean(localStorage.getItem('f.isKnowledgeBased')))
        },
        onValueChanged(e) {
            localStorage.setItem('f.isKnowledgeBased', e.value);
        }
    }
};
let applyButton = {
    editorType: 'dxButton',
    editorOptions: {
        text: 'اعمال فیلتر',
        type: 'default',
        stylingMode: 'contained',
        onClick: setResult
    }
}
let products = [state,
    domain,
    isEnabled,
    applyButton
];

let researchers = [state,
    domain,
    isEnabled,
    applyButton
];

let organizations = [state, domain,
    isKnowledgeBased,
    isEnabled,
    applyButton
];

let companies = [state, domain,
    {
        label: {
            text: 'سمتا'
        },
        editorType: 'dxSwitch',
        editorOptions: {
            onContentReady: function (e) {
                e.component.option('value', Boolean(localStorage.getItem('f.hasSamta')))
            },
            onValueChanged(e) {
                localStorage.setItem('f.hasSamta', e.value);
            }
        }
    },
    isKnowledgeBased,
    isEnabled,
    applyButton
];

$(function () {

    $(".body-right-content").dxForm({
        items: products
    });

    $(".atlas-tab-content").dxTabs({
        keyExpr: 'key',
        selectedItem: 0,
        onItemClick: function (e) {
            let bodyRightContent = $(".body-right-content").dxForm('instance');
            bodyRightContent.dispose();
            setResult();

            const setContentItems = (items) => {
                $(".body-right-content").dxForm({items: items});
            }

            switch (e.itemData.key) {
                case 0:
                    setContentItems(products);
                    break;
                case 1:
                    setContentItems(researchers);
                    break;
                case 2:
                    setContentItems(organizations);
                    break;
                case 3:
                    setContentItems(companies);
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