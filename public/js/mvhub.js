//  mvHubOpen, copyright (c) by James F Thompson and others
// Distributed under an MIT license: https://opensource.org/licenses/MIT

var mvHubServices = angular.module('mvHubServices', ['ngStorage']);

mvHubServices.run(function($sessionStorage){
    if (!$sessionStorage.access) {
        $sessionStorage.access = {};
        $sessionStorage.access.user = "";
        $sessionStorage.access.password = "";
        $sessionStorage.access.loggedIn = false;
    }
});

mvHubServices.factory('mvHubDB', function ($http, $q,$sessionStorage){
    var mvhubdb = {};

    return mvhubdb;
});

mvHubServices.factory('mvHub', function ($http, $q,$modal,$sessionStorage){
    var mvhub = {};

    mvhub.getPager = function(dataArray, pageSize){
        var pager = {};
        if (!dataArray){
            pager.data = [];
        } else {
            pager.data = dataArray;
        }
        if (!pageSize) pageSize=10;
        pager.pageSize = pageSize;
        pager.pageNumber=1;

        pager.maxPage=function(){
            if (pager.data.length === 0) return 0;
            return Math.round(pager.data.length/pager.pageSize);
        };
        pager.setPage = function(pageNumber){
           if(pageNumber<1) pageNumber=1;
           if(pageNumber > pager.maxPage()) pageNumber=pager.maxPage();
            pager.pageNumber=pageNumber;
        };

        pager.prevPage=function(){
            pager.setPage(pager.pageNumber-1);
        };
        pager.nextPage=function(){
            pager.setPage(pager.pageNumber+1);
        };
        pager.firstPage=function(){
            pager.setPage(1);
        };
        pager.lastPage=function(){
            pager.setPage(pager.maxPage());
        };
        pager.pages = function(){
            var pCnt = pager.maxPage();
            var pages = [];
            for (i = 1; i <= pCnt; i++) {
               pages.push(i);
            }
            return pages;
        };
        pager.rows = function(){
            var min = pager.pageSize*(pager.pageNumber-1);
            var max = min+pager.pageSize-1;
            var rows = [];
            for (i = min; i <= max; i++) {
                if (pager.data[i]){
                    var obj = pager.data[i];
                    obj.$$parentIndex = i;
                    rows.push(obj);
                }
            }
            return rows;
        };
        return pager;
    };

    mvhub.editModal = function (editobj, template, controller, parentObj, size) {
        var deferred = $q.defer();

        if (!editobj) {
            editobj = {};
            editobj.$$isNew_Entry$$ = true;
        }

        var modalInstance = $modal.open({
            templateUrl: template,
            controller: controller,
            size: size || 'md',
            resolve: {
                editObj: function () {
                    return JSON.parse(JSON.stringify(editobj));
                },
                parentObj: function () {
                    return parentObj;
                }
            }
        });
        modalInstance.result.then(function (returnItem) {
            deferred.resolve(returnItem);
        }, function () {
            deferred.reject('Cancelled');
        });
        return deferred.promise;
    };

    return mvhub;
});

mvHubServices.filter('mvRecordNotation', function () {
    return function (field) { // filter arguments
        var rtn;
        switch (field.record) {
            case "I":
                rtn = "ID";
                break;
            case "W":
                rtn = "WORK.RECORD";
                break;
            default:
                rtn = "RECORD";
        }

        rtn += "<" + field.attr;
        if (field.vpos) rtn += "," + field.vpos;
        if (field.spos) rtn += "," + field.spos;
        rtn += ">";
        rtn += " (" + field.type;
        if (field.readonly)rtn += ",RO"
        if (field.query)rtn += ",Q"
        rtn += ")";
        return rtn;
    };
});


//
//  Support Routines
//
function isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (!propName.startsWith("$$")) {
            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] != b[propName]) {
                return false;
            }
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

function moveElement(arr, old_index, new_index) {
    while (old_index < 0) {
        old_index += arr.length;
    }
    while (new_index < 0) {
        new_index += arr.length;
    }
    if (new_index >= arr.length) {
        var k = new_index - arr.length;
        while ((k--) + 1) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
}