$(function () {
    DevExpress.config({
        floatingActionButtonConfig: {
            position: {
                my: "right bottom",
                at: "right bottom",
                of: ".body-left",
                offset: "-16 -16"
            }
        }
    });

    localStorage.setItem('isMap', 'map');

    $(".map-switch").dxSpeedDialAction({
        hint: "Edit",
        icon: "map",
        onClick: function (e) {
            let icon = e.component.option('icon')
            let leftContent = $(".body-left-content");

            if (icon === 'map') {
                leftContent.dxVectorMap('instance').dispose();
            } else {
                leftContent.dxDataGrid('instance').dispose();
            }

            let iconRes = icon === 'map' ? 'smalliconslayout' : 'map';
            e.component.option('icon', iconRes)
            localStorage.setItem("isMap", iconRes);

            if (iconRes === 'map') {
                leftContent.dxVectorMap(vectorMap);
            } else {
                leftContent.dxDataGrid(grid)
            }
            
            setResult();
        }
    });


    let vectorMap = {
        zoomFactor: 2.5,
        width: "100%",
        height: "100%",
        bounds: [43.13321914472885, 50.83717618250027, 61.96, 8.33],
        tooltip: {
            enabled: true,
            customizeTooltip(arg) {
                if (arg.layer.type === 'marker') {
                    return {text: arg.attribute('name')};
                }
                return null;
            },
        },
        layers: [{
            name: 'areas',
            dataSource: DevExpress.viz.map.sources.eurasia
        },
            {
                dataSource: markersArray,
            }],
        controlBar: {enabled: false},
    };

    let grid = {
        keyExpr: 'id',
        columns: [
            {
                name: 'id',
                dataField: 'id',
                visible: false,
            },
            {
                name: 'title',
                dataField: 'title',
                caption: 'عنوان',
                calculateDisplayValue: (e) => {
                    if (e.hasOwnProperty("firstName") || e.hasOwnProperty("lastName"))
                        return `${e.firstName} ${e.lastName}`;
                    else
                        return e.title;
                },
            },
            {
                name: 'domainId',
                dataField: 'domainId',
                caption: 'زمینه',
                calculateDisplayValue: 'domain.title',
            },
            {
                name: 'provinceId',
                dataField: 'provinceId',
                caption: 'زمینه',
                calculateDisplayValue: 'province.title',
            },
            {
                name: 'isEnabled',
                dataField: 'isEnabled',
                caption: 'فعال',
            },
            {
                name: 'persianModifiedDate',
                dataField: 'persianModifiedDate',
                caption: 'تاریخ آخرین تغییر',
            },
            {
                type: 'buttons',
                buttons: [{
                    icon: 'arrowleft',
                    onClick(e) {
                        let atalsItemPopUp = $(".atals-item-popup").dxPopup('instance');
                        atalsItemPopUp.option('contentTemplate', () => {
                            let items = []
                            if (e.row.data.hasOwnProperty("title")) {
                                items.push({
                                    dataField: 'title',
                                    label: {
                                        text: 'عنوان'
                                    }
                                })
                            }
                            if (e.row.data.hasOwnProperty("firstName")) {
                                items.push({
                                    dataField: 'firstName',
                                    label: {
                                        text: 'نام'
                                    }
                                })
                            }

                            if (e.row.data.hasOwnProperty("lastName")) {
                                items.push({
                                    dataField: 'lastName',
                                    label: {
                                        text: 'نام خانوادگی'
                                    }
                                })
                            }
                            items.push({
                                dataField: 'domain.title',
                                label: {
                                    text: 'زمینه'
                                }
                            })

                            items.push({
                                dataField: 'province.title',
                                label: {
                                    text: 'استان'
                                }
                            })

                            if (e.row.data.hasOwnProperty("contractType")) {
                                items.push({
                                    dataField: 'contractType.title',
                                    label: {
                                        text: 'نوع قرار داد'
                                    }
                                })
                            }

                            return $("<div>").dxForm({
                                colCount: 2,
                                formData: e.row.data,
                                items: items
                            })
                        })
                        atalsItemPopUp.show();
                    }
                }]
            }
        ]

    }

    $(".body-left-content").dxVectorMap(vectorMap);
    
    $(".atals-item-popup").dxPopup({
        title: 'جزئیات',
        showCloseButton: true,
    });
});