/**
 * Created by leovalberg on 15/02/2016.
 */

GuiPopPyramid = function(container, widgetId){


    this.container = container;
    this.widgetId = widgetId;

    this.data = pb.demographics.data;

    this.drawAll();


};


GuiPopPyramid.prototype.drawAll = function(){

    this.drawGuiPopPyramid();

};


GuiPopPyramid.prototype.drawGuiPopPyramid = function(){

    var self = this;

    var ele = document.createElement("div");


    var config = {
        container: ele,
        id: this.widgetId,
        full_height: 400,
        full_width: 500
    };

    this.svg = component.guiPopPyramid(self, config);
    this.svg.render()

    $$(this.container).$view.appendChild(ele.firstChild);


    function listener(){
        self.svg.update()
    }

    ee.addListener("pdUpdate", listener )

};




