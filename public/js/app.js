var app = angular.module('App', [
    'ngRoute', 'mvHubServices',
    'ng.jsoneditor','jsonFormatter',
    'ngAnimate', 'ngSanitize',
    'ui.bootstrap', 'ui.codemirror'
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


app.run(function ($rootScope) {
    var overlay = document.getElementById("overlayDiv");
    $rootScope.overlayForm = function (percent) {
        //document.getElementById("overlayDiv").style.width = percent + "%";
        overlay.style.height = percent + "%";
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