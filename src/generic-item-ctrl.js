// A generic "single item" controller - handler operations on a single item
function genericItemCtrl(Restangular, $scope, abstractItemCtrl) {
    // Support for minification
    genericItemCtrl.$inject = ['Restangular', '$scope', 'abstractItemCtrl'];

    // This is the name of the key that holds the object's data (the single item) -
    // $scope[itemKey] = whatever. Default is "item" - so $scope.item, but it's
    // possible to define it as something else in order to avoid data loss when
    // inheriting controllers (var statement makes sure it's not overridden)
    var itemKey = 'item';

    // Initialize the controller for first usage
    abstractItemCtrl.initCtrl(itemKey);
};
