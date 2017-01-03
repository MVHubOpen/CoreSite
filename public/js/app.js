var app = angular.module('App', [
    'ngRoute',
    'ng.jsoneditor',
    'jsonFormatter',
    'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.codemirror'
]);


app.config(function ($routeProvider) {

    $routeProvider.when('/home', {
        templateUrl: 'pages/home.html',
        controller: 'HomeController'
    });

    $routeProvider.when('/tester', {
        templateUrl: 'pages/tester.html',
        controller: 'TesterController'
    });
    $routeProvider.when('/editor', {
        templateUrl: 'pages/mapEditor.html',
        controller: 'MapEditorController'
    });
    $routeProvider.otherwise({
        redirectTo: "/home"
    });
});


app.run(function ($rootScope, $modal, $q) {
    var overlay = document.getElementById("overlayDiv");
    $rootScope.overlayForm = function (percent) {
        //document.getElementById("overlayDiv").style.width = percent + "%";
        overlay.style.height = percent + "%";
    };

    $rootScope.editModal = function (editobj, template, controller, parentObj, size) {
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
});


app.controller('HomeController', function ($scope, $http) {

    console.log('Home');

});

app.controller('TesterController', function ($scope, $http) {
    var json = {
        "Array": [1, 2, 3],
        "Boolean": true,
        "Null": null,
        "Number": 123,
        "Object": {"a": "b", "c": "d"},
        "String": "Hello World"
    };
    console.log('Tester');

    $scope.data = {};
    $scope.data.action = "Read";
    $scope.data.key = {"mapId": "MVHUB.MAP"};
    $scope.data.item = {};
    $scope.reply = {};
    $scope.serviceId = "MVHUB.MAP";
    $scope.username = "devweb";
    $scope.password = "devweb";


    $scope.options = {mode: 'tree'};

    $scope.changeOptions = function () {
        $scope.options.mode = $scope.options.mode == 'tree' ? 'code' : 'tree';
    };

    $scope.submitCall = function () {


        var headers = 'Basic ' + window.btoa($scope.username + ":" + $scope.password);
        headers['Content-Type'] = "application/json";
        var pData = angular.toJson($scope.data);
        var url = "/Service/" + $scope.serviceId;
        $http({
            method: "POST",
            url: url,
            headers: headers,
            withCredentials: true,
            data: pData
        }).then(function (resp) {

                $scope.reply = resp.data;
            },
            function () {
                def.reject([
                    {
                        error: "Connection Error",
                        errorCode: 500
                    }
                ]);
            });

    };

    $scope.cloneReply = function () {
        if ($scope.reply) {
            if ($scope.reply.key) $scope.data.key = $scope.reply.key;
            if ($scope.reply.item) $scope.data.item = $scope.reply.item;
        }
    };

    var sortTables = function () {

    }
});


app.filter('lookUp', function () {
    return function (value, table, key, description) { // filter arguments
        if (!table || !Array.isArray(table)) throw("[LookUp Filter] Must Pass Array");
        if (!key) throw("[LookUp Filter] Must Pass Key");
        if (!description) throw("[LookUp Filter] Must Pass Description");

        var wObj = table.find(function (obj) {
            try {
                return obj[key] === value;
            } catch (err) {
                return false;
            }

        });
        if (!wObj) return "";
        return wObj[description] || "";
    };
});

app.filter('mvRecordNotation', function () {
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
