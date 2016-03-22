



var initMap = function() {

    var map = L.map('map').setView([50.9, -1.3], 11);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'lv1903.n7i722bb',
        accessToken: 'pk.eyJ1IjoibHYxOTAzIiwiYSI6IjFiYjk4OGE1M2RiOGYyZjIyNTBjNTViNWQzNDVlMjMxIn0.4xOk3pGWKbBlIwvZK5B-RQ'
    }).addTo(map);



    $.ajax("http://q.nqminds.com/v1/datasets/4JWEV09nDe/data?opts={%22limit%22:10000}")
        .done(function (res) {

            var style = {
                "color": "#1f78b4",
                "weight": 1,
                "opacity": 0.65
            };



            var onEachFeature = function(feature, layer){

                layer.on('mouseover', function(e) {
                    document.getElementById("entityIdHolder").innerHTML = "<h4>Id: " + feature.properties.LSOA11CD +
                                                                            "&nbsp;&nbsp;&nbsp;&nbsp; Name: " +  feature.properties.LSOA11NM +
                                                                           "<h4/>"


                });
                layer.on('mouseout', function(e) {
                    document.getElementById("entityIdHolder").innerHTML = ""
                });

                layer.on('dblclick', function (e) {

                    var id = e.target.feature.properties.LSOA11CD;
                    var name = e.target.feature.properties.LSOA11NM;

                    var recorderd_added = pb.entities.addEntity({entityId: id, name: name}, 0);

                    //alert duplicates

                    if(recorderd_added){
                        ee.emitEvent("entityUpdate")
                    } else {
                        webix.alert("This area has already been added");

                    }


                });

            };

            var geoJsonLayer = L.geoJson(res.data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);


        });




};
