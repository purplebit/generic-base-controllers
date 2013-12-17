// A generic "list of items" controller - handles operations on multiple items
function genericListCtrl(Restangular, $scope, ngTableParams, abstractListCtrl) {
    // Support for minification
    genericListCtrl.$inject = ['Restangular', '$scope', 'ngTableParams', 'abstractListCtrl'];

    // This is the name of the key that holds the object's list of data items -
    // $scope[dataKey] = whatever. Default is "data" - so $scope.data, but it's
    // possible to define it as something else in order to avoid data loss when
    // inheriting controllers (var statement makes sure it's not overridden)
    var dataKey = "data";

    abstractListCtrl.initCtrl(dataKey);
};