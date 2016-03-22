
Components = function(){};


Components.prototype.translation =  function(x,y) { //concatonate translate string
    return 'translate(' + x + ',' + y + ')';
};

Components.prototype.guiPopPyramid = function(widget, configuration){


    //requires widget to have widget.data property = [{age:"String", male:Number, female:Number}]

    var self = this;
    var that = {};

    var data = widget.data;

    var totalPopulation = undefined;
    var maxPctValue = undefined;

    var xScale = undefined;
    var xScaleLeft = undefined;
    var xScaleRight = undefined;
    var yScale = undefined;

    var yAxisLeft = undefined;
    var yAxisRight = undefined;
    var xAxisLeft = undefined;
    var xAxisRight = undefined;

    var svg = undefined;

    var leftBarGroup = undefined;
    var rightBarGroup = undefined;

    var leftDots = undefined;
    var rightDots = undefined;

    function maxValue(){
        return Math.max(
            d3.max(data, function(d) { return d.male; }),
            d3.max(data, function(d) { return d.female; })
        );
    }

    //presets
    that.config = {
        container: "body",
        class: "component_svg",
        id: "svgComponent",
        full_height: 400,
        full_width: 400,
        margin: {top: 14, bottom: 28, right: 42, left: 42, middle: 50}
    };

    function configure(configuration){

        //update specified properties from presets
        for(var property in configuration){
            that.config[property] = configuration[property];
        }

        that.config.height = that.config.full_height - that.config.margin.top - that.config.margin.bottom;
        that.config.width = that.config.full_width - that.config.margin.left - that.config.margin.right;

        //width for each side of chart
        that.regionWidth = that.config.width / 2 - that.config.margin.middle;

        // these are the x-coordinates of the y-axes
        that.pointA = that.regionWidth
        that.pointB = that.config.width - that.regionWidth;


        // find the maximum data value on either side
        //  since this will be shared by both of the x-axes
        maxPctValue = maxValue();


        //Set up scales
        xScale = d3.scale.linear()
            .domain([0, maxPctValue * 1.5])
            .range([0, that.regionWidth]);

        xScaleLeft = d3.scale.linear()
            .domain([0, maxPctValue * 1.5])
            .range([that.regionWidth, 0]);

        xScaleRight = d3.scale.linear()
            .domain([0, maxPctValue * 1.5])
            .range([0, that.regionWidth]);

        yScale = d3.scale.ordinal()
            .domain(data.reverse().map(function(d) {return d.age; })) //reverse as data needs to be other way for webix table
            .rangeRoundBands([that.config.height,0], 0.1);

        // SET UP AXES
        yAxisLeft = d3.svg.axis()
            .scale(yScale)
            .orient('right')
            .tickSize(0,0)
            .tickPadding(that.config.margin.middle-4);

        yAxisRight = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .tickSize(0,0)
            .tickFormat('');

        xAxisRight = d3.svg.axis()
            .scale(xScaleRight)
            .orient('bottom')
            //.tickFormat(d3.format('%'))
            .ticks(5);

        xAxisLeft = d3.svg.axis()
            .scale(xScaleLeft)
            .orient('bottom')
            //.tickFormat(d3.format('%'))
            .ticks(5);



        that.brush = d3.svg.brush()
            .x(xScale)
            .extent([0,0])
            .on("brush", function(){

                var gender = this.id.split("_")[1];
                var i = this.id.split("_")[2];
                var widgetId = this.id.split("_")[3];
                var id_suffix =  gender + "_" + i + "_" + widgetId;

                mouse_value = d3.mouse(this)[0];
                value = xScale.invert(mouse_value);

                that.brush.extent([value, value]);


                if(gender == "female"){data[i].lockedFemale = 1}
                if(gender == "male"){data[i].lockedMale = 1}

                if(mouse_value >= 0 && value <= 100) {

                    data[i][gender] = value;
                    ee.emitEvent("pdUpdate")
                }

            })



    }
    that.configure = configure;


    function render(){

        svg = d3.select(that.config.container)
            .append("div")
            .classed("svg-container", true)
            .append("svg")
            .attr("class", that.config.class)
            .attr("id", that.config.id)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + that.config.full_width + " " + that.config.full_height )
            .classed("svg-content-responsive", true)
            .append('g')
            .attr("transform", self.translation(that.config.margin.left, that.config.margin.top));

        // DRAW AXES
        svg.append('g')
            .attr('class', 'axis y left')
            .attr('transform', self.translation(that.pointA, 0))
            .style("stroke-width", 0)
            .call(yAxisLeft)
            .selectAll('text')
            .style('text-anchor', 'middle');

        svg.append('g')
            .attr('class', 'axis y right')
            .attr('transform', self.translation(that.pointB, 0))
            .style("stroke-width", 0)
            .call(yAxisRight);

        svg.append('g')
            .attr('class', 'axis x left')
            .attr("id", "xAxisLeft" + widget.widgetId)
            .attr('transform', self.translation(0, that.config.height))
            .call(xAxisLeft);

        svg.append('g')
            .attr('class', 'axis x right')
            .attr("id", "xAxisRight" + widget.widgetId)
            .attr('transform', self.translation(that.pointB, that.config.height))
            .call(xAxisRight);

        // MAKE GROUPS FOR EACH SIDE OF CHART
        // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
        leftBarGroup = svg.append('g')
            .attr('transform', self.translation(that.pointA, 0) + 'scale(-1,1)');
        rightBarGroup = svg.append('g')
            .attr('transform', self.translation(that.pointB, 0));

        // DRAW BARS
        leftBarGroup.selectAll('.bar.left')
            .data(data)
            .enter().append('rect')
            .attr('class', 'barLeft' + widget.widgetId)
            .attr("id", function(d, i){return "popBar_male_" + i + "_" +  widget.widgetId})
            .attr('x', 0)
            .attr('y', function(d) { return yScale(d.age); })
            .attr('width', function(d) {return xScale(d.male); })
            .attr('height', yScale.rangeBand())
            .style("fill", "#a6cee3")
            .style("stroke-width", 1)
            .style("stroke", "#1f78b4");

        rightBarGroup.selectAll('.bar.right')
            .data(data)
            .enter().append('rect')
            .attr('class', 'barRight' + widget.widgetId)
            .attr("id", function(d, i){return "popBar_female_" + i + "_" + widget.widgetId})
            .attr('x', 0)
            .attr('y', function(d) { return yScale(d.age); })
            .attr('width', function(d) { return xScale(d.female); })
            .attr('height', yScale.rangeBand())
            .style("fill", "#fb9a99")
            .style("stroke-width", 1)
            .style("stroke", "#e31a1c");


        //draw circles
        svg.selectAll(".circle.left")
            .data(data)
            .enter().append("circle")
            .attr('transform', self.translation(that.pointA, 0) + 'scale(-1,1)')
            .attr("class", "clickable dotsLeft" + widget.widgetId)
            //.attr("class", "dots" + d.key +  widget.widgetId + " clickable")
            .attr("id", function(d, i){return "popDot_male_" + i  + "_" + widget.widgetId})
            .attr("cx", function(d){ return xScale(d.male)})
            .attr("cy", function(d) { return yScale(d.age) + yScale.rangeBand() * 0.5 ; })
            .style("fill", function(d){
                if(d.lockedMale == 1){
                    return "#a6cee3"
                } else {
                    return "white"
                }
            })
            .attr("r", function(){return yScale.rangeBand() * .3})
            .style("stroke-width", 1)
            .style("stroke", "#1f78b4")
            .call(that.brush)


        svg.selectAll(".circle.right")
            .data(data)
            .enter().append("circle")
            .attr('transform', self.translation(that.pointB, 0))
            .attr("class", "clickable dotsRight" + widget.widgetId)
            //.attr("class", "dots" + d.key +  widget.widgetId + " clickable")
            .attr("id", function(d, i){return "popDot_female_" + i + "_" + widget.widgetId})
            .attr("cx", function(d){ return xScale(d.female)})
            .attr("cy", function(d) { return yScale(d.age) + yScale.rangeBand() * 0.5 ; })
            .style("fill", function(d){
                if(d.lockedFemale == 1){
                    return "#fb9a99"
                } else {
                    return "white"
                }
            })
            .attr("r", function(){return yScale.rangeBand() * .3})
            .style("stroke-width", 1)
            .style("stroke", "#e31a1c")
            .call(that.brush)






    }
    that.render = render;


    function update(){


        //update scales
        maxPctValue = maxValue();

        xScale.domain([0, maxPctValue * 1.5])
            .range([0, that.regionWidth])
            .nice();

        xScaleLeft.domain([0, maxPctValue * 1.5])
            .range([that.regionWidth, 0]);

        xScaleRight.domain([0, maxPctValue * 1.5])
            .range([0, that.regionWidth]);


        //update axis
        svg.select("#xAxisRight" + widget.widgetId)
            .transition()
            .duration(500)
            .ease("sin-in-out")
            .call(xAxisRight);

        svg.select("#xAxisLeft" + widget.widgetId)
            .transition()
            .duration(500)
            .ease("sin-in-out")
            .call(xAxisLeft);

        //update bars and dots

        d3.selectAll(".barRight" + widget.widgetId)
            .data(data)
            .transition()
            .delay(200)
            .duration(0)
            //.ease("cubic")
            .attr("width", function(d){ return xScale(d.female)});

        d3.selectAll(".barLeft" + widget.widgetId)
            .data(data)
            .transition()
            .delay(200)
            .duration(0)
            //.ease("cubic")
            .attr("width", function(d){ return xScale(d.male)});

        d3.selectAll(".dotsRight" + widget.widgetId)
            .data(data)
            .transition()
            .delay(200)
            .duration(0)
            //.ease("cubic")
            .attr("cx", function(d){ return xScale(d.female)})
            .style("fill", function(d){
                if(d.lockedFemale == 1){
                    return "#fb9a99"
                } else {
                    return "white"
                }
            });

        d3.selectAll(".dotsLeft" + widget.widgetId)
            .data(data)
            .transition()
            .delay(200)
            .duration(0)
            //.ease("cubic")
            .attr("cx", function(d){ return xScale(d.male)})
            .style("fill", function(d){
                if(d.lockedMale == 1){
                    return "#a6cee3"
                } else {
                    return "white"
                }
            });




    }
    that.update = update;


    that.configure(configuration);
    return that

};




Components.prototype.guiPopGraph = function(widget, configuration){


    //requires widget to have widget.data property = [{year:Number, total:Number]

    var self = this;
    var that = {};

    var data = widget.data;


    var xScale = undefined;
    var yScale = undefined;

    var yAxis = undefined;
    var xAxis = undefined;

    //var fLine = undefined;
    //var fArea = undefined;

    var svg = undefined;

    function xMinMax(){

        return d3.extent(data, function(d) { return d.year; })

    }

    function yMinMax(){

        //add some space for dragging values on the graph

        ymin = d3.min(data, function(d) { return d.count; });
        if(Math.abs(ymin) < 20){
            ymin = ymin - 20
        } else {
            ymin = ymin - 0.1 * Math.abs(ymin)
        }
        if(ymin > 0){ymin = -20}

        ymax = d3.max(data, function(d) { return d.count; });
        if(Math.abs(ymax) < 20){
            ymax = ymax + 20
        } else {
            ymax = ymax + 0.1 * ymax
        }
        if(ymax < 0){ymax = 20}

        return [ymin, ymax]
    }

    //presets
    that.config = {
        container: "body",
        class: "component_svg",
        id: "svgComponent",
        full_height: 400,
        full_width: 400,
        margin: {top: 50, bottom: 50, right: 50, left: 80}
    };

    function configure(configuration){

        //update specified properties from presets
        for(var property in configuration){
            that.config[property] = configuration[property];
        }

        that.config.height = that.config.full_height - that.config.margin.top - that.config.margin.bottom;
        that.config.width = that.config.full_width - that.config.margin.left - that.config.margin.right;

        //width for each side of chart
        that.regionWidth = that.config.width / 2 - that.config.margin.middle;


        //Set up scales
        xScale= d3.scale.ordinal()
            .domain(data.map(function(d) { return d.year; }))
            .rangeRoundBands([0, that.config.width], 0.1);

        yScale = d3.scale.linear()
            .domain(yMinMax())
            .range([that.config.height, 0]);


        // SET UP AXES
        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .tickSize(0,0)
            .ticks(5);
            //.tickPadding(that.config.margin.middle-4);


        xAxis = d3.svg.axis()
            .scale(xScale)
            .tickFormat(d3.format(""))
            .orient('bottom')
            .tickSize(5,0)
            .ticks(5);


        ////area function
        //fArea = d3.svg.area()
        //    //.defined(function(d) {return !isNaN(d.count); })
        //    .x(function(d, i) {return xScale(d.year);})
        //    .y0(function(d) {return yScale(0);})
        //    .y1(function(d) {return yScale(d.count);})
        //    .interpolate("step");




        that.brush = d3.svg.brush()
            .y(yScale)
            .extent([0,0])
            .on("brush", function(){

                var i = this.id.split("_")[1];

                mouse_value = d3.mouse(this)[1];
                value = yScale.invert(mouse_value);

                if(value < 10000000) { //arbitrary max value
                    that.brush.extent([value, value]);

                    //d3.select("#" + this.id).attr("cy", mouse_value)

                    pb.counts.lockCount(data[i].year);

                    data[i].count = value;
                    pb.counts.update();
                    update();
                //ee.emitEvent("countGraphUpdate", [popBuild])
                }

            })



    }
    that.configure = configure;


    function render(){

        svg = d3.select(that.config.container)
            .append("div")
            .classed("svg-container", true)
            .append("svg")
            .attr("class", that.config.class)
            .attr("id", that.config.id)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + that.config.full_width + " " + that.config.full_height )
            .classed("svg-content-responsive", true)
            .append('g')
            .attr("transform", self.translation(that.config.margin.left, that.config.margin.top));

        // DRAW AXES
        svg.append('g')
            .attr('id', 'yAxis' + widget.widgetId)
            .style("stroke-width", 0)
            .attr('transform', self.translation(- that.config.width / 20, 0))
            .call(yAxis)
            .selectAll('text')
            .style('text-anchor', 'right');


        svg.append('g')
            .attr('id', 'xAxis'  + widget.widgetId)
            .style("stroke-width", 0)
            //.attr("id", "xAxisLeft" + widget.widgetId)
            .attr('transform', self.translation(0, that.config.height))
            .call(xAxis);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bars" + widget.widgetId)
            .attr("id", function(d, i){return "bars_" + i + "_" + widget.widgetId})
            .attr("x", function(d) { return xScale(d.year); })
            .attr("width", xScale.rangeBand())
            .attr("y",function(d) { return Math.min(yScale(0), yScale(d.count)); } )
            .attr("height", function(d) { return Math.abs( yScale(d.count) - yScale(0) ); })
            .style("stroke", function(d){
                if(d.count >= 0){
                    return "#33a02c"
                } else {
                    return "#e31a1c"
                }
            })
            .style("stroke-width", 2)
            .style("fill", function(d){
                if(d.count >= 0){
                    return "#b2df8a"
                } else {
                    return "#fb9a99"
                }
            });

        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dots" + widget.widgetId + " clickable")
            .attr("id", function(d, i){return "dots_" + i + "_" + widget.widgetId})
            .attr("cx", function(d){return xScale(d.year) + xScale.rangeBand() * 0.5})
            .attr("cy", function(d){ return yScale(d.count)})
            .style("stroke", function(d){
                if(d.count >= 0){
                    return "#33a02c"
                } else {
                    return "#e31a1c"
                }
            })
            .attr("r", 6)
            .style("stroke-width", 2)
            .style("fill", "white")
            .call(that.brush);

    }
    that.render = render;


    function update(){

        //data = widget.data;

        //console.log(widget)

        //update scales
        xScale= d3.scale.ordinal()
            .domain(data.map(function(d) { return d.year; }))
            .rangeRoundBands([0, that.config.width], 0.1);


        yScale.domain(yMinMax())
            .range([that.config.height, 0]);


        //update axis
        svg.select("#xAxis" + widget.widgetId)
            .transition()
            .duration(500)
            .ease("sin-in-out")
            .call(xAxis);

        svg.select("#yAxis" + widget.widgetId)
            .transition()
            .duration(500)
            .ease("sin-in-out")
            .call(yAxis);


        //update path and dots


        //console.log( svg.selectAll(".dots" + widget.widgetId)[0].length)

        if(svg.selectAll(".dots" + widget.widgetId)[0].length == data.length) {

            svg.selectAll(".dots" + widget.widgetId)
                .data(data)
                .transition()
                .duration(100)
                .delay(100)
                .ease("cubic")
                 .attr("cy", function (d) {
                    return yScale(d.count)
                })
                .style("stroke", function(d){
                    if(d.count >= 0){
                        return "#33a02c"
                    } else {
                        return "#e31a1c"
                    }
                });

            svg.selectAll(".bars" + widget.widgetId)
                .data(data)
                .transition()
                .duration(100)
                .delay(100)
                .ease("cubic")
                .attr("y",function(d) { return Math.min(yScale(0), yScale(d.count)); } )
                .attr("height", function(d) { return Math.abs( yScale(d.count) - yScale(0) ); })
                .style("stroke", function(d){
                    if(d.count >= 0){
                        return "#33a02c"
                    } else {
                        return "#e31a1c"
                    }
                })
                .style("fill", function(d){
                    if(d.count >= 0){
                        return "#b2df8a"
                    } else {
                        return "#fb9a99"
                    }
                });


        } else {


            svg.selectAll(".dots" + widget.widgetId).remove()
            svg.selectAll(".bars" + widget.widgetId).remove()

            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bars" + widget.widgetId)
                .attr("id", function(d, i){return "bars_" + i + "_" + widget.widgetId})
                .attr("x", function(d) { return xScale(d.year); })
                .attr("width", xScale.rangeBand())
                .attr("y",function(d) { return Math.min(yScale(0), yScale(d.count)); } )
                .attr("height", function(d) { return Math.abs( yScale(d.count) - yScale(0) ); })
                .style("stroke", function(d){
                    if(d.count >= 0){
                        return "#33a02c"
                    } else {
                        return "#e31a1c"
                    }
                })
                .style("stroke-width", 2)
                .style("fill", function(d){
                    if(d.count >= 0){
                        return "#b2df8a"
                    } else {
                        return "#fb9a99"
                    }
                });

            svg.selectAll(".dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "dots" + widget.widgetId + " clickable")
                .attr("id", function(d, i){return "dots_" + i + "_" + widget.widgetId})
                .attr("cx", function(d){return xScale(d.year) + xScale.rangeBand() * 0.5})
                .attr("cy", function(d){ return yScale(d.count)})
                .style("stroke", function(d){
                    if(d.count >= 0){
                        return "#33a02c"
                    } else {
                        return "#e31a1c"
                    }
                })
                .attr("r", 6)
                .style("stroke-width", 2)
                .style("fill", "white")
                .call(that.brush);
        }
    }
    that.update = update;


    that.configure(configuration);
    return that

};






