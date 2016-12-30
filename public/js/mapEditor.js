app.controller('MapEditorController', function ($rootScope,$scope, $http) {

    $scope.username = "devweb";
    $scope.password = "devweb";

    $scope.recordTypes = [
        {"key": "I", "description": "ID Parts"},
        {"key": "B", "description": "Record"},
        {"key": "W", "description": "Work Record"}
    ];

    $scope.Options = {
        lineNumbers: true,
        indentWithTabs: false,
        theme: "neat",
        styleActiveLine: true,
        viewportMargin: 0,
        extraKeys: {
            "Alt-C": function () {
                $scope.compile();
            },
            "Alt-L": function () {
                $scope.openLinked();
            },
            "Alt-S": function () {
                $scope.saveRecord();
            },
            "Alt-R": function () {
                $scope.loadRecord();
            },
            "Alt-E": function () {
                $scope.setDisplayMode('E');
                $scope.$apply();
            },
            "Alt-O": function () {
                $scope.setDisplayMode('O');
                $scope.$apply();
            }
        }
    };

    $scope.reset = function(){
        $scope.data = {};
        $scope.tabNumber = 0;
        $scope.loaded = false;
    };
    $scope.reset();

    $scope.setTab = function (tabNumber) {
        $scope.tabNumber = tabNumber
    };
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
                {title: 'Key', field: 'associatedKey'},
                {title: 'Name', field: 'associatedName'},
                {title: 'Description', field: 'associatedDescription'},
                {title: 'Control', field: 'ctrlAttr', inputType: 'number'}
            ]
        }
    };


    $scope.editAssoc = function (fieldIndex) {

        $rootScope.editModal($scope.data.item.associated[fieldIndex], '/pages/Modal/AssociatedModal.html', 'EditAssocController',"sm")
            .then(function (obj) {
                $scope.data.item.associated[fieldIndex] = obj;
                sortTables();
            });
    };

    $scope.editField = function (fieldIndex) {

        $rootScope.editModal($scope.data.item.fields[fieldIndex], '/pages/Modal/FieldModal.html', 'EditFieldController', $scope.data.item)
            .then(function (obj) {
                $scope.data.item.fields[fieldIndex] = obj;
                sortTables();

            });
    };


    $scope.load = function () {
        $scope.loaded = false;
        $rootScope.overlayForm(00);
        $scope.data.action = "Read";

        var headers = 'Basic ' + window.btoa($scope.username + ":" + $scope.password);
        headers['Content-Type'] = "application/json";
        var pData = angular.toJson($scope.data);
        var url = "/Service/MVHUB.MAP";
        $http({
            method: "POST",
            url: url,
            headers: headers,
            withCredentials: true,
            data: pData
        }).then(function (resp) {

                $scope.data = resp.data;
                sortTables();
                $rootScope.overlayForm(0);
                $scope.loaded =true;
            },
            function () {
                $rootScope.overlayForm(0);
                def.reject([
                    {
                        error: "Connection Error",
                        errorCode: 500
                    }
                ]);
            });

    };


    var sortTables = function () {
        if (!$scope.data) return;
        if (!$scope.data.item) return;

        if ($scope.data.item.fields) {
            $scope.data.item.fields.sort(function (a, b) {
                if (a.association != b.association) {
                    if (a.association < b.association) return -1;
                    if (a.association > b.association) return 1;
                }
                if (a.attr != b.attr) return a.attr - b.attr;
                if (a.vpos != b.vpos) return a.vpos - b.vpos;
                if (a.spos != b.spos) return a.spos - b.spos;
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0
            });
        }
        if ($scope.data.item.associated) {
            $scope.data.item.associated.sort(function (a, b) {
                if (a.key < b.key) return -1;
                if (a.key > b.key) return 1;
                return 0
            });
        }
    };

});

app.controller('EditAssocController', function ($rootScope, $scope, $modalInstance, editObj) {
    $scope.editObj = editObj;
    $scope.cancelEdit = function () {
        $modalInstance.dismiss('cancel');

    };
    $scope.saveEdit = function () {
        $modalInstance.close($scope.editObj);
    };
});

app.controller('EditFieldController', function ($rootScope, $scope, $modalInstance, editObj, parentObj) {
    $scope.editObj = editObj;
    $scope.parentObj = parentObj;

    var oEditObj = JSON.parse(JSON.stringify(editObj));
    $scope.$watch('editObj', function (updated, old) {

        if (updated.association != old.association){
            if (updated.association === "###KEY###") {
                $scope.editObj.record = "I";
            } else {
                if (updated.record = "I") $scope.editObj.record ="B";
            }
        } else {
            if (updated.record === "I") $scope.editObj.association = "###KEY###";
        }
        if (updated.record === "I") {
            $scope.editObj.vpos=0;
            $scope.editObj.spos=0;
        }
        $scope.editObj.$$dirty$$ = !isEquivalent(updated, oEditObj);
    }, true);

    $scope.cancelEdit = function () {
        $modalInstance.dismiss('cancel');

    };
    $scope.saveEdit = function () {
        $modalInstance.close($scope.editObj);
    };

});