PopulationBuilder = function(){

    this.demographics = new Demographics();
    this.counts = new PopulationCounts();
    this.entities = new Entities();

};

//--------------------------------------------------------------------------------



Entities = function(){
    this.data = [{entityId:"", name: "", percent: 0, lockedPercent: 0}]
};

Entities.prototype.addEntity = function(sObj, position){


    if(position == undefined){position = -1}

    var self = this;

    var tObj = {};

    if(sObj.hasOwnProperty("entityId")){
        tObj.entityId = sObj.entityId;
    } else {
        tObj.entityId = "";
    }

    if(sObj.hasOwnProperty("name")){
        tObj.name = sObj.name;
    } else {
        tObj.name = "";
    }

    if(sObj.hasOwnProperty("percent")){
        tObj.percent = sObj.percent;
    } else {
        tObj.percent = "";
    }

    if(sObj.hasOwnProperty("lockedPercent")){
        tObj.lockedPercent = sObj.lockedPercent;
    } else {
        tObj.lockedPercent = 0;
    }

    var recorded_added = undefined;

    if(self.duplicateEntity(tObj.entityId) == 0){
        recorded_added = true;

        if(position == -1) {
            this.data.push(tObj);
        } else if(position == 0){
            this.data.unshift(tObj);
        }


    } else {
        recorded_added = false;
    }

    self.normalize();

    return recorded_added;

};


Entities.prototype.duplicateEntity = function(entityId){
    return this.data.filter(function(el){return el.entityId == entityId}).length
}


Entities.prototype.removeEntity = function(entityId){
    var self = this;
    for(var i in self.data){
        if(self.data[i].entityId == entityId){
            self.data.splice(i, 1)
        }

    }
    self.normalize();
};

Entities.prototype.entityNaNCount = function(){ //count number of entities with percent != NaN or 0
    var self = this;
    var count = 0;
    for(var i in self.data){
        if(self.data[i].entityId.length > 0) {
            //console.log(i + ": " + self.data[i].percent)
            if(isNaN(self.data[i].percent) || self.data[i].percent == 0){
                count ++
            }

        }
    }
    return count
};

Entities.prototype.entityCount = function(){
    var self = this;
    var count = 0;
    for(var i in self.data){
        if(self.data[i].entityId.length > 0) {
            count ++
        }
    }
    return count
};

Entities.prototype.unlockedCount = function(){
    var self = this;
    var count = 0;
    for(var i in self.data){
        if(self.data[i].entityId.length > 0) {
            if (!self.data[i].lockedPercent) {
                count++
            }
        }
    }
    return count
}


Entities.prototype.total = function(){
    var self = this;
    var sum = 0;
    for(var i in self.data){
        if(self.data[i].entityId.length > 0) {
            sum += Number(self.data[i].percent)
        }
    }
    return sum
};

Entities.prototype.totalLocked = function(){
    var self = this;
    var sum = 0;
    for(var i in self.data){
        if(self.data[i].entityId.length > 0) {
            var obj = self.data[i];
            if (obj.lockedPercent) {  //count if locked and a number
                if(!isNaN(Number(obj.percent))) {
                    sum += Number(obj.percent)
                }
            }
        }
    }
    return sum
};

Entities.prototype.totalUnlocked = function(){
    var self = this;
    var sum = 0;
    for(var i in self.data){
        if(self.data[i].entityId.length > 0) {
            var obj = self.data[i];
            if (!obj.lockedPercent) {  //count if unlocked and a number
                if(!isNaN(Number(obj.percent))) {
                    sum += Number(obj.percent);
                }
            }
        }
    }
    return sum
};

Entities.prototype.normalize = function(){
    var self = this;

    self.fixNaN();

    var totalLocked = self.totalLocked();
    var totalUnlocked = self.totalUnlocked();

    for(i in self.data){
        var obj = self.data[i];
        if (!obj.lockedPercent) {
            obj.percent = obj.percent / totalUnlocked * (100 - totalLocked);
            //if(obj.percent <= 0){obj.percent = 0.0001} //avoid negative values and errors
        }
    }
};

Entities.prototype.fixNaN = function(){

    var self = this;
    var totalLocked = self.totalLocked();
    var unlockedCount = self.unlockedCount();

    for(i in self.data){
        var obj = self.data[i];
        if(obj.entityId.length > 0) {
            if (isNaN(obj.percent) || obj.percent == 0) {
                obj.percent = (100 - totalLocked) / Math.max(1, unlockedCount - 1)
            }
        }
    }

    //$$("entityTable").getSelectedItem().percent = (100 - pb.entities.totalLocked()) / Math.max(1, pb.entities.unlockedCount() - 1)
};





//--------------------------------------------------------------------------------

PopulationCounts = function(){};

PopulationCounts.prototype.setData= function(data){
    var self = this;
    self.data = data;
    self.setNumbers();
    self.addDeltas();
    self.setAllDeltaUnlocked();
};

PopulationCounts.prototype.setNumbers = function(){
    var self = this;
    for(var i in self.data){
        self.data[i].count = Number(self.data[i].count)
        self.data[i].delta = Number(self.data[i].delta)
    }
};

//clear data
PopulationCounts.prototype.clearData= function(){
    var self = this;
    self.data = [];
};


PopulationCounts.prototype.addDeltas = function(){
    var self = this;
    for(var i in self.data){
        self.calcDelta(self.data[i]);
        //self.data[i].delta = self.delta(self.data[i]);
    }
};





PopulationCounts.prototype.setAllDeltaUnlocked = function(){
    var self = this;
    for(var i in self.data){
        self.data[i].lockedDelta = 0;
    }
};

PopulationCounts.prototype.lockCount = function(year, col){
    var self = this;
    for(var i in self.data){
        if(self.data[i].year == year){
            self.data[i].lockedCount = 1;
            self.data[i].lockedDelta = 0;
        }
    }
};


PopulationCounts.prototype.updateRecord = function(new_record, update_col){
    var self = this;
    if(update_col == "count"){
        new_record.lockedCount = 1;
        new_record.lockedDelta = 0;
    }
    if(update_col == "delta"){
        new_record.lockedCount = 0;
        new_record.lockedDelta = 1;
    }

    for(var i in self.data){
        if(self.data[i].year == new_record.year){
            self.data[i] = new_record
        }
    }
    self.setNumbers();
    self.update();
};

PopulationCounts.prototype.update = function(){
    var self = this;
    for(var i in self.data){
        if(self.data[i].lockedDelta == 0){
            self.calcDelta(self.data[i])
        } else {
            self.calcCount(self.data[i])
        }
    }

    ee.emitEvent("countsUpdate")

};

PopulationCounts.prototype.getCount = function(year){
    var self = this;
    return self.data.filter(function(el){
        return el.year == year
    })[0].count;
};

PopulationCounts.prototype.calcCount = function(obj){
    var self = this;
    var year = obj.year;
    if(year == self.startYear()){
        obj.count =  self.getDelta(year);
    } else {
        obj.count = self.getCount(year - 1) +  self.getDelta(year);
    }
};


PopulationCounts.prototype.getDelta = function(year){
    var self = this;
    return self.data.filter(function(el){
        return el.year == year
    })[0].delta;
};

PopulationCounts.prototype.calcDelta = function(obj){
    var self = this;
    var year = obj.year;
    if(year == self.startYear()){
        obj.delta =  self.getCount(year);
    } else {
        obj.delta = self.getCount(year) - self.getCount(year - 1);
    }
};



//get start year
PopulationCounts.prototype.startYear = function(){
    var self = this;
    return self.data[0].year;
};

//get end year
PopulationCounts.prototype.endYear = function(){
    var self = this;
    return self.data[self.data.length - 1].year;
};




PopulationCounts.prototype.startYearAdd = function(){

    console.log(this)

    var self = this;
    var obj = {year: self.startYear() - 1, count: self.getCount(self.startYear()), lockedCount: 1, delta: self.getCount(self.startYear()), lockedDelta: 0 };
    self.data.unshift(obj);
    self.update();

    //$$("countTable").add(obj, 0);
    //ee.emitEvent("countTableUpdate", [self])

};

PopulationCounts.prototype.startYearRemove = function(){

    var self = this;
    self.data.shift();
    self.update();

    //ee.emitEvent("countTableUpdate", [self])

};

PopulationCounts.prototype.endYearAdd = function(){

    var self = this;
    var obj = {year: Number(self.endYear()) + 1, count: self.getCount(self.endYear()), lockedCount: 1, delta: 0, lockedDelta: 0};
    self.data.push(obj);
    self.update();
    //ee.emitEvent("countTableUpdate", [self])

};

PopulationCounts.prototype.endYearRemove = function(){

    var self = this;
    self.data.pop();
    self.update();

    //ee.emitEvent("countTableUpdate", [self])

};









//----------------------------------------------------------------------------------

Demographics = function(){};

Demographics.prototype.setData = function(data){
    var self = this;
    self.data = data;
    self.setAllUnlocked();
    self.setNumbers();
    self.normalize();
};

Demographics.prototype.setNumbers = function(){
    var self = this;
    for(var i in self.data){
        self.data[i]["female"] = Number(self.data[i]["female"]);
        self.data[i]["male"] = Number(self.data[i]["male"]);
    }
};

Demographics.prototype.lock = function(age, gender){
    var self = this;
    for(var i in self.data){
        if(self.data[i].age == age){
            if(gender == "female"){ self.data[i]["lockedFemale"] = 1; }
            if(gender == "male"){ self.data[i]["lockedMale"] = 1; }
            return
        }
    }
};

Demographics.prototype.setAllUnlocked = function(){
    var self = this;
    for(var i in self.data){
        self.data[i]["lockedFemale"] = 0;
        self.data[i]["lockedMale"] = 0;
    }
};

Demographics.prototype.total = function(){
    var self = this;
    var sum = 0;
    for(var i in self.data){
        var obj = self.data[i];
        sum += Number(obj.female) + Number(obj.male)
    }
    return sum
};

Demographics.prototype.totalLocked = function(){
    var self = this;
    var sum = 0;
    for(var i in self.data){
        var obj = self.data[i];
        if (obj.lockedFemale) {
            sum += Number(obj.female)
        }
        if (obj.lockedMale) {
            sum += Number(obj.male)
        }
    }
    return sum
};

Demographics.prototype.totalUnlocked = function(){
    var self = this;
    var sum = 0;
    for(var i in self.data){
        var obj = self.data[i];
        if (!obj.lockedFemale) {
            sum += Number(obj.female)
        }
        if (!obj.lockedMale) {
            sum += Number(obj.male)
        }
    }
    return sum
};

Demographics.prototype.normalize = function(){
    var self = this;
    var totalLocked = self.totalLocked();
    var totalUnlocked = self.totalUnlocked();
    for(i in self.data){
        var obj = self.data[i];
        if (!obj.lockedFemale) {
            obj.female = obj.female / totalUnlocked * (100 - totalLocked);
            if(obj.female <= 0){obj.female = 0.0001} //avoid negative values and errors
        }
        if (!obj.lockedMale) {
            obj.male = obj.male / totalUnlocked * (100 - totalLocked);
            if(obj.male <= 0){obj.male = 0.0001} //avoid negative values and errors
        }
    }
};


