/**
 * Created by leovalberg on 16/02/2016.
 */




if (typeof window.popGui === "undefined") {
    popGui = {};
}


//-----------------------entity tab



//----entity table

popGui.entityTable = {

    id: "entityTable",
    view: "datatable",
    css: "table",
    width: 10,
    //rowHeight: 20,
    select: "cell",
    navigation:true,
    columns:[
        { id:"entityId", editor: "text", header:"Id"},
        { id:"name", header:"Name", width: 140},
        { id: "percent", editor: "text", header: "%", width: 60, format:webix.i18n.intFormat},
        { id:"lockedPercent", header:"<span class='webix_icon fa-lock'></span>", width: 40, template:"{common.checkbox()}", editor:"inline-checkbox"},
        { 	id:"Add",
            template:"<input class='addbtn' type='button' value='+'>",
            css:"entity_button_cell",
            width:80
        },
        { 	id:"Delete",
            template:"<input class='delbtn' type='button' value='x'>",
            css:"entity_button_cell",
            width:80 }

    ],

    editable:true,
    autoheight:true,
    autowidth:true,
    //data: [{entityId:"a", name: "b", percent: "c", lockedPercent: 0}],
    data: pb.entities.data,

    rules:{


    },

    on: {

        "onAfterEditStop": function(state, editor, ignoreUpdate){

            //console.log($$("entityTable").getSelectedItem().percent)


            //add a new blank row
            var add = pb.entities.addEntity({entityId:"", name: "", percent: "", lockedPercent: 0}); //update data
            if(add){
                $$("entityTable").add(pb.entities.data[pb.entities.data.length - 1]); //add record if addEntity returns true
            }


            //alert duplicates
            if(pb.entities.duplicateEntity(($$("entityTable").getSelectedItem().entityId)) > 1){
                webix.alert("Duplicate Id!");
            }

            //calculate the percents
            pb.entities.normalize();
            $$("entityTable").refresh()

        },

        "onItemClick": function(obj, a, b){

            switch(obj.column){

                case "Add":
                    var add = pb.entities.addEntity({entityId:"", name: "", percent: "", lockedPercent: 0}); //update data
                    if(add){
                        $$("entityTable").add(pb.entities.data[pb.entities.data.length - 1]); //add record if addEntity returns true
                    }

                    //if(isNaN($$("entityTable").getSelectedItem().percent) || $$("entityTable").getSelectedItem().percent == 0){
                    //    console.log($$("entityTable").getSelectedItem())
                    //    $$("entityTable").getSelectedItem().percent = 100 / pb.entities.entityNaNCount()
                    //}

                    break;

                case "Delete":
                    //don't remove the last record
                    if($$("entityTable").getIndexById($$("entityTable").getSelectedId()) + 1 != $$("entityTable").count()){


                        //console(($$("entityTable").getSelectedItem().entityId)
                        pb.entities.removeEntity(($$("entityTable").getSelectedItem().entityId))

                        $$("entityTable").remove($$("entityTable").getSelectedId());
                    }



                    break



            }



        }




    },


    //on_click: {
    //
    //    delbtn: function(e, id, trg){
    //        //id.column - column id
    //        //id.row - row id
    //        console.log("Delete row: "+id);
    //        //block default onclick event
    //        return false;
    //    },
    //
    //    addbtn: function(e, id, trg){
    //        //id.column - column id
    //        //id.row - row id
    //        console.log("Add row: "+ id);
    //        //block default onclick event
    //        return false;
    //    }
    //}
}





//------------------------total count tab

//-----total count form
popGui.countForm = {
    id: "countForm",
    view: "form",
    borderless: true,
    elementsConfig: {"labelAlign": "right"},
    elements: [
        {
            rows: [
                {template: "Choose Start and End Year", type: "section"},
                {
                    cols: [
                        {name: "startYear", view: "text", label: "Start Year", value: new Date().getFullYear() },
                        {name: "endYear", view: "text", label: "End Year", value: new Date().getFullYear() + 5}

                    ]
                }
            ]
        },
        {
            rows: [
                {template: "Choose Start and End Population Counts", type: "section"},
                {
                    cols: [
                        {name: "startValue", view: "text", label: "Start Population", value: 0},
                        {name: "endValue",  view: "text", label: "End Population", value: 0}

                    ]
                }
            ]
        }
    ]

};


//-------total count table

var countTableCol = undefined;

popGui.countTable = {

    id: "countTable",
    view: "datatable",
    css: "table",
    width: 10,
    //rowHeight: 20,
    select: "cell",
    navigation:true,
    columns:[
        { id:"year", header:"Year"},
        { id:"count", editor:"text", header:"Total Population", format:webix.i18n.intFormat},
        { id:"lockedCount", header:"<span class='webix_icon fa-lock'></span>", width: 40, template:"{common.checkbox()}", editor:"inline-checkbox"},
        { id: "delta", editor: "text", header: "Delta", format:webix.i18n.intFormat},
        { id:"lockedDelta", header:"<span class='webix_icon fa-lock'></span>", width: 40, template:"{common.checkbox()}", editor:"inline-checkbox"}


    ],

    editable:true,
    autoheight:true,
    autowidth:true,

    data: pb.counts.data,

    rules:{
        //count:function(obj){ return !isNaN(obj);},

    },

    on: {

        //hack to keep track of genders
        "onItemClick": function(obj){
            if(obj.hasOwnProperty("column")){
                countTableCol = obj.column;
            }

        },

        "onDataUpdate": function (id, obj) {
            if (isNaN(obj.count)) {
                webix.alert("Values must be a valid Number!");
                return
            }
            pb.counts.updateRecord(obj, countTableCol);

        }
    }





};


//---------------------------population tab
//----population table

var itemGender = undefined; //used to track which column has been updated



//population Table
popGui.popTable = {

    id: "popTable",
    view: "datatable",
    css: "popTable",
    rowHeight: 20,
    select: "cell",
    navigation:true,
    columns:[
        { id:"lockedMale", header:"<span class='webix_icon fa-lock'></span>", width: 40, template:"{common.checkbox()}", editor:"inline-checkbox"},
        { id:"male",	editor:"text",		header:"Male %", width:160, format:webix.i18n.numberFormat},
        { id:"age", header:"Age" , width:100},
        { id:"female",	editor:"text",		header:"Female %", width:160, format:webix.i18n.numberFormat},
        { id:"lockedFemale", header:"<span class='webix_icon fa-lock'></span>", width: 40, template:"{common.checkbox()}", editor:"inline-checkbox"}

    ],

    editable:true,
    autoheight:true,
    autowidth:true,

    data: pb.demographics.data,

    rules:{
        male:function(obj){ return !isNaN(obj) && obj > 0 && obj < 100;},
        female:function(obj){ return !isNaN(obj) && obj > 0 && obj < 100; }
    },

    on:{
        //hack to keep track of genders
        "onItemClick": function(obj){
            if(obj.hasOwnProperty("column")){
                itemGender = obj.column;
            }

        },

        "onDataUpdate":function(id, obj) {

            //validate numbers and values
            if (isNaN(obj.male) || isNaN(obj.female)) {
                webix.alert("Values must be a valid Number!");
                return
            }
            if (obj.male > 100 || obj.male < 0 || obj.female > 100 || obj.female < 0) {
                webix.alert("Values must be between 0 and 100");
                return
            }


            //lock the updated value
            if(itemGender == "male" || itemGender == "female"){
                pb.demographics.lock(obj.age, itemGender);
            }
            itemGender = undefined;

            pb.demographics.setNumbers();

            if (pb.demographics.totalLocked() > 100) {
                webix.alert("Sum of all locked values must be less than 100");
                return
            }

            ee.emitEvent("pdUpdate")


        }
    }

};

//-----------------------------------------tabs


//------entity tab
popGui.entityTab = {
    header:"Geography",
    body:{
        rows: [
            {
                view: "template",
                height: 50,
                template: "<div id='entityIdHolder'></div>"
            },
            {
                height: 50,
                template: "<p>Add areas by <b>double click</b> on the map</p>"
            },
            popGui.entityTable
        ]
    }
};


//-----demographics tab
popGui.demographicTab = {
    header:"Demographics",
    body:{
        rows: [
            {
                height: 400,
                id: "popPyramid"
            },
            popGui.popTable
        ]
    }
};


//-----total population tab
popGui.popSizeTab = {
    header:"Population Size",
    body:{
        rows: [
        //    popGui.countForm,
        //
            {
                height: 400,
                id: "popGraph"
            },

            { type:"section", template:"Change start year" },
            {
                //margin: 10,
                padding: 10,
                borderless: true,
                 cols:[
                    {
                        view:"icon",
                        icon:"plus",
                        label:"",
                        width:50,
                        on:{
                            "onItemClick": function() {
                                pb.counts.startYearAdd();
                                $$("countTable").add(pb.counts.data[0], 0)
                            }.bind(pb.counts)
                        }
                    },
                    {
                        view:"icon",
                        icon:"minus",
                        label:"",
                        width:50,
                        on:{
                            "onItemClick": function(){
                                pb.counts.startYearRemove();
                                $$("countTable").remove($$("countTable").getFirstId());
                            }.bind(pb.counts)
                        }

                    }
             ]},
            {},
            popGui.countTable,
            {},
            {
                //margin: 10,
                padding: 10,
                borderless: true,
                cols:[
                    {
                        view:"icon",
                        icon:"plus",
                        label:"",
                        width:50,
                        on:{
                            "onItemClick": function() {
                                pb.counts.endYearAdd();
                                $$("countTable").add(pb.counts.data[pb.counts.data.length - 1]);
                            }.bind(pb.counts)
                        }
                    },
                    {
                        view:"icon",
                        icon:"minus",
                        label:"",
                        width:50,
                        on:{
                            "onItemClick": function(){
                                pb.counts.endYearRemove();
                                $$("countTable").remove($$("countTable").getLastId());
                            }.bind(pb.counts)
                        }
                    }
            ]},
            { type:"section", template:"Change end year" }
        ]
    }

};



//---------------------------------------main body

//---------builder segment


//pop builder gui
popGui.uiPopBuilder = {
    type: "line",
    borderless:false,
    width: 500,
    rows:[
        {
            view: "template",
            type: "header",
            template: "Population Builder"
        },
        {
            type: "line",
            borderless:false,
            view:"tabview",
            cells:[
                popGui.entityTab,
                popGui.popSizeTab,
                popGui.demographicTab
            ]
        }
    ]
};



//--------map segment
popGui.uiMap = {
    rows:[
        {
            view: "template",
            type: "header",
            template: "Map"
        },
        {
            id: "mapwindow",
            template: "<div id = 'map'></div>"
        }
    ]

};





//--------main layout
popGui.uiMainLayout = {
    container: "uiMainLayout",
    height: 1000,
    scroll: "y",
    cols: [
        popGui.uiMap,
        popGui.uiPopBuilder
    ]
};




//header
popGui.uiHeader = {
    rows:[
        {
            cols: [
                {
                    view: "template",
                    type: "header", template: "nquiringminds - population demand model"
                }


            ]
        }
    ]
};



//------------------------page layout

popGui.uiPageLayout = {
    rows: [
        popGui.uiHeader,
        popGui.uiMainLayout
    ]
};



var w = webix.ui(popGui.uiPageLayout);




//-------------population demomgraphics events

ee.addListener("pdUpdate", function(){ //listen for updates and refresh tabel
    pb.demographics.normalize();
    $$("popTable").refresh();
});


////----------------population count form events
//$$("countForm").elements.startYear.attachEvent("onChange", function(){ee.emitEvent("countFormUpdate", [$$("countForm").getValues(), popBuild] )});
//$$("countForm").elements.endYear.attachEvent("onChange", function(){ee.emitEvent("countFormUpdate", [$$("countForm").getValues(), popBuild] )});
//$$("countForm").elements.startValue.attachEvent("onChange", function(){ee.emitEvent("countFormUpdate", [$$("countForm").getValues(), popBuild] )});
//$$("countForm").elements.endValue.attachEvent("onChange", function(){ee.emitEvent("countFormUpdate", [$$("countForm").getValues(), popBuild] )});
//
//ee.addListener("cdUpdate", function(){ //listen for updates and refresh table
//    $$("countTable").refresh();
//});



ee.addListener("countsUpdate", function(){
    $$("countTable").refresh();
})


//-------------entity events

ee.addListener("entityUpdate", function(){

    $$("entityTable").add(pb.entities.data[0], 0)

    $$("entityTable").refresh();
})

