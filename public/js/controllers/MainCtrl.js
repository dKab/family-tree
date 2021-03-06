/**
 * Created by dmitriy on 20.07.2015.
 */
angular.module('familyTree').controller('MainController',
    ["IndividualsService", "$scope", "$timeout", 'FileUploader', 'TreeRendererService',
        function(IndividualsService,  $scope, $timeout, FileUploader, Renderer) {
            $scope.uploader = new FileUploader();
            $scope.people = [];
            $scope.err = null;
            $scope.loadPeople = function() {
                $scope.people =  IndividualsService.get().success(function(data) {
                    $scope.people = data;
                    var tree = d3.select('#tree'),
                        circleSmallRadius = Renderer.nodeRadius,
                        circleBigRadius = 42;
                    var root = _.find($scope.people, function(individual) {
                        return individual.parents.length === 0
                    });
                        root.xCoord = 200;
                        root.yCoord = 50;
                        var successTreeBuild =  Renderer.positionTree(root, $scope.people);
                    var groups = tree
                        .selectAll('g')
                        .data(data)
                        .enter()
                        .append('g')
                        .attr('id', function(d) { return 'node_' + d._id })
                        .attr('class', 'node')
                        .attr('transform', function(d) { return 'translate(' + d.xCoord + ', ' + d.yCoord + ')' });
                    groups.append('circle')
                        .attr('stroke-width', 4)
                        .attr('stroke', '#2b81af')
                        .attr('fill', '#fff')
                        .attr('r', circleSmallRadius)
                        .attr('cx', 10)
                        .attr('cy', 10);
                    groups.each(function(d) {
                            var DOM_Elem = d3.select(this);
                            DOM_Elem.insert('text', 'circle')
                                .html(d.name.first + ' ' + d.name.last)
                                .attr('x', +DOM_Elem.select('circle').attr('cx') + 15)
                                .attr('y', DOM_Elem.select('circle').attr('cy') - 10);
                            if ( ! d.parents.length ) return;
                            var parentDOM_Elem = d3.select('#node_' + d.parents[0]);
                            tree.insert('line', ':first-child')
                                .attr('x1', +DOM_Elem.attr('transform').split(/[(,]/)[1] + +DOM_Elem.select('circle').attr('r'))
                                .attr('x2', +DOM_Elem.attr('transform').split(/[(,)]/)[1] + +DOM_Elem.select('circle').attr('r'))
                                .attr('y1', +DOM_Elem.attr('transform').split(/[(,)]/)[2] - +DOM_Elem.attr('r'))
                                .attr('y2', +parentDOM_Elem.attr('transform').split(/[(,)]/)[2] + +parentDOM_Elem.select('circle').attr('r') * 2)
                                .attr('stroke-width', 2)
                                .attr('stroke', '#2b81af')
                        });
                    var iconHeight = 60;
                    var rectIconSize = 20;
                    var treeIcon = groups.append('g').attr('class', 'icon tree-icon');
                    treeIcon.append('rect')
                        .attr('width', rectIconSize)
                        .attr('height', rectIconSize)
                        .attr('fill-opacity', 0)
                        .attr('x', '0')
                        .attr('y', '25');
                    treeIcon.append('use')
                        .attr('xlink:href', 'icons.svg#icon-tree')
                        .attr('width', iconHeight + 5)
                        .attr('height', iconHeight)
                        .attr('x', '0')
                        .attr('y', '25');
                    treeIcon.append('title').text('Добавить прямого потомка');
                    var manWomanIcon = groups.append('g').attr('class', 'icon man-woman-icon');
                    manWomanIcon.append('rect')
                        .attr('width', rectIconSize)
                        .attr('height', rectIconSize)
                        .attr('fill-opacity', 0)
                        .attr('x', '-25')
                        .attr('y', '3');
                    manWomanIcon.append('use')
                        .attr('xlink:href', 'icons.svg#icon-man-woman')
                        .attr('width', iconHeight + 5)
                        .attr('height', iconHeight)
                        .attr('x', '-25')
                        .attr('y', '3');
                    manWomanIcon.append('title').text('Добавить супруга');
                    var crossIcon = groups.append('g').attr('class', 'icon cross-icon');
                    crossIcon.append('rect')
                        .attr('width', rectIconSize)
                        .attr('height', rectIconSize)
                        .attr('fill-opacity', 0)
                        .attr('x', '30')
                        .attr('y', '3');
                    crossIcon.append('use')
                        .attr('xlink:href', 'icons.svg#icon-cross')
                        .attr('width', iconHeight)
                        .attr('height', iconHeight)
                        .attr('x', '30')
                        .attr('y', '3');
                    crossIcon.append('title').text('Удалить узел');
                    var eyeIcon = groups.append('g').attr('class', 'icon eye-icon');
                    eyeIcon.append('rect')
                        .attr('width', rectIconSize)
                        .attr('height', rectIconSize)
                        .attr('fill-opacity', 0)
                        .attr('x', '0')
                        .attr('y', '0');
                    eyeIcon.append('use')
                        .attr('xlink:href', 'icons.svg#icon-eye')
                        .attr('width', iconHeight)
                        .attr('height', iconHeight)
                        .attr('x', '0')
                        .attr('y', '0');
                    eyeIcon.append('title').text('Детальный просмотр');
                    var editIcon = groups.append('g').attr('class', 'icon edit-icon');
                    editIcon.append('rect')
                        .attr('width', rectIconSize)
                        .attr('height', rectIconSize)
                        .attr('fill-opacity', 0)
                        .attr('x', '0')
                        .attr('y', '-25');
                    editIcon.append('use')
                        .attr('xlink:href', 'icons.svg#icon-edit')
                        .attr('width', iconHeight)
                        .attr('height', iconHeight)
                        .attr('x', '0')
                        .attr('y', '-25');
                    editIcon.append('title').text('Редактировать информацию');

                    d3.selectAll('.node').on('click', function(d) {
                        var target = d3.event.target || d3.event.explicitOriginalTarget;
                        var circle = $(this).find('circle')[0];
                        if ($(target).is('.tree-icon') || $(target).closest('g').is('.tree-icon')) {
                            $timeout( function() {
                                $('#addChild').modal();
                                shrinkCircle.call(circle);
                                $scope.focusedNode.child = {
                                    gender: 'male'
                                }
                            }, 10)
                        }
                    }).on('mouseover', function(d) {
                        $scope.focusedNode = d
                    });
                    d3.selectAll('.node rect').on('mouseleave', function(d) {
                        var to = d3.event.toElement || d3.event.relatedTarget;
                        var circle = $(this).closest('.node').find('circle')[0];
                        if (to && (to.nodeName == 'path' || to.nodeName == 'use' || to.nodeName == 'rect' || to === circle) ) { //don't shrink circle if mouse went to child element
                            return
                        } //otherwise shrink it
                        shrinkCircle.call(circle)
                    });
                    var shrinkCircle = function () {
                        var parentNode = $(this).closest('.node')[0];
                        $timeout(function() {
                            d3.select(parentNode).classed('active', false);
                            d3.select(parentNode).selectAll('.icon')
                                .style('opacity', null)
                                .classed('fast-fade', false)
                        },500)
                        var promise = $(this).data('promise');
                        if ( promise !== undefined ) {
                            $timeout.cancel(promise)
                        }
                        d3.select(parentNode).selectAll('.icon').style('opacity', 0);
                        d3.select(this).transition().duration(500).attr('r', circleSmallRadius).attr('stroke-width', 4)
                    };
                    d3.selectAll('circle')
                        .on('mouseenter', function(d) {
                            var _this = this;
                            var from = d3.event.fromElement || d3.event.relatedTarget;
                            if (from.nodeName != 'use' && from.nodeName != 'path' || from.nodeName != 'rect') {
                                var promiseOld = $(this).data('promise');
                                if (promiseOld !== undefined) {
                                    $timeout.cancel(promiseOld)
                                }
                                var promise = $timeout(function() {
                                    var parentNode = $(_this).closest('.node')[0];
                                    d3.select('.node.active').classed('active', false);
                                    d3.select(parentNode).classed('active', true);
                                    d3.select(_this).transition().duration(500).attr('r', circleBigRadius).attr('stroke-width', 2)
                                    $timeout(function() {
                                        d3.select(parentNode).selectAll('.icon').classed('fast-fade', true);
                                        d3.select(parentNode).classed('active', true)
                                    }, 300)
                                }, 250);
                                $(this).data('promise', promise)
                            }
                        })
                        .on('mouseleave', function(d) {
                            var to = d3.event.toElement || d3.event.relatedTarget;
                            if (to && ('path' == to.nodeName || 'use' ==  to.nodeName || 'rect' == to.nodeName ) ) {
                                return
                            } //otherwise shrink it
                            shrinkCircle.call(this)
                        })
                }).error(function(data, status, headers) {
                    $scope.err = status
                })
            };

            $scope.triggerRedrawCanvas = function() {
                console.log('redraw')
            };

            $scope.addChild = function() {
                //TODO добавлять ребенка в массив children родителям
                var parent = $scope.focusedNode,
                    child = parent.child, otherParentId;
                child.generation = parent.generation + 1;
                child.parents = [parent._id];
                if (otherParentId = child.otherParent && child.otherParent._id) {
                    child.parents.push(otherParentId);
                    //TODO implement case when we choose other parent from available partners
                } else if (child.otherParent && child.otherParent.name.first) {
                    var otherParent = child.otherParent;
                    otherParent.gender = 'male' == parent.gender ? 'female' : 'male';
                    otherParent.generation = parent.generation;
                    otherParent.partners = [parent._id];
                    IndividualsService.add(otherParent)
                        .then(function (response) {
                            if (response.message == 'OK') {
                                otherParentId = response.added._id;
                                child.parents.push(otherParentId);
                                if (Array.isArray(parent.partners)) {
                                    parent.partners.push(otherParentId);
                                } else {
                                    parent.partners = [otherParentId];
                                }
                                $scope.people.push(response.added);
                                otherParent = response.added;
                                return IndividualsService.update(parent._id, { partners:  parent.partners, children: parent.children });
                            } else if (response.error) {
                                throw 'Ошибка при создании второго родителя: ' + response.error;
                            }
                        })
                        .then(function(response) {
                            if ('OK' == response.message ) {
                                return IndividualsService.add(child)
                            } else if (response.error) {
                                throw 'Ошибка при попытке привязать второго родителя к первому как супруга: '
                                + response.error;
                            }
                        })
                        .then(function(response) {
                            if ('OK' == response.message) {
                                $scope.people.push(response.added);
                                parent.children.push(response.added._id);
                                return IndividualsService.update(parent._id, {children: parent.children });
                            } else if (response.error) {
                                throw 'Ошибка при создании ребенка: ' + response.error;
                            }
                        })
                        .then(function(response) {
                            if ('OK' == response.message) {
                                otherParent.children.push(response.added._id);
                                return IndividualsService.update(otherParent._id, {children: otherParent.children});
                            } else if (response.error) {
                                throw 'Ошибка при добавлении ребенка в массив children первого родителя: ' + response.error;
                            }
                        })
                        .then(function(response) {
                            if (response.error) {
                                throw 'Ошибка при добавлении ребенка в массив children второго родителя: ' + response.error;
                            }
                        })
                        .catch(function(error) {
                            /**
                             * TODO: clean up (maybe remove created otherParent if failed to created child)
                             */
                            alert(error);
                        })
                        .finally(function() {
                            $('#addChild').modal('hide');
                            $scope.triggerRedrawCanvas();
                        });

                    //delete child.otherParent
                    //child.
                    //IndividualsService.add(child)
                } else {
                    IndividualsService.add(child)
                    .then(function(response) {
                        response = response.data;
                        if ('OK' == response.message) {
                            $scope.people.push(response.added);
                            parent.children.push(response.added._id);
                            return IndividualsService.update(parent._id, {children: parent.children });
                        } else if (response.error) {
                            throw 'Ошибка при создании ребенка: ' + response.error;
                        }
                    })
                    .then(function(response) {
                        if (response.error) {
                            throw 'Ошибка при добавлении ребенка в массив children первого родителя: ' + response.error;
                        }
                    })
                    .catch(function(error) {
                        /**
                         * TODO: clean up (maybe remove created otherParent if failed to created child)
                         */
                        alert(error);
                    })
                    .finally(function() {
                        $('#addChild').modal('hide');
                        $scope.triggerRedrawCanvas();
                    });

                }

            };


            //$scope.addPartner = function(to, partner) {
            //
            //}


    $('#tree').ready($scope.loadPeople)
}]);