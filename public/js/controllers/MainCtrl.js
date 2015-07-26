/**
 * Created by dmitriy on 20.07.2015.
 */
angular.module('familyTree').controller('MainController',
    ["IndividualsService", "$scope", "$timeout",
        function(IndividualsService,  $scope, $timeout) {
            $scope.people = []
            $scope.err = null
            $scope.loadPeople = function() {
                $scope.people =  IndividualsService.get().success(function(data) {
                    $scope.people = data
                    var tree = d3.select('#tree')
                    var groups = tree
                        .selectAll('g')
                        .data(data)
                        .enter()
                        .append('g')
                        .attr('id', function(d) { return 'node_' + d._id })
                        .attr('class', 'node')
                        .attr('transform', function(d) {return 'translate(' + (+$('body').innerWidth()/2 - 10) +
                            ', ' + ((d.parents.length) ?  +parseInt(d3.select('#node_'
                                 + d.parents[0]).attr('transform').split(',').pop()) + 100 - 10 : 35) +  ')'})
                    var circleSmallRadius = 10,
                        circleBigRadius = 42
                    groups.append('circle')
                        .attr('stroke-width', 4)
                        .attr('stroke', '#2b81af')
                        .attr('fill', '#fff')
                        .attr('r', circleSmallRadius)
                        .attr('cx', 10)
                        .attr('cy', 10)
                    groups.each(function(d) {
                            var DOM_Elem = d3.select(this)
                            DOM_Elem.insert('text', 'circle')
                                .html(d.name.first + ' ' + d.name.last)
                                .attr('x', +DOM_Elem.select('circle').attr('cx') + 15)
                                .attr('y', DOM_Elem.select('circle').attr('cy') - 10)
                            if ( ! d.parents.length ) return
                            var parentDOM_Elem = d3.select('#node_' + d.parents[0])
                            tree.insert('line', ':first-child')
                                .attr('x1', +DOM_Elem.attr('transform').split(/[(,]/)[1] + +DOM_Elem.select('circle').attr('r'))
                                .attr('x2', +DOM_Elem.attr('transform').split(/[(,)]/)[1] + +DOM_Elem.select('circle').attr('r'))
                                .attr('y1', +DOM_Elem.attr('transform').split(/[(,)]/)[2] - +DOM_Elem.attr('r'))
                                .attr('y2', +parentDOM_Elem.attr('transform').split(/[(,)]/)[2] + +parentDOM_Elem.select('circle').attr('r') * 2)
                                .attr('stroke-width', 2)
                                .attr('stroke', '#2b81af')
                        })
                    var iconHeight = 60
                    groups.append('use')
                        .attr('xlink:href', 'icons.svg#icon-tree')
                        .attr('class', 'icon tree-icon')
                        .attr('width', iconHeight + 5)
                        .attr('height', iconHeight)
                        .attr('x', '0')
                        .attr('y', '25')
                    groups.append('use')
                        .attr('xlink:href', 'icons.svg#icon-man-woman')
                        .attr('class', 'icon man-woman-icon')
                        .attr('width', iconHeight + 5)
                        .attr('height', iconHeight)
                        .attr('x', '-25')
                        .attr('y', '3')
                    groups.append('use')
                        .attr('xlink:href', 'icons.svg#icon-cross')
                        .attr('class', 'icon cross-icon')
                        .attr('width', iconHeight)
                        .attr('height', iconHeight)
                        .attr('x', '30')
                        .attr('y', '3')
                    groups.append('use')
                        .attr('xlink:href', 'icons.svg#icon-eye')
                        .attr('class', 'icon eye-icon')
                        .attr('width', iconHeight)
                        .attr('height', iconHeight)
                        .attr('x', '0')
                        .attr('y', '0')
                    groups.append('use')
                        .attr('xlink:href', 'icons.svg#icon-edit')
                        .attr('class', 'icon edit-icon')
                        .attr('width', iconHeight)
                        .attr('height', iconHeight)
                        .attr('x', '0')
                        .attr('y', '-25')

                    d3.selectAll('.node use')
                        .on('mouseleave', function(d) {
                                var to = d3.event.toElement || d3.event.relatedTarget
                                var toTag = to.nodeName
                            if ( toTag != 'use' && toTag != 'circle') {
                                var parentNode = $(this).closest('.node')[0]
                                d3.select(parentNode).classed('active', false)
                                d3.select(parentNode).select('circle').transition().duration(500).attr('r', circleSmallRadius)
                            }
                        })
                    d3.selectAll('circle')
                        .on('mouseenter', function(d) {
                            var _this = this
                            var from = d3.event.fromElement || d3.event.relatedTarget
                            if (from.nodeName != 'use' && from.nodeName != 'path') {
                                var promise = $timeout(function() {
                                    var parentNode = $(_this).closest('.node')[0]
                                    d3.select('.node.active').classed('active', false)
                                    d3.select(parentNode).classed('active', true)
                                    d3.select(_this).transition().duration(500).attr('r', circleBigRadius)
                                    $timeout(function() {
                                        d3.select(parentNode).selectAll('.icon').classed('fast-fade', true)
                                    }, 500)
                                }, 250);
                                $(this).data('promise', promise)
                            }
                        })
                        .on('mouseleave', function(d) {
                            var _this = this
                            var to = d3.event.toElement || d3.event.relatedTarget
                            if (to && (to.nodeName == 'path' || to.nodeName == 'use') ) { //don't shrink circle if mouse went to child element
                                return
                            } //otherwise shrink it
                            var parentNode = $(_this).closest('.node')[0]
                            $timeout(function() {
                                d3.select(parentNode).classed('active', false)
                                d3.select(parentNode).selectAll('.icon')
                                    .style('opacity', null)
                                    .classed('fast-fade', false)
                            },500)
                            var promise = $(this).data('promise')
                            if ( promise !== undefined ) {
                                $timeout.cancel(promise)
                            }
                            d3.select(parentNode).selectAll('.icon').style('opacity', 0)
                            d3.select(_this).transition().duration(500).attr('r', circleSmallRadius)
                        })
        }).error(function(data, status, headers) {
            $scope.err = status
        })
    }
    $('#tree').ready($scope.loadPeople)
}]);