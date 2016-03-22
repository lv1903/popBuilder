/**
 * Created by leovalberg on 15/02/2016.
 */




var popData = [

    {id: 0 , age:" 0-4 ", male:  "34", female:  "43" },
    {id: 1 , age:" 10-14 ", male:  "45", female:  "39" },
    {id: 2 , age:" 15-20 ", male:  "32", female:  "39" },
    {id: 3 , age:" 15-19 ", male:  "40", female:  "39" },
    {id: 4 , age:" 20-24 ", male:  "44", female:  "33" },
    {id: 5 , age:" 25-29 ", male:  "37", female:  "38" },
    {id: 6 , age:" 30-34 ", male:  "37", female:  "45" },
    {id: 7 , age:" 35-39 ", male:  "32", female:  "33" },
    {id: 8 , age:" 40-44 ", male:  "46", female:  "52" },
    {id: 9 , age:" 45-49 ", male:  "51", female:  "57" },
    {id: 10 , age:" 50-54 ", male:  "59", female:  "56" },
    {id: 11 , age:" 55-59 ", male:  "59", female:  "58" },
    {id: 12 , age:" 60-64 ", male:  "53", female:  "55" },
    {id: 13 , age:" 65-69 ", male:  "38", female:  "41" },
    {id: 14 , age:" 70-74 ", male:  "41", female:  "47" },
    {id: 15 , age:" 75-79 ", male:  "27", female:  "28" },
    {id: 16 , age:" 80-84 ", male:  "17", female:  "19" },
    {id: 17 , age:" 85-89 ", male:  "6", female:  "10" },
    {id: 18 , age:" 90+ ", male:  "3", female:  "5" }

];

var countData =  [//total population count year value lock
    {year: "2016", count: 10, delta: 20, lockedCount: 1},
    {year: "2017", count: 20, delta: 20, lockedCount: 1},
    {year: "2018", count: -40, delta: 20, lockedCount: 1},
    {year: "2019", count: 60, delta: 20, lockedCount: 1},
    {year: "2020", count: 80, delta: 20, lockedCount: 1},
    {year: "2021", count: 100, delta: 20, lockedCount: 1}
];



popData.reverse();

var pb = new PopulationBuilder();
pb.demographics.setData(popData);
pb.counts.setData(countData);


window.onload = function() {


    var guiPopPyramid = new GuiPopPyramid("popPyramid", "00");
    var guiPopGraph = new GuiPopGraph("popGraph", "01");

    initMap();




};



