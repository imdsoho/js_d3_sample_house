function CategoryLegend(legendKey,
                        rectXPosFunc, textXPosFunc,
                        rectYPosFunc, textYPosFunc,
                        colorFunc, textFunc, fontFunc, strokeFunc,
                        {
                            title = "",
                            width = 100,
                            height = 100,
                            storkeWidth = 1
                        } = {}){

    let svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");

    svg.append("g")
        .selectAll("g")
        .data(legendKey, function (d){
            return JSON.stringify(d);
        })
        .join(
            function (enter) {
                enter = enter.append("g");

                enter.append("rect")
                    .attr("x", rectXPosFunc)
                    .attr("y", rectYPosFunc)
                    .attr("width", 17)
                    .attr("height", 17)
                    .attr("fill", colorFunc)
                    .style("stroke-width", storkeWidth)
                    .style("stroke", strokeFunc);

                return enter.append("text")
                    .attr("x", textXPosFunc)
                    .attr("y" , textYPosFunc)
                    .style("font-size", fontFunc)
                    .attr("fill", "black")
                    .text(textFunc);
            },
            function (update) {
                return update;
            },
            function (exit) {
                return exit.remove();
            }
        );
    svg.call(g => g.append("text")
        .attr("x", 25)
        .attr("y", -15)
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .style("font-size", fontFunc)
        .attr("class", "title")
        .text(title));

    return svg.node();
}