//$(document).ready(function () {
$(window).on('load', function() {
    createHeatmap();

    function createHeatmap() {
        let heatmapApiUrl = "http://localhost:63342/js_d3_sample_house/data/clusterHeatmapZoomData.json";
        $.ajax({
            type: 'GET',
            async: true,
            url: heatmapApiUrl,
            dataType: 'json',
            success: visualizeHeatmapData,
            error: function (resp, status) {
            },
            beforeSend: function (){
            },
            complete: function (){
            }
        })
            .done(function (response){
            });
    }

    function visualizeHeatmapData(response) {
        chartOptionEnableState = true;
        matrixValue =  5;

        let clusterLayerDisplayFlag = false;
            let hRowOrder = 'Cluster';
            if(hRowOrder === 'Cluster'){
                clusterLayerDisplayFlag = true;
            }
            drawHeatmapGraph(response.hPlotData, clusterLayerDisplayFlag);
    }
});
