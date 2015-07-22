/**
 * Created by dmitriy on 20.07.2015.
 */
angular.module('familyTree').factory('IndividualsService', ['$http', function($http) {

    return {
        // call to get all nerds
        get : function() {
            return $http.get('/api/individuals')
        }
    }

}])