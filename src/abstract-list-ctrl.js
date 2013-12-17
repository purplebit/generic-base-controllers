// An abstract generic "list of items" controller - handles operations on multiple items
// The "abstract" is because it will not run/initialize anything on itself, it can only
// be injected into son controllers.
function abstractListCtrl(Restangular, $scope, ngTableParams) {
    // Support for minification
    abstractListCtrl.$inject = ['Restangular', '$scope', 'ngTableParams'];

    var dataKey = "data";

    // Initialize the controller before using it
    $scope.initCtrl = function(sonItemKey) {
        dataKey = sonItemKey;
    };

    /* Handle table params */

    // Initialize the setting object for ngTable + default filters
    $scope.initTableParams = function(showOnStartup, isLive, filterDefault, sortDefault) {
        // Show/hide the filter UI on startup
        $scope.show_filter_toggle = showOnStartup;

        $scope.tableParams = new ngTableParams({
            page: 1,                // Show first page
            total: 0,               // Total elements (not paginated)
            count: 0,               // Items per page (chunk size)
            filter: filterDefault,  // Default filter config
            sorting: sortDefault,   // Default sort-by config
            $liveFiltering: isLive, // Filter as-you-type on/off
            counts: []              // Don't allow to change page size
        });
    };

    // TODO: Allow to toggle filter UI on/off, needs ng-tables official support

    /* Handle data from REST API */

    // When data is received - update the data object and numeric metadata
    $scope.updateDataAndTotal = function(newData) {
        $scope[dataKey] = newData;
        if ($scope.tableParams) {
            $scope.tableParams.total = ($scope[dataKey] ? $scope[dataKey].metadata.count : 0);
            if ($scope.tableParams.count === 0) {
                $scope.tableParams.count = ($scope[dataKey] ? $scope[dataKey].length : 0);
            }
        }
    };

    // Main function for initializing the data for this controller
    // Example: initData('tasks') will init 'tasks/' (as a list)
    // Optional: dataKeyName to change $scope["data"] to $scope["tasks"]
    $scope.initData = function(resourceEndpointName, dataKeyName) {
        // Save the new data key name, if one was provided
        if (dataKeyName !== undefined) { dataKey = dataKeyName; };

        $scope[dataKey] = {};
        $scope.tableParams = {};
        $scope.currentPage = 1;
        $scope.baseEndpoint = Restangular.all(resourceEndpointName);
        $scope.refreshData();
    };

    // Allows refreshing the data using the current base endpoint
    // This function is used internally but could also be used
    // externally - when a forced refresh is needed.
    $scope.refreshData = function() {
        $scope.baseEndpoint.getList().then(function(newData) {
            $scope.updateDataAndTotal(newData);
            $scope.$broadcast("event:parentLoaded", []);
        });
    };

    /* Handle data/params updates */

    // Convert the client-side tableParams to GET query params
    $scope.get_query_params = function(params) {
        var query_params = {};

        if (params.sorting) {
            query_params['ordering'] = params.orderBy();
            query_params['ordering'] = $.map(query_params['ordering'], function(val, idx) {
                return val.replace(/^\+/, '');
            });
        }
        if (params.filter) {
            // TODO: Change to angular's foreach
            for (var field in params.filter) {
                // Add fields that are not empty, for string fields, trim them.
                // If it's an array, only add items that are not empty
                if (params.filter[field]) {
                    if ($.type(params.filter[field]) === "string" && !params.filter[field].trim()) {
                        continue;
                    }
                    if ($.type(params.filter[field]) === "array") {
                        for (var i=0; i<params.filter[field].length; i++) {
                            if (!params.filter[field][i]) {
                                params.filter[field].splice(i, 1);
                            }
                        }
                        if (!params.filter[field].length) {
                            continue;
                        }
                    }
                    query_params[field]= params.filter[field];
                }
            }
        }
        if (params.page) {
            query_params['page'] = params.page;
        }
        return query_params;
    };

    // Watch for changed view parameters -> fetch new data -> refresh display
    $scope.$watch('tableParams', function(params) {
        if (params !== undefined) {
            // Init query params
            var query_params = $scope.get_query_params(params);
            $scope.loading = true;

            // Fetch the data
            $scope[dataKey] = {};
            $scope.baseEndpoint.customGETLIST('', query_params).then(function(newData) {
                $scope.loading = false;
                $scope.updateDataAndTotal(newData);
            });
        }
    }, true);

    /* Events */

    // When a single item from the list is deleted, delete from the list as well
    $scope.$on("event:sonDeleted", function(e, data) {
        var deletedItem = data[0];
        $scope[dataKey].splice($scope[dataKey].indexOf(deletedItem), 1);
    });

    // When a single item from the list is added, add it to the list as well
    $scope.$on("generic-item:saved", function(e, data) {
        if (data) {
            var addedItem = data[0];
            var reversed = data[1];
            if (!reversed) {
                $scope[dataKey].push(addedItem);
            }
            else {
                $scope[dataKey].unshift(addedItem);
            }
        }
    })
};