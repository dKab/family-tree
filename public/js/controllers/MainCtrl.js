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
                        .attr('transform', function(d) {return 'translate(' + ((+$('#tree').innerWidth()-parseInt($('#tree').css('padding-left')))/2 - 10) +
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
                    var rectIconSize = 20
                    var treeIcon = groups.append('g').attr('class', 'icon tree-icon')
                    treeIcon.append('rect')
                        .attr('width', rectIconSize)
                        .attr('height', rectIconSize)
                        .attr('fill-opacity', 0)
                        .attr('x', '0')
                        .attr('y', '25')
                    treeIcon.append('use')
                        .attr('xlink:href', 'icons.svg#icon-tree')
                        .attr('width', iconHeight + 5)
                        .attr('height', iconHeight)
                        .attr('x', '0')
                        .attr('y', '25')
                    treeIcon.append('title').text('Добавить прямого потомка')
                    var manWomanIcon = groups.append('g').attr('class', 'icon man-woman-icon')
                    manWomanIcon.append('rect')
                        .attr('width', rectIconSize)
                        .attr('height', rectIconSize)
                        .attr('fill-opacity', 0)
                        .attr('x', '-25')
                        .attr('y', '3')
                    manWomanIcon.append('use')
                        .attr('xlink:href', 'icons.svg#icon-man-woman')
                        .attr('width', iconHeight + 5)
                        .attr('height', iconHeight)
                        .attr('x', '-25')
                        .attr('y', '3')
                    manWomanIcon.append('title').text('Добавить супруга')
                    var crossIcon = groups.append('g').attr('class', 'icon cross-icon')
                    crossIcon.append('rect')
                        .attr('width', rectIconSize)
                        .attr('height', rectIconSize)
                        .attr('fill-opacity', 0)
                        .attr('x', '30')
                        .attr('y', '3')
                    crossIcon.append('use')
                        .attr('xlink:href', 'icons.svg#icon-cross')
                        .attr('width', iconHeight)
                        .attr('height', iconHeight)
                        .attr('x', '30')
                        .attr('y', '3')
                    crossIcon.append('title').text('Удалить узел')
                    var eyeIcon = groups.append('g').attr('class', 'icon eye-icon')
                    eyeIcon.append('rect')
                        .attr('width', rectIconSize)
                        .attr('height', rectIconSize)
                        .attr('fill-opacity', 0)
                        .attr('x', '0')
                        .attr('y', '0')
                    eyeIcon.append('use')
                        .attr('xlink:href', 'icons.svg#icon-eye')
                        .attr('width', iconHeight)
                        .attr('height', iconHeight)
                        .attr('x', '0')
                        .attr('y', '0')
                    eyeIcon.append('title').text('Детальный просмотр')
                    var editIcon = groups.append('g').attr('class', 'icon edit-icon')
                    editIcon.append('rect')
                        .attr('width', rectIconSize)
                        .attr('height', rectIconSize)
                        .attr('fill-opacity', 0)
                        .attr('x', '0')
                        .attr('y', '-25')
                    editIcon.append('use')
                        .attr('xlink:href', 'icons.svg#icon-edit')
                        .attr('width', iconHeight)
                        .attr('height', iconHeight)
                        .attr('x', '0')
                        .attr('y', '-25')
                    editIcon.append('title').text('Редактировать информацию')

                    d3.selectAll('.node').on('click', function(d) {
                        var target = d3.event.target || d3.event.explicitOriginalTarget
                        var circle = $(this).find('circle')[0]
                        if ($(target).is('.tree-icon') || $(target).closest('g').is('.tree-icon')) {
                            $timeout( function() {
                                $('#addChild').modal()
                                shrinkCircle.call(circle)
                            }, 10)
                        }
                    }).on('mouseover', function(d) {
                        $scope.focusedNode = d
                    })
                    d3.selectAll('.node rect').on('mouseleave', function(d) {
                        var to = d3.event.toElement || d3.event.relatedTarget
                        var circle = $(this).closest('.node').find('circle')[0]
                        if (to && (to.nodeName == 'path' || to.nodeName == 'use' || to.nodeName == 'rect' || to === circle) ) { //don't shrink circle if mouse went to child element
                            return
                        } //otherwise shrink it
                        shrinkCircle.call(circle)
                    })
                    var shrinkCircle = function () {
                        var parentNode = $(this).closest('.node')[0]
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
                        d3.select(this).transition().duration(500).attr('r', circleSmallRadius).attr('stroke-width', 4)
                    }
                    d3.selectAll('circle')
                        .on('mouseenter', function(d) {
                            var _this = this
                            var from = d3.event.fromElement || d3.event.relatedTarget
                            if (from.nodeName != 'use' && from.nodeName != 'path' || from.nodeName != 'rect') {
                                var promiseOld = $(this).data('promise')
                                if (promiseOld !== undefined) {
                                    $timeout.cancel(promiseOld)
                                }
                                var promise = $timeout(function() {
                                    var parentNode = $(_this).closest('.node')[0]
                                    d3.select('.node.active').classed('active', false)
                                    d3.select(parentNode).classed('active', true)
                                    d3.select(_this).transition().duration(500).attr('r', circleBigRadius).attr('stroke-width', 2)
                                    $timeout(function() {
                                        d3.select(parentNode).selectAll('.icon').classed('fast-fade', true)
                                        d3.select(parentNode).classed('active', true)
                                    }, 300)
                                }, 250);
                                $(this).data('promise', promise)
                            }
                        })
                        .on('mouseleave', function(d) {
                            var to = d3.event.toElement || d3.event.relatedTarget
                            if (to && (to.nodeName == 'path' || to.nodeName == 'use' || to.nodeName == 'rect') ) {
                                return
                            } //otherwise shrink it
                            shrinkCircle.call(this)
                        })
        }).error(function(data, status, headers) {
            $scope.err = status
        })
    }
    $('#tree').ready($scope.loadPeople)
}]);