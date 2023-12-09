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
                caption: 'عنوان'
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
                name: 'modifiedDate',
                dataField: 'modifiedDate',
                caption: 'تاریخ آخرین تغییر',
            },
        ]
    }

    $(".body-left-content").dxVectorMap(vectorMap);

});