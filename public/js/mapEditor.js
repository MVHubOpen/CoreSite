app.controller('MapEditorController', function ($scope, $http,$modal) {
    var overlay = document.getElementById("overlayDiv");
    $scope.recordTypes = [
        {"key":"I","description":"ID Parts"},
        {"key":"B","description":"Record"},
        {"key":"W","description":"Work Record"}
    ]
    $scope.data = {};
    $scope.username = "devweb";
    $scope.password = "devweb";
    $scope.tabNumber = 0;

    $scope.setTab = function(tabNumber){ $scope.tabNumber = tabNumber}
    $scope.setTab(0);

    $scope.assocGridConfig = {
        // should return your data (an array)
        getData: function () {
            if (!$scope.data.item) return [];
            if (!$scope.data.item.association) return [];
            return $scope.data.item.association;
        },

        options: {
            showEditButton: true,
            showDelete: true,
            columns: [
                { title: 'Key', field: 'associatedKey'},
                { title: 'Name',field: 'associatedName' },
                { title: 'Description',field: 'associatedDescription' },
                { title: 'Control',field: 'ctrlAttr', inputType: 'number' }
                ]
        }
    }


    $scope.editAssoc = function(assocObj){
        var modalInstance = $modal.open({
            templateUrl: 'AssocaitedModal.html',
            controller: 'EditAssocController',
            size: 'md',
            resolve: {
                editObj: function() {
                    return assocObj;
                }
            }
        });
    }
    $scope.load = function () {

        overlayForm(100);
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
                overlayForm(0);
            },
            function () {
                overlayForm(0);
                def.reject([
                    {
                        error: "Connection Error",
                        errorCode: 500
                    }
                ]);
            });

    };

    var overlayForm = function (percent) {
        //document.getElementById("overlayDiv").style.width = percent + "%";
        overlay.style.height= percent + "%";
    };

});

app.controller('EditAssocController', function ($rootScope, $scope, $modalInstance, editObj) {
    $scope.editObj = editObj;
    $scope.cancelEdit= function () {
        $modalInstance.close();
    };
    $scope.saveEdit= function () {
        $modalInstance.close();
    };
});