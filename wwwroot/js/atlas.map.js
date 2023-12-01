$(function () {
    $(".body-left-content").dxVectorMap(
        {
            zoomFactor:2.5,
            width:"100%",
            height:"100%",
            bounds: [43.13321914472885, 50.83717618250027, 61.96, 8.33],
            tooltip: {
                enabled: true,
                customizeTooltip(arg) {
                    if (arg.layer.type === 'marker') {
                        return { text: arg.attribute('name') };
                    }
                    return null;
                },
            },
            layers:[{
                name: 'areas',
                dataSource: DevExpress.viz.map.sources.eurasia
            },
                {
                    dataSource:markersArray,
                }],
            controlBar:{enabled:false},
        }
    );
});