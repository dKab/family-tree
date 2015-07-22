/**
 * Created by dmitriy on 20.07.2015.
 */
angular.module('familyTree').controller('MainController', ["IndividualsService", "$scope", function(IndividualsService,  $scope) {
    $scope.people = []
    $scope.err = null
    $scope.loadPeople = function() {
        $scope.people =  IndividualsService.get().success(function(data) {
            $scope.people = data
            var tree = d3.select('#tree')
            tree
                .selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .attr('stroke-width', 1)
                .attr('stroke', '#000')
                .attr('fill', '#fff')
                .attr('id', function(d) { return 'node_' + d._id })
                .attr('r', 10)
                .attr('cx', angular.element('body').innerWidth()/2)
                .attr('cy', function(d) { return d.parents.length ?  +d3.select('#node_' + d.parents[0]).attr('cy') + 100 : 25 })
                .each(function(d) {
                    var DOM_Elem = d3.select('#node_' + d._id)
                    tree.append('text')
                        .html(d.name.first + ' ' + d.name.last)
                        .attr('x', +DOM_Elem.attr('cx') + 15)
                        .attr('y', DOM_Elem.attr('cy') - 10)
                    if ( ! d.parents.length ) return
                    var parentDOM_Elem = d3.select('#node_' + d.parents[0])
                    tree.append('line')
                        .attr('x1', DOM_Elem.attr('cx'))
                        .attr('x2', DOM_Elem.attr('cx'))
                        .attr('y1', +DOM_Elem.attr('cy') - +DOM_Elem.attr('r'))
                        .attr('y2', +parentDOM_Elem.attr('cy') + +parentDOM_Elem.attr('r'))
                        .attr('stroke-width', 1)
                        .attr('stroke', '#000')
                })
        }).error(function(data, status, headers) {
            $scope.err = status
        })
    }
    angular.element('#tree').ready($scope.loadPeople)
}]);