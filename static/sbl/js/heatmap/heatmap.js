//$(document).ready(function () {
$(window).on('load', function() {
    createHeatmap();

    function createHeatmap() {
        let heatmapApiUrl = "http://localhost:63342/js_d3_sample_house/data/pathway_analysis_data.json";
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
        if(response.hPlotData.heatmap.matrix.length > 0 && response.hPlotData.heatmap.matrix[0].length > 0) {
            let hRowOrder = 'Cluster';
            if(hRowOrder === 'Cluster'){
                clusterLayerDisplayFlag = true;
            }
            drawHeatmapGraph(response.hPlotData, clusterLayerDisplayFlag);

            // If matrix data is [matrix.length, matrix[0].length] = [1,1], charts can be drawn, but clusters cannot.
            if (response.hPlotData.state !== "SUCCESS") {
                appendAlert(`${response.hPlotData.state}`, 'warning', 'infoAlertPlaceholder');
            }
        }
        else {
            let emptyResponse = {
                "heatmap": {"rowCluster": {}, "colCluster": {}, "matrix": [[]]},
                "rowClusterName": [],
                "colClusterName": [],
                "heatmapInfo": [[{}]]
            };
            drawHeatmapGraph(emptyResponse, clusterLayerDisplayFlag);

            // If matrix data is [matrix.length, matrix[0].length] = [0,0].
            // [Python Message] The number of observations cannot be determined on an empty distance matrix.
            // There are no query results in the selected CASE and DATABASE.
            if (response.hPlotData.state !== "SUCCESS") {
                appendAlert(`${response.hPlotData.state}`, 'warning', 'infoAlertPlaceholder');
            }
        }
    }
});
