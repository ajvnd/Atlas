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
        text: localStorage.getItem('f.text'),
        provinceIds: arrayConverter(localStorage.getItem('f.province')),
        domainIds: arrayConverter(localStorage.getItem('f.domain')),
        contractTypeIds: arrayConverter(localStorage.getItem('f.contractType')),
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

let text = {
    name: 'text',
    label: {
        text: 'عنوان'
    },
    editorType: 'dxTextBox',
    editorOptions: {
        onContentReady: function (e) {
            e.component.option('value', localStorage.getItem('f.text'))
        },
        onValueChanged: function (e) {
            if (e.value === undefined || e.value.length === 0)
                localStorage.removeItem("f.text")
            else
                localStorage.setItem('f.text', e.value);
        }
    }
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

let contractType = {
    label: {
        text: 'نوع قرارداد'
    },
    editorType: 'dxTagBox',
    editorOptions: {
        valueExpr: "id",
        displayExpr: 'title',
        showSelectionControls: true,
        dataSource: new DevExpress.data.CustomStore({
            key: "id",
            load: function (options) {
                return devextremeLoadCall("/ContractTypes/List/", {}, false);
            },
            byKey: function (key) {
                return devextremeByKeyCall(`/ContractTypes/Get/${key}`);
            }
        }),
        onContentReady: function (e) {
            e.component.option('value', arrayConverter(localStorage.getItem('f.contractType')))
        },
        onValueChanged: function (e) {
            if (e.value === undefined || e.value.length === 0)
                localStorage.removeItem("f.contractType")
            else
                localStorage.setItem('f.contractType', e.value);
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
let products = [
    text,
    state,
    domain,
    isEnabled,
    applyButton
];

let researchers = [
    text,
    state,
    domain,
    isEnabled,
    applyButton
];

let organizations = [
    text,
    state,
    domain,
    {
        itemType: 'group',
        colCount: 2,
        items: [
            isKnowledgeBased,
            isEnabled,
        ]
    },
    applyButton
];

let companies = [
    text,
    state,
    domain,
    contractType,
    {
        itemType: 'group',
        colCount: 3,
        items: [
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
        ]
    },
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