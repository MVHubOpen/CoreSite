app.controller('MapEditorController', function ($rootScope, $scope, $http, mvHub) {

    $scope.username = "devweb";
    $scope.password = "devweb";
    $scope.maxSize = 5;
    $scope.fieldPager = {};

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
    };

    $scope.reset = function () {
        $scope.data = {};
        $scope.data.key = {};
        $scope.data.key.mapId = "";
        $scope.tabNumber = 0;
        $scope.loaded = false;
        $scope.assocCurrentPage = 1;
        $scope.fldCurrentPage = 1;
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

        mvHub.editModal($scope.data.item.associated[fieldIndex], '/views/modals/AssociatedModal.html', 'EditAssocController')
            .then(function (obj) {
                if (obj.$$isNew_Entry){
                    delete obj.$$isNew_Entry;
                    $scope.data.item.associated.push(obj);
                } else {
                    $scope.data.item.associated[fieldIndex] = obj;
                }
                sortTables();
            });
    };

    $scope.editField = function (fieldIndex) {

        mvHub.editModal($scope.data.item.fields[fieldIndex], '/views/modals/FieldModal.html', 'EditFieldController', $scope.data.item)
            .then(function (obj) {
                if (obj.$$isNew_Entry){
                    delete obj.$$isNew_Entry;
                    $scope.data.item.fields.push(obj);
                } else {
                    $scope.data.item.fields[fieldIndex] = obj;
                }
                sortTables();

            });
    };

    $scope.help = function () {
        $scope.data = {};
        $scope.data.action = "Query";

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

                mvHub.helpModal(resp.data, 'lg').then(function (keyObj) {
                    $scope.data = {};
                    $scope.data.key = keyObj;
                    $scope.load();
                });
            },
            function () {
                alert("No Help Available");
            });
    };


    $scope.load = function (action) {
        $scope.loaded = false;
        $scope.data.action = action || "Read";

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
                $scope.loaded = true;
                $scope.fieldPager = mvHub.getPager($scope.data.item.fields, 10);
                $scope.assocPager = mvHub.getPager($scope.data.item.associated, 5);
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

    $scope.save = function () {
        sortTables();
        var data = {};
        data.action = "Update";
        data.key = JSON.parse(angular.toJson($scope.data.key));
        data.item = JSON.parse(angular.toJson($scope.data.item));


        var headers = 'Basic ' + window.btoa($scope.username + ":" + $scope.password);
        headers['Content-Type'] = "application/json";
        var pData = JSON.stringify(data);
        var url = "/Service/MVHUB.MAP";
        $http({
            method: "POST",
            url: url,
            headers: headers,
            withCredentials: true,
            data: pData
        }).then(function (resp) {
                if (!resp.data.errors) {
                    $scope.reset();
                } else {
                    alert("Error Count : " + resp.data.errors.length);
                }
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

        if (updated.association != old.association) {
            if (updated.association === "###KEY###") {
                $scope.editObj.record = "I";
            } else {
                if (updated.record = "I") $scope.editObj.record = "B";
            }
        } else {
            if (updated.record === "I") $scope.editObj.association = "###KEY###";
        }
        if (updated.record === "I") {
            $scope.editObj.vpos = 0;
            $scope.editObj.spos = 0;
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