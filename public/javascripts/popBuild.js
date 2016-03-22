PopBuild = function(demog_data){

    this.demog_data = demog_data; //demographics data
    this.normalisePct();

    this.count_data = [ //total population count year value lock
        {year: "2016", count: 10, delta: 20, lockedCount: 1},
        {year: "2017", count: 20, delta: 20, lockedCount: 1},
        {year: "2018", count: -40, delta: 20, lockedCount: 1},
        {year: "2019", count: 60, delta: 20, lockedCount: 1},
        {year: "2020", count: 80, delta: 20, lockedCount: 1},
        {year: "2021", count: 100, delta: 20, lockedCount: 1}
    ];
    //add locks?

    var self = this;



    function listenerPdUpdate(){
        self.normalisePct();
    }
    ee.addListener("pdUpdate", listenerPdUpdate);







    ee.addListener("countFormUpdate", this.listenerCountFormUpdate);
    ee.addListener("countTableUpdate", this.listenerCountTableUpdate);
    ee.addListener("countGraphUpdate", this.listenerCountGraphUpdate);

};


//demographic percentages methods

PopBuild.prototype.normalisePct = function(){

    var self = this;

    var totalPop = this.sumPercent();
    var totalLocked = this.sumLockedPct();
    var totalFree = this.sumFreePct();

    for(i in self.demog_data){
        var obj = self.demog_data[i];
        if (!obj.lockedFemale) {
            obj.female = obj.female / totalFree * (100 - totalLocked);
            if(obj.female <= 0){obj.female = 0.0001} //avoid negative values and errors

        }
        if (!obj.lockedMale) {
            obj.male = obj.male / totalFree * (100 - totalLocked);
            if(obj.male <= 0){obj.male = 0.000001} //avoid negative values and errors
        }
    }
};

//total
PopBuild.prototype.sumPercent = function(){

    var self = this;

    var sum = 0;

    for(i in self.demog_data){
        var obj = self.demog_data[i];
        sum += Number(obj.female) + Number(obj.male)
    }
    return sum
};

//max value
PopBuild.prototype.maxPctValue = function(){

    return Math.max(
        d3.max(this.demog_data, function(d) { return d.male; }),
        d3.max(this.demog_data, function(d) { return d.female; })
    );

};

//lock obj by id and gender
PopBuild.prototype.lockIdPct = function(id, gender){

    var self = this;

    for(i in self.demog_data) {
        var obj = self.demog_data[i];
        if (id == obj.id && gender == "female") { obj.lockedFemale = 1 }
        if (id == obj.id && gender == "male") { obj.lockedMale = 1 }
    }
};

//sum locked
PopBuild.prototype.sumLockedPct = function(){

    var self = this;

    var sum = 0;

    for(i in self.demog_data){
        var obj = self.demog_data[i];
        if (obj.lockedFemale) {
            sum += Number(obj.female)
        }
        if (obj.lockedMale) {
            sum += Number(obj.male)
        }

    }
    return sum
};

PopBuild.prototype.sumFreePct = function(){

    var self = this;

    var sum = 0;

    for(i in self.demog_data){
        var obj = self.demog_data[i];
        if (!obj.lockedFemale) {
            sum += Number(obj.female)
        }
        if (!obj.lockedMale) {
            sum += Number(obj.male)
        }

    }
    return sum
};







//total population count methods

PopBuild.prototype.startYearAdd = function(){

    var self = this;
    var obj = {year: self.count_data[0].year - 1, count: Number(self.count_data[0].count), lockedCount: 1};
    self.count_data.unshift(obj);
    $$("countTable").add(obj, 0);
    ee.emitEvent("countTableUpdate", [self])

};

PopBuild.prototype.startYearRemove = function(){

    var self = this;
    self.count_data.shift();
    $$("countTable").remove($$("countTable").getFirstId());
    ee.emitEvent("countTableUpdate", [self])

};

PopBuild.prototype.endYearAdd = function(){

    var self = this;
    var obj = {year: Number(self.count_data[self.count_data.length - 1].year) + 1, count: Number(self.count_data[self.count_data.length - 1].count), lockedCount: 1};
    self.count_data.push(obj);
    $$("countTable").add(obj);
    ee.emitEvent("countTableUpdate", [self])

};

PopBuild.prototype.endYearRemove = function(){

    var self = this;
    self.count_data.pop();
    $$("countTable").remove($$("countTable").getLastId());
    ee.emitEvent("countTableUpdate", [self])

};


//Form updates
PopBuild.prototype.listenerCountFormUpdate = function(obj, self){

    //on form changes update table

    //linear interpolation
    yearArray = [];
    for(var year = Number(obj.startYear); year <= obj.endYear; year ++){
        yearArray.push(year)
    }
    valueArray = everpolate.linear(yearArray, [Number(obj.startYear), Number(obj.endYear)], [Number(obj.startValue), Number(obj.endValue)]);


    //update count data obj
    var new_count_data = [];
    for(var i in yearArray) {

        var year = yearArray[i];
        var old_obj = self.count_data.filter(function (el) {
            return el.year == year
        })[0];

        if(old_obj.lockedCount == 0){
            new_count_data.push({year: yearArray[i], count: Math.round(valueArray[i]), lockedCount: 0})
        } else if(i == 0 || i == yearArray.length - 1){
            new_count_data.push({year: yearArray[i], count: Math.round(valueArray[i]), lockedCount: 1})
        } else {
            new_count_data.push(old_obj);
        }


    }
    self.count_data = new_count_data;


    //update table
    $$("countTable").clearAll();
    for(var i in self.count_data){
        $$("countTable").add(self.count_data[i]);
    }

    //update graph
    ee.emitEvent("updateCountGraph", [self.count_data]);



};

//Table updates
PopBuild.prototype.listenerCountTableUpdate = function(self){

    //listner for count table update


    //auto updates count data obj
    //turn count strings to numbers
    for(i in self.count_data){
        self.count_data[i].count = Math.round(self.count_data[i].count)
    }

    //update form
    $$("countForm").setValues({
        startYear: self.count_data[0].year,
        endYear: self.count_data[self.count_data.length - 1].year,
        startValue: self.count_data[0].count,
        endValue: self.count_data[self.count_data.length - 1].count
    });

    //update graph
    ee.emitEvent("updateCountGraph", [self.count_data]);


};

//Table updates
PopBuild.prototype.listenerCountGraphUpdate = function(self){

    //listner for count graph update


    //auto updates count data obj
    //turn count strings to int numbers
    for(i in self.count_data){
        self.count_data[i].count = Math.round(self.count_data[i].count)
    }

    //update form
    $$("countForm").setValues({
        startYear: self.count_data[0].year,
        endYear: self.count_data[self.count_data.length - 1].year,
        startValue: self.count_data[0].count,
        endValue: self.count_data[self.count_data.length - 1].count
    });

    ////update graph
    //ee.emitEvent("", [self.count_data]);

    //update graph
    ee.emitEvent("updateCountGraph", [self.count_data]);
    ee.emitEvent("cdUpdate");




};



