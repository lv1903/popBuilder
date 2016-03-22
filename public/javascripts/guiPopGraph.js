/**
 * Created by leovalberg on 15/02/2016.
 */

GuiPopGraph = function(container, widgetId){


    this.container = container;
    this.widgetId = widgetId;

    this.data = pb.counts.data;

    this.drawAll();


};


GuiPopGraph.prototype.drawAll = function(){

    this.drawGuiPopGraph();

};


GuiPopGraph.prototype.drawGuiPopGraph = function(){

    var self = this;

    var ele = document.createElement("div");


    var config = {
        container: ele,
        id: this.widgetId,
        full_height: 400,
        full_width: 500
    };

    this.svg = component.guiPopGraph(self, config);
    this.svg.render();

    $$(this.container).$view.appendChild(ele.firstChild);


    function listener(){
        //self.data = data
        self.svg.update()
    }

    ee.addListener("countsUpdate", listener )

};