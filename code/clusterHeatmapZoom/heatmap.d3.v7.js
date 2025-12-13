const hWidth = 1500;
let hHeight = 0;
const hMargin = {top: 10, bottom: 10, left: 10, right: 10};
const hGPadding = 10;
const hClusterXvar = 70;
const hClusterYvar = 140;
const hZoomScale = 10;

let hCellWSize;
let hCellHSize;
let hFontXSize;
let hFontYSize;

let hXScale;
let hYScale;
let hColorScale;

let hXAxis;
let hYAxis;

let hCvcLabelGroups;
let hPathwayGsNameGroups;
let hColNumber;
let hRowNumber;
let heatmapXpos;
let heatmapYpos;

let hGXaxisWH;
let hGYaxisWH;
let hGXclusterWH;
let hGYclusterWH;
let hGHeatmapWH;
let hGXclusterYpos;

let matrix;
let rowRoot;
let rowCluster;
let rowNodes;
let colRoot;
let colCluster;
let colNodes;

let hLegend;
let hLegendTitle = "Value";
let hLegendRange;
let hTickValue;

let hLegendKey;
let hColorFunc;
let hTextFunc;
let hCLegend;

let hXAxisTopPos = 100;

const hSvg = d3.select("#heatmapChart");

const hBgBox = d3.select('#heatmapChart')
    .append('rect')
    .style('fill', '#fff')
    .style('fill-opacity', 1)
    .attr('x', 0)
    .attr('y', 0);

const hContainer = hSvg.append("g")
    .attr("transform", `translate(${hMargin.left}, ${hMargin.top})`);

const hGContentArea = hContainer.append("g")
    .attr("class", "contents");
let hGYcluster = hGContentArea.append("g")
    .attr("class", "rowTree");
const hGHeatmap = hGContentArea.append("g")
    .attr("class", "heatmap");
const hGYaxis = hGContentArea.append("g")
    .attr("class", "yAxis");

let hGXcluster = hContainer.append("g")
    .attr("class", "colTree")
const hGXTopAxis = hContainer.append("g")
    .attr("class", "xAxis");

const hGXBottomaxis = hContainer.append("g")
    .attr("class", "xAxis");

const hTooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip');

let hZoom;
let zoomMax = 5;

function drawHeatmapGraph(_plotData, clusterLayerDisplayFlag) {
    let plotData = _plotData;
    let plotInfoData = _plotData.heatmapInfo;

    //hCvcLabelGroups = Array.from(new Set(plotData.heatmapInfo.map(d => d.cvc_name)));
    //hPathwayGsNameGroups = Array.from(new Set(plotData.heatmapInfo.map(d => d.gs_name)));
    hCvcLabelGroups = plotData.colClusterName;
    hPathwayGsNameGroups = plotData.rowClusterName;

    hColNumber = plotData.heatmap.matrix[0].length;
    hRowNumber = plotData.heatmap.matrix.length;
    calHeatmapVarValue();

    hSvg.attr('width', hWidth)
        .attr('height', hHeight)
        .attr("viewBox", [0, 0, hWidth, hHeight])
        .attr("style", "max-width: auto; height: auto;");

    hBgBox.attr('width', hWidth)
        .attr('height', hHeight);

    hGContentArea.append("clipPath")
        .attr("id", "heatmapClip")
        .append("rect")
        .attr("width", hGHeatmapWH.width)
        .attr("height", hGHeatmapWH.height);
    hGContentArea.append("clipPath")
        .attr("id", "axisClip")
        .append("rect")
        .attr("width", 1000)
        .attr("height", hGHeatmapWH.height);
    hGContentArea.append("clipPath")
        .attr("id", "clusterClip")
        .append("rect")
        .attr("width", 1000)
        .attr("height", hGHeatmapWH.height);
    hGHeatmap.attr("clip-path",  "url(#heatmapClip)");
    hGYaxis.attr("clip-path",  "url(#axisClip)");
    hGYcluster.attr("clip-path",  "url(#clusterClip)");

    matrix = [];
    for (let r = 0; r < hRowNumber; r++) {
        for (let c = 0; c < hColNumber; c++) {
            matrix.push({row: r, col: c, value: plotData.heatmap.matrix[r][c]});
        }
    }

    hColorScale = d3.scaleSequential()
        .interpolator(d3.interpolateRdBu)
        .domain([parseInt(matrixValue)*1, parseInt(matrixValue)*-1]);

    hXScale = d3.scaleBand()
        .range([0, hColNumber * hCellWSize])
        .domain(hCvcLabelGroups)
        .padding(0.01);
    hXAxis = d3.axisBottom(hXScale).tickSize(0);
    hGXTopAxis.attr("transform", `translate(${heatmapXpos}, ${heatmapYpos + 35})`);
    hGXTopAxis.call(hXAxis)
        .call(g => g.select(".domain").remove())
        .style("font-size", hFontXSize)
        .style("writing-mode", () => 'vertical-lr');
    hGXBottomaxis.attr("transform", `translate(${heatmapXpos}, ${heatmapYpos + hGHeatmapWH.height + hGPadding + hXAxisTopPos + 35})`);
    hGXBottomaxis.call(hXAxis)
        .call(g => g.select(".domain").remove())
        .style("font-size", hFontXSize)
        .style("writing-mode", () => 'vertical-lr');

    hYScale = d3.scaleBand()
        .range([0, hGHeatmapWH.height])
        .domain(hPathwayGsNameGroups)
        .padding(0.01);
    hYAxis = d3.axisRight(hYScale).tickSize(0);
    //hGYaxis.attr("transform", `translate(${heatmapXpos + hGHeatmapWH.width + hGPadding}, ${heatmapYpos})`);
    hGYaxis.attr("transform", `translate(${heatmapXpos + hGHeatmapWH.width + hGPadding}, ${heatmapYpos + hXAxisTopPos})`);
    hGYaxis.call(hYAxis)
        .call(g => g.select(".domain").remove())
        .style("font-size", hFontYSize);

    hZoom = d3.zoom()
        .scaleExtent([1, zoomMax])
        //.translateExtent([[0, 0], [hWidth, hHeight]])
        .filter(filter)
        //.wheelDelta(myDelta)
        .on("zoom", zoomed);

    hGHeatmap.call(hZoom);

    function myDelta(event) {
        // 1500은 속도를 조절하는 상수입니다.
        // 이 값을 증가시키면 줌 속도가 느려지고, 감소시키면 빨라집니다.
        let zoomSpeedControl = 1500;
        return -event.deltaY * (event.deltaMode ? 120 : 1) / zoomSpeedControl;
    }

    //hGHeatmap.attr("transform", `translate(${heatmapXpos}, ${heatmapYpos})`);
    hGHeatmap.attr("transform", `translate(${heatmapXpos}, ${heatmapYpos + hXAxisTopPos})`);
    let _hGHeatmap = hGHeatmap.selectAll(".rect")
        .data(matrix, function(d){
            return JSON.stringify(d);
        })
        .join(
            function (enter){
                return enter.append("rect")
                    .attr("class", "mapEl")
                    .attr("x", d => d.col * hCellWSize)
                    .attr("y", d => d.row * hCellHSize)
                    .attr("width", hCellWSize)
                    .attr("height", hCellHSize)
                    .style("fill", function(d){
                        return colorPicker(d.value);
                        //return hColorScale(d.value);
                    })
                    .style("stroke-width", "1")
                    .style("stroke", function (d){
                        let info = plotInfoData[d.row][d.col];
                        let padj = 0;
                        let color = "";

                        if(info !== 0) {
                            padj = Number(info.padj);
                            color = padj === 0 ? "white" : padj <= 0.01 ? "yellow" : padj < 0.05 ? "green" : "white";
                        }
                        return color;
                    })
            },
            function (update){
                return update.attr("x", d => d.col * hCellWSize)
                    .attr("y", d => d.row * hCellHSize)
                    .attr("width", hCellWSize)
                    .attr("height", hCellHSize)
                    .style("fill", function(d){
                        return colorPicker(d.value);
                        //return hColorScale(d.value);
                    });
            },
            function (exit){
                return exit.remove();
            }
        );

    hGXcluster.attr("transform", `rotate (90), translate (${hMargin.top}, ${hGXclusterYpos}) scale(1,-1)`);
    //hGYcluster.attr("transform", `translate(${hMargin.left}, ${heatmapYpos})`);
    hGYcluster.attr("transform", `translate(${hMargin.left}, ${heatmapYpos + hXAxisTopPos})`);

    if(clusterLayerDisplayFlag) {
        colRoot = d3.hierarchy(JSON.parse(plotData.heatmap.colCluster));
        colCluster = d3.cluster()
            .size([hColNumber * hCellWSize, hClusterXvar])
            .separation(function separation(a, b) {
                return hCellWSize;
            });
        colNodes = colCluster(colRoot);

        rowRoot = d3.hierarchy(JSON.parse(plotData.heatmap.rowCluster));
        rowCluster = d3.cluster()
            .size([hRowNumber * hCellHSize, hClusterYvar])
            .separation(function separation(a, b) {
                return hCellHSize;
            });
        rowNodes = rowCluster(rowRoot);

        hGXcluster.selectAll(".colLink")
            .data(colRoot.links(colNodes), function (d) {
                return JSON.stringify(d.source.data + ":" + d.target.data);
            })
            .join(
                function (enter) {
                    return enter.append("path")
                        .attr("class", "colLink")
                        .attr("d", elbow);
                },
                function (update) {
                    return update.selectAll(".colLink")
                        .attr("d", elbow);
                },
                function (exit) {
                    return exit.remove();
                }
            );

        hGYcluster.selectAll(".rowLink")
            .data(rowRoot.links(rowNodes), function (d) {
                return JSON.stringify(d.source.data + ":" + d.target.data);
            })
            .join(
                function (enter) {
                    return enter.append("path")
                        .attr("class", "rowLink")
                        .attr("d", elbow);
                },
                function (update) {
                    return update.selectAll(".rowLink")
                        .attr("d", elbow);
                },
                function (exit) {
                    return exit.remove();
                }
            );
    }
    else{
        // If Row Order is Pathway, delete the cluster tree.
        hGXcluster.selectAll(".colLink").remove();
        hGYcluster.selectAll(".rowLink").remove();
    }

    let initX = -22.434810147;
    let firstZoomFlag = true;
    let maxZoomFlag = false;

    let zoomIdentity = d3.zoomIdentity;
    let prevTransform = d3.zoomIdentity;
    let goodTransform = d3.zoomIdentity;

    function zoomed(event) {
        let transform = event.transform;

        //const currPoint = d3.pointers(event);
        let pk = Number(prevTransform.k);
        let tk = Number(transform.k);

        // zoom을 처음 적용할 때
        if(firstZoomFlag) {
            sleep(1);
            //console.log("Start Zoom");
            prevTransform = zoomIdentity;   // prev를 초기값으로 설정
            goodTransform = makeNextTransform(prevTransform, transform);
            d3.selectAll(".rowLink")
                /*.attr("d", function (d, i){
                    return "M" + transform.applyY(d.source.y) + "," + transform.applyX(d.source.x)
                        + "V" + transform.applyX(d.target.x) + "H" + transform.applyY(d.target.y);
                })
                * transform을 사용하는 작업이라서 x, y, k의 값을 화면에 맞게 적용할 수 없음.*/
                .attr("transform", goodTransform);
            prevTransform = goodTransform;
            firstZoomFlag = false;
        }
        else{
            if(tk === 1) {
                //console.log("Init Zoom");
                prevTransform = zoomIdentity;   // prev를 초기값으로 설정
                goodTransform = makeNextTransform(prevTransform, transform);
                d3.selectAll(".rowLink")
                    .attr("transform", goodTransform);
                prevTransform = goodTransform;
            }

            if(maxZoomFlag){
                //console.log("MAX Zoom");
                maxZoomFlag = false;
            }
            else{
                if(pk < tk) {
                    //console.log("ZOOM OUT");
                    if(!maxZoomFlag) {
                        goodTransform = makeNextTransform(prevTransform, transform);
                        d3.selectAll(".rowLink")
                            .attr("transform", goodTransform);
                        prevTransform = goodTransform;
                        maxZoomFlag = tk === zoomMax;
                    }
                }
                else {
                    //console.log("ZOOM IN");
                    goodTransform = makeBeforeTransform(prevTransform, transform);
                    d3.selectAll(".rowLink")
                        .attr("transform", goodTransform);
                    prevTransform = goodTransform;
                }
            }
        }

        let newYRange = hYScale.range().map(function (d){
            return transform.applyY(d);
        })
        let newYScale = d3.scaleBand()
            .domain(hYScale.domain())
            .range(newYRange)
            .padding(hYScale.padding());
        hYAxis = d3.axisRight(newYScale).tickSize(0);
        hGYaxis.call(hYAxis)
            .call(g => g.select(".domain").remove())
            .style("font-size", hFontYSize);

        hGHeatmap.selectAll(".mapEl")
            /*.attr("x", function(d) {
                return transform.applyX(d.col * hCellWSize);
            })*/
            .attr("y", function(d) {
                return transform.applyY(d.row * hCellHSize);
            })
            /*.attr("width", function(d) {
                return hCellWSize * transform.k;
            })*/
            .attr("height", function(d) {
                return (hCellHSize * transform.k);
            });
    }

    function sleep(sec) {
        return new Promise(resolve => setTimeout(resolve, sec * 1000));
    }

    function makeNextTransform(prev, curr){
        let xPos = curr.k * initX + prev.x;
        let transform = new d3.ZoomTransform(curr.k, xPos, curr.y);
        console.log(transform);
        return transform;
    }

    function makeBeforeTransform(prev, curr){
        let xPos = prev.x - (curr.k * initX) + (curr.k * zoomMax);
        let transform = new d3.ZoomTransform(curr.k, xPos, curr.y);
        console.log(transform);
        return transform;
    }

    function center(event, target) {
        if (event.sourceEvent) {
            const p = d3.pointers(event, target);
            return [d3.mean(p, d => d[0]), d3.mean(p, d => d[1])];
        }
        return [width / 2, height / 2];
    }

    function elbow(d, i) {
        return "M" + d.source.y + "," + d.source.x
            + "V" + d.target.x + "H" + d.target.y;
    }

    function colorPicker(d){
        let colorValue = 0;

        if(d > matrixValue){
            colorValue = matrixValue;
        }
        else {
            colorValue = d;
        }
        return hColorScale(colorValue);
    }

    // prevent scrolling then apply the default filter
    function filter(event) {
        event.preventDefault();
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
    }

    function calHeatmapVarValue(){
        if(hRowNumber < 30) {hCellHSize=20; hFontYSize=17;}
        else if(hRowNumber < 50) {hCellHSize=18; hFontYSize=16;}
        else if(hRowNumber < 70) {hCellHSize=17; hFontYSize=15;}
        else if(hRowNumber < 100) {hCellHSize=16; hFontYSize=14;}
        else if(hRowNumber < 150) {hCellHSize=15; hFontYSize=13;}
        else if(hRowNumber < 200) {hCellHSize=14; hFontYSize=12;}
        else if(hRowNumber < 250) {hCellHSize=13; hFontYSize=11;}
        else if(hRowNumber < 300) {hCellHSize=12; hFontYSize=10;}
        else {hCellHSize=11; hFontYSize=9;}

        hHeight = hRowNumber * hCellHSize + 350;

        /*k_console(
            {'hRowNumber':hRowNumber, 'hCellHSize':hCellHSize, 'hHeight':hHeight}
        )*/

        if(hColNumber <= 5) {hCellWSize = 50; hFontXSize = 15;}
        else if(hColNumber <= 10) {hCellWSize = 47; hFontXSize = 14;}
        else if(hColNumber <= 15) {hCellWSize = 44; hFontXSize = 13;}
        else if(hColNumber <= 20) {hCellWSize = 41; hFontXSize = 12;}
        else if(hColNumber <= 25) {hCellWSize = 38; hFontXSize = 11;}
        else if(hColNumber <= 30) {hCellWSize = 35; hFontXSize = 10;}
        else if(hColNumber <= 35) {hCellWSize = 32; hFontXSize = 9;}
        else if(hColNumber <= 40) {hCellWSize = 29; hFontXSize = 9;}
        else if(hColNumber <= 45) {hCellWSize = 26; hFontXSize = 9;}
        else if(hColNumber <= 50) {hCellWSize = 23; hFontXSize = 9;}
        else {hCellWSize = 20; hFontXSize = 9;}

        hGHeatmapWH = {width: hColNumber * hCellWSize, height: hRowNumber * hCellHSize};
        hGXaxisWH = {width: hColNumber * hCellWSize, height: 200};
        hGYaxisWH = {width: 300, height: hRowNumber * hCellHSize};
        hGXclusterWH = {width: hColNumber * hCellWSize, height: hClusterXvar};
        hGYclusterWH = {width: hRowNumber * hCellHSize, height: hClusterYvar};

        // Chart location changes depending on cluster options.
        if(clusterLayerDisplayFlag) {
            heatmapXpos = hMargin.left + hGYclusterWH.height + hGPadding;
            heatmapYpos = hMargin.top + hGXclusterWH.height + hGPadding;
        }
        else{
            heatmapXpos = hMargin.left + hGPadding;
            heatmapYpos = hMargin.top + hGPadding;
        }

        if(hColNumber < 10) {hGXclusterYpos = -1*heatmapYpos-hCellWSize*1.7;}
        else if(hColNumber < 15) {hGXclusterYpos = -1*heatmapYpos-hCellWSize*1.6;}
        else if(hColNumber < 20) {hGXclusterYpos = -1*heatmapYpos-hCellWSize*1.6;}
        else if(hColNumber < 25) {hGXclusterYpos = -1*heatmapYpos-hCellWSize*1.7;}
        else if(hColNumber < 30) {hGXclusterYpos = -1*heatmapYpos-hCellWSize*1.8;}
        else if(hColNumber < 35) {hGXclusterYpos = -1*heatmapYpos-hCellWSize*2.0;}
        else if(hColNumber < 40) {hGXclusterYpos = -1*heatmapYpos-hCellWSize*2.1;}
        else if(hColNumber < 45) {hGXclusterYpos = -1*heatmapYpos-hCellWSize;}
        else {hGXclusterYpos = -1*heatmapYpos-hCellWSize*0.9;}
        //hGXclusterYpos = hGXclusterYpos + 20;

        hLegendTitle = 'NES';
        hLegendRange = 5;
    }

    function labelsFromTree (nodes) {
        let labels = [];
        nodes.each(function(d){
            if (!d.children || d.children.length === 0) {
                labels.push({"name":d.data.name, "x":d.x, "y":d.y});
            }
        });
        return labels;
    }

    /*let hLegendKey = ["0.01", "0.05"];
    let rectXPosFunc = () => 3;
    let textXPosFunc = () => 27;
    let rectYPosFunc = (d,i)=> i === 0 ? 0 : i*35;
    let textYPosFunc = (d,i)=> i === 0 ? 10 : i*45;
    let hColorFunc = () => "#d1d1d1";
    let hTextFunc = (d) => ` < ${d.toLowerCase()}`;
    let fontFunc = () => "13px";
    let strokeFunc = (d) => d === "0.01" ? "yellow" : d === "0.05" ? "green" : "";

    let hCLegend = CategoryLegend(hLegendKey,
        rectXPosFunc, textXPosFunc,
        rectYPosFunc, textYPosFunc,
        hColorFunc, hTextFunc, fontFunc, strokeFunc,
        {title: "p.adj", width: 100, height: 100}
    )
    document.getElementById("heatmapPadjLegend").innerHTML = "";
    document.getElementById("heatmapPadjLegend").append(hCLegend);

    let hTickValue = [-5,-4,-3,-2,-1,0,1,2,3,4,5];
    //let hLegend = Legend(d3.scaleSqrt([hLegendRange, 0, -1*hLegendRange], ["#1775d1", "#ffffff", "#d1171a"]), {
    let hLegend = Legend(hColorScale, {
        title: hLegendTitle,
        tickValues: hTickValue,
        rotateDegree: 90,
        width: 300
    });
    document.getElementById("heatmapNesLegend").innerHTML = "";
    document.getElementById("heatmapNesLegend").append(hLegend);*/
}
