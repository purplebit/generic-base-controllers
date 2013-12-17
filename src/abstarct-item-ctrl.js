// An abstract generic "single item" controller - handler operations on a single item
// The "abstract" is because it will not run/initialize anything on itself, it can only
// be injected into son controllers.
function abstractItemCtrl(Restangular, $scope) {
    // Support for minification
    abstractItemCtrl.$inject = ['Restangular', '$scope'];

    var itemKey = 'item';

    // Initialize the controller before using it
    $scope.initCtrl = function(sonItemKey) {
        self = this;
        $scope.editMode = false;
        $scope.jobStatus = undefined;

        itemKey = sonItemKey;
        if (!$scope[itemKey]) {
            $scope[itemKey] = {};
        }
        $scope.itemBeforeEdit = angular.copy($scope[itemKey]);
    };

    /* Handle data from REST API */

    // Main function for initializing the data for this controller
    // Example: initData('task') will init 'task/' (as a single item)
    // Optional: itemKeyName to change $scope["item"] to $scope["whatever"]
    $scope.initData = function(resourceEndpointName, itemKeyName) {
        // Save the new item key name, if one was provided
        if (itemKeyName !== undefined) { itemKey = itemKeyName; };

        if (resourceEndpointName !== '') {
            $scope[itemKey] = {};
            $scope.baseEndpoint = Restangular.oneUrl(resourceEndpointName);

            $scope.baseEndpoint.get().then(function(newData) {
                $scope[itemKey] = newData;
                $scope.$broadcast("event:parentLoaded", []);
            });
        }
    };

    // Initialize an empty item for an empty form in an items list.
    // This function could be overridden with some "empty" defaults,
    // for example - set the currently logged-in user as the default task owner.
    $scope.setEmpty = function() {
        $scope[itemKey] = {};
    };

    // Initialize data for a controller with a given ID. Use when you explicitly want restangular to know of an ID.
    // Example: initDataWithID('task', 2) will init 'task/2' (as a single item)
    // Optional: itemKeyName to change $scope["item"] to $scope["whatever"]
    // TODO: Refactor and merge with previous function
    $scope.initDataWithID = function(resourceEndpointName, id, itemKeyName) {
        // Save the new item key name, if one was provided
        if (itemKeyName !== undefined) { itemKey = itemKeyName; };

        $scope[itemKey] = {};
        $scope.baseEndpoint = Restangular.one(resourceEndpointName, id);

        $scope.baseEndpoint.get().then(function(newData) {
            $scope[itemKey] = newData;
            $scope.$broadcast("event:parentLoaded", []);
        })
    };

    // Allow a nested object to override $scope.item and use it's own item property.
    // Example: A single task has a list of *single* comments. If I want to edit a comment
    //          I have to let angular know I don't mean the tasks's item.
    $scope.initAsNestedItem = function() {
        $scope[itemKey] = {};
    };

    /* HTTP actions using Restangular */

    $scope.startEdit = function() {
        $scope.itemBeforeEdit = angular.copy($scope[itemKey]);
        $scope.editMode = true;
    };

    $scope.cancelEdit = function() {
        $scope.jobStatus = undefined;
        $scope[itemKey] = angular.copy($scope.itemBeforeEdit);
        $scope.editMode = false;
    };

    $scope.saveItem = function() {
        if ($scope[itemKey].id) {
            $scope._putItem();
        } else {
            $scope._postItem(false);
        }
    };

    $scope._putItem = function() {

        $scope.jobStatus = 'working';
        $scope[itemKey].put().then(function(data) {

            $scope.jobStatus = 'success';
            $scope[itemKey] = data;
            $scope.itemBeforeEdit = angular.copy($scope[itemKey]);
            $scope.editMode = false;

            $scope.$emit('generic-item:saved');
            $scope.$broadcast('generic-item:saved');
        }, function() {
            $scope.jobStatus = 'failure';
        });
    };

    $scope._postItem = function(reversed) {

        $scope.jobStatus = 'working';
        $scope.baseEndpoint.post($scope[itemKey]).then(function(addedItem) {

            $scope.$emit('generic-item:saved', [addedItem, reversed]);
            $scope.setEmpty();
            $scope.jobStatus = 'success';
        }, function() {
            $scope.jobStatus = 'failure';
        });
    };

    $scope._patchItem = function() {

        $scope.jobStatus = 'working';
        $scope.item.patch().then(function() {

            $scope.jobStatus = 'success';
            $scope.itemBeforeEdit = angular.copy($scope[itemKey]);
            $scope.editMode = false;
            $scope.$emit('generic-item:saved');
        }, function() {
            $scope.jobStatus = 'failure';
        });
    };

    $scope.deleteItem = function() {

        $scope.jobStatus = 'working';
        $scope[itemKey].remove().then(function() {
            $scope.$emit("event:sonDeleted", [$scope[itemKey]]);
            $scope.jobStatus = 'success';
            $scope.$emit('generic-item:saved');
        }, function() {
            $scope.jobStatus = 'failure';
        });
    };

};
