var app =  angular.module('ITA',["checklist-model","highcharts-ng", "angularUtils.directives.dirPagination", "ui.bootstrap"]);
app.run(function(paginationConfig){
    paginationConfig.firstText='<<';
    paginationConfig.previousText='<';
    paginationConfig.nextText='>';
    paginationConfig.lastText='>>';
});
app.filter('offset', function() {
    return function(input, start) {
        if (input) {
            start = +start;
            return input.slice(start);
        }
        return [];
    };
});
app.service('$sharedContestProperties', function () {
    var property={
        "main": "",
        "mId": "",
        "selectedModule": "",
        "sDate": "",
        "eDate": "",
        "users": "",
        "email": ""
    };
    return {
        getProperty: function (prop) {
            if(prop=="main")
                return property.main;
            else if(prop=="mId")
                return property.mId;
            else if(prop=="sDate")
                return property.sDate;
            else if(prop=="eDate")
                return property.eDate;
            else if(prop=="users")
                return property.users;
            else if(prop=="email")
                return property.email;
            else
                return property.selectedModule;
        },
        setProperty: function(prop, value) {
            if(prop=="main")
                property.main = value;
            else if(prop=="mId")
                property.mId = value;
            else if(prop=="sDate")
                property.sDate = value;
            else if(prop=="users")
                property.users = value;
            else if(prop=="email")
                property.email = value;
            else if(prop=="eDate")
                property.eDate = value;
            else
                property.selectedModule = value;
        }
    };
});