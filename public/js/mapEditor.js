app.controller('MapEditorController', function ($scope, $http) {

    $scope.data = {};
    $scope.username = "devweb";
    $scope.password = "devweb";
    $scope.tabNumber = 0;

    $scope.setTab = function(tabNumber){ $scope.tabNumber = tabNumber}
    $scope.setTab(0);




    $scope.load = function () {

        $scope.data.action = "Read";

        var headers = 'Basic ' + window.btoa($scope.username + ":" + $scope.password);
        headers['Content-Type'] = "application/json";
        var pData = angular.toJson($scope.data);
        var url = "/Service/MVHUB.MAP"
        $http({
            method: "POST",
            url: url,
            headers: headers,
            withCredentials: true,
            data: pData
        }).then(function (resp) {

                $scope.data = resp.data;
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

});