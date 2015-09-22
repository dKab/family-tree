/**
 * Created by dmitriy on 25.07.2015.
 */
angular.module('familyTree').factory('TreeRendererService', function() {
    /* global algorithm variables */

    var allNodes
    /**
     * The algorithm maintains a list of the previous node at each level,
     * that is, the adjacent neighbor to the left. levelZeroPtr is a pointer
     * to the first entry in this list.
     */
    var levelZeroPtr

    /**
     * A fixed distance used in the final walk of the tree to determine the
     * absolute x-coordinate of a node with respect to the apex node of
     * the tree.
     */
    var xTopAdjustment

    /**
     * A fixed distance used in the final walk of the tree to determine the
     * absolute y-coordinate of a node with respect to the apex node of
     * the tree.
     */
    var yTopAdjustment

    /* The following global values must be set before the algorithm is called; they are
     not changed during the algorithm. */

    /**
     * The fixed distance between adjacent levels of the tree. Used in
     * determining they-coordinate of a node being positioned.
     * @type {number}
     */
    var levelSeparation = 100

    /**
     * The maximum number of levels in the tree to be positioned
     * @type {Number}
     */
    var maxDepth = Infinity

    /**
     * The minimum distance between adjacent siblings of the tree.
     * @type {number}
     */
    var SiblingSeparation = 100

    /**
     * The minimum distance between adjacent subtrees of a tree.
     * @type {number}
     */
    var subtreeSeparation = 150


    var self = {
        nodeRadius: 10,
        /**
         * Determines the coordinates for each
         * node in a tree. A pointer to the apex node of the tree is passed as input.
         * This assumes that the x and y coordinates of the apex node are set as
         * desired, since the tree underneath it will be positioned with respect to those
         * coordinates. Returns TRUE if no errors, otherwise returns FALSE.
         * @param node {Object}
         * @return {boolean}
         * @param nodesCollection
         */
        positionTree: function(node, nodesCollection) {
            if (!nodesCollection) {
                return false
            }
            allNodes = nodesCollection
            if (node) {
                /*Initialize the list of previous nodes at each level. */
                initPrevNodeList()
                /*Do the preliminary positioning with a postorder walk. */
                firstWalk(node, 0)
                /*Determine how to adjust all the nodes with respect to  the location of the root. */
                xTopAdjustment = node.xCoord - node.prelim
                yTopAdjustment = node.yCoord
                /* Do the final positioning with a preorder walk.  */
                return secondWalk(node, 0, 0)
            } else {
                return true;
            }
        }
    }

    /**
     * Initialize the list of previous nodes at each level. Three list-maintenance procedures,
     * GETPREVNODEATLEVEL, SETPREVNODEATLEVEL, and
     * INITPREVNODELIST. maintain a singly-linked list. Each entry in the list corresponds
     * to the node previous to the current node at a given level (for example,
     * element 2 in the list corresponds to the node to the left of the current node at
     * level 2). If the maximum tree size is known beforehand, this List can be
     * replaced with a fixed-size array, and these procedures become trivial.
     * Each list element contains two fields: PREVNODE-the previous node at this
     * level, and NEXTLEVEL-a forward pointer to the next list element. The list is
     * does not need to be cleaned up between calls to POSITIONTREE, for performance.
     */
    function initPrevNodeList() {
        /* Start with the node at level 0 - the apex of the tree.*/
        var tempPtr = levelZeroPtr
        while (tempPtr) {
            tempPtr.prevNode = null
            tempPtr = prevNode.nextLevel
        }
    }

    /**
     * Get the previous node at this level.
     * @param level
     * @returns {*}
     */
    function getPrevNodeAtLevel(level) {
        /* Start with the node at level 0 - the apex of the tree. */
        var tempPtr = levelZeroPtr
        var i = 0
        while (tempPtr) {
            if (i === level) {
                return tempPtr.prevNode
            }
            tempPtr = tempPtr.nextLevel
            i++
        }
        /*Otherwise, there 11as no node at the specific level. */
        return null
    }

    /**
     * Set an element in the list.
     * @param level
     * @param node
     */
    function setPrevNodeAtLevel (level, node) {
        /* Start with the node at level 0 - the apex of the tree.*/
        var tempPtr = levelZeroPtr
        var i = 0
        while (tempPtr) {
            if (i === level) {
                /*At this level, replace the existing list */
               /*element with the passed-in node. */
                tempPtr.prevNode = node
                return
            } else if (tempPtr.nextLevel) {
                /*There isn't a left element yet at this level, so */
                /* add one. The following instructions prepare the */
                /* list element at the next level, not at this one. */
                var newNode = {}
                newNode.prevNode = null
                newNode.nextLevel = null
                tempPtr.nextLevel = newNode
            }
            /*Prepare to move to the next level, to look again. */
            tempPtr = tempPtr.nextLevel
            i++
        }
        /*Should only get here if LevelZeroPtr is nil. */
        levelZeroPtr = {}
        levelZeroPtr.prevNode = node
        levelZeroPtr.nextLevel = null
    }

    function hasChild(node) {
        return node.children && node.children.length !== 0
    }

    function isLeaf(node) {
        return !!(!node.children || node.children.length === 0);
    }
    function hasLeftSibling(node) {
        if (!node.parents || node.parents.length === 0) {
            return false
        }
        var par = parent(node)
        var firstChildOfParent = firstChild(par)
        return firstChildOfParent._id !== node._id
    }

    function hasRightSibling(node) {
        //TODO учесть супругов
        if (!node.parents || node.parents.length === 0) {
            return false
        }
        var par = parent(node)
        var siblingsNum = par.children.length
        if (siblingsNum < 2) {
            return false
        }
        var lasChildId = par.children[siblingsNum - 1]
        return lasChildId !== node._id
    }

    function meanNodeSize(leftNode, rightNode) {
        var nodeSize = 0
        if (leftNode) {
            nodeSize +=  rightSize(leftNode)
        }
        if (rightNode) {
            nodeSize += leftSize(rightNode)
        }
        return nodeSize
    }

    function leftSibling(node) {
        if (hasLeftSibling(node)) {
            var nodeIndex = node.parents[0].children.indexOf(node._id)
            var leftSiblingId = node.parents[0].children[nodeIndex - 1]
            return _.find(allNodes, {_id: leftSiblingId})
        } else {
            return false
        }
    }

    function rightSibling(node) {
        if (hasRightSibling(node)) {
            var nodeIndex = node.parents[0].children.indexOf(node._id)
            var rightSiblingId = node.parents[0].children[nodeIndex + 1]
            return _.find(allNodes, {_id: rightSiblingId})
        } else {
            return false
        }
    }


    function leftSize(node) {
        return self.nodeRadius
    }

    function rightSize(node) {
        return self.nodeRadius
    }

    /**
     *
     * @param node
     * @returns {*}
     */
    function firstChild(node) {
        if (!hasChild(node)) {
            return false;
        }
        var firstChildId =  node.children[0];
        return _.find(allNodes, {_id: firstChildId});
    }

    /**
     * In this first postorder walk, every node of the tree is
     * assigned a preliminary x-coordinate (held in field PRELIM(Node)). In addition,
     * internal nodes are given modifiers, which will be used to move their offspring
     * to the right (held in field MODIFIER(Node)).
     * @param node
     * @param level
     */
    function firstWalk(node, level) {
        /* Set the pointer to the previous node at this level.  */
        node.leftNeighbour  = getPrevNodeAtLevel(level)
        setPrevNodeAtLevel(level, node) // This is now the previous.
        node.modifier = 0 //Set the default modifier value.
        if (isLeaf(node) || maxDepth === level) {
            if (hasLeftSibling(node)) {
                /* Determine the preliminary x-coordinate based on:
                 the preliminary x-coordinate of the left sibling,
                 the separation between sibling nodes, and
                 tne mean size of left sibling and current node. */
                var leftSibling = leftSibling(node)
                node.prelim =  leftSibling.prelim + SiblingSeparation +
                meanNodeSize(leftSibling , node)

            } else {
                /* No sibling on the left to worry about. */
                node.prelim = 0
            }
        } else {
            /* This node is not a leaf, so call this procedure
               recursively for each of its offspring. */
            var leftmost = firstChild(node)
            var rightmost = leftmost
            firstWalk(leftmost, level + 1)
            while (hasRightSibling(rightmost)) {
                rightmost = rightSibling(rightmost)
                firstWalk(rightmost, level + 1)
            }
            var midpoint = (leftmost.prelim + rightmost.prelim) / 2;
            if (hasLeftSibling(node)) {
                node.prelim = leftSibling(node).prelim +
                SiblingSeparation +
                meanNodeSize(leftSibling(node), node)

                node.modifier = node.prelim - midpoint
                apportion(node, level)
            } else {
                node.prelim = midpoint
            }
        }
    }

    /**
     * Function CHECKEXTENTSRANGE. This function verifies that the passed x- and
     * y-coordinates are within the coordinate system b~ing used for the
     * drawing. For example, if the x-and y-coordinates must be 2-byte integers, this
     * function could determine whether xValue and yValue are too large.
     * @param xValue
     * @param yValue
     * @returns {boolean}
     */
    function checkExtentsRange(xValue, yValue) {
        return !!(xValue > 0 && yValue > 0);
    }

    /**
     *
     * @param node
     * @returns {*}
     */
    function parent(node) {
        if (!node.parents && node.parents.length === 0) {
            return false
        }
        var parentId = node.parents[0]
        return _.find(allNodes, {_id: parentId});
    }

    /**
     * Function SECONDWALK. During a second preorder walk, each node is given
     * a final x-coordinate by summing its preliminary x-coordinate and the modifiers
     * of all the node's ancestors. The y-coordinate depends on the height of the
     * tree. If the actual position of an interior node is right of its preliminary place,
     * the subtree rooted at the node must be moved right to center the sons
     * around the father. Rather than immediately readjust all the nodes in the
     * subtree, each node remembers the distance to the provisional place in a modifier
     * field (MODIFIER(Node)). In this second pass down the tree, modifiers are
     * accumulated and applied to every node. Returns TRUE if no errors, otherwise
     * returns FALSE.
     * @param node
     * @param level
     * @param modSum
     */
    function secondWalk(node, level, modSum) {
        var result
        if (level <= maxDepth) {
            var xTemp = xTopAdjustment + node.prelim + modSum
            var yTemp = yTopAdjustment + (level * levelSeparation)
                /* Check to see that xTemp and yTemp are of the proper */
                /* size for your application. */
            if (checkExtentsRange(xTemp, yTemp)) {
                node.xCoord = xTemp
                node.yCoord = yTemp
                if (hasChild(node)) {
                    /*Apply the modifier value for this node to */
                    /*all its offspring. */
                    result = secondWalk(firstChild(node),
                        level + 1,
                        modSum)
                }
                if (result === true && hasRightSibling(node)) {
                    result = secondWalk(rightSibling(node),
                        level + 1,
                        modSum)
                }
            } else {
                /* Continuing would put the tree outside of the */
                /* drawable extents range. */
                result = false
            }
        } else {
            /* We are at a level deeper than what we want to draw. */
            result = true
        }
        return result;
    }

    /**
     * The current node's nearest neighbor to the left, at the same level
     * @param node
     * return (*)
     */
    function leftNeighbour(node) {
        //TODO implement
    }

    /**
     * Procedure APPORTION. This procedure cleans up the positioning
     * of small sibling subtrees, thus fixing the "left-to-right gluing" problem evident
     * in earlier algorithms. When moving a new subtree farther and farther to the
     * right, gaps may open up among smaller subtrees that were previously
     * sandwiched between larger subtrees. Thus, when moving the new, larger
     * subtree to the right, the distance it is moved is also apportioned to smaller,
     * interior subtrees, creating a pleasing aesthetic placement_
     * @param node
     * @param level
     */
    function apportion(node, level) {
        var leftmost = firstChild(node)
        var neighbour = leftmost.leftNeighbour
        var compareDepth = 1
        var depthToStop = maxDepth - level

        while (leftmost && neighbour && compareDepth < depthToStop) {
            /* Compute the location of Leftmost and 11here it should */
            /* be with respect to Neighbor. */
            var leftModSum = 0
            var rightModSum = 0
            var ancestorLeftmost = leftmost
            var ancestorNeighbor = neighbor
            for (var i=0; i < compareDepth; i++) {
                ancestorLeftmost = parent(ancestorLeftmost)
                ancestorNeighbor = parent(ancestorNeighbor)
                rightModSum = rightModSum + ancestorLeftmost.modifier
                leftModSum = leftModSum + ancestorNeighbor.modifier

            }
            /* Find the floveDistance, and apply it to Node's subtree. */
            /*Add appropriate portions to smaller interior subtrees. */
            var moveDistance = neighbour.prelim +
                    leftModSum + subtreeSeparation + meanNodeSize(leftmost, neighbour) -
                        (leftmost.prelim + rightModSum)
            if (moveDistance > 0) {
               /*Count interior sibling subtrees in LeftSiblings*/
                var tempPtr = node
                var leftSiblings = 0
                while (tempPtr && tempPtr !== ancestorNeighbor) {
                    leftSiblings = leftSiblings + 1
                    tempPtr = leftSibling(tempPtr)
                }
                if (tempPtr) {
                    /*Apply portions to appropriate leftsibling */
                    /* subtrees. */
                    var portion = moveDistance / leftSiblings
                    tempPtr = node
                    while (tempPtr === ancestorNeighbor) {
                        tempPtr.prelim += moveDistance
                        tempPtr.modifier += moveDistance
                        moveDistance -= portion
                        tempPtr = leftSibling(tempPtr)
                    }
                } else {
                    /* Don't need to move anything--it needs to */
                    /* be done by an ancestor because */
                    /* AncestorNeighbor and AncestorLeftmost are */
                    /* not siblings of each other. */
                    return
                }
            }
            /* Determine the leftmost descendant of Node at the next */
            /* lower level to compare its positioning against that of*/
            /* its Neighbour */
            compareDepth++
            if (isLeaf(leftmost)) {
                leftmost = getLeftmost(node, 0, compareDepth)
            } else {
                leftmost = firstChild(leftmost)
            }

        }

    }

    /**
     * Function GETLEFTMOST. This function returns the leftmost descendant of a
     * node at a given Depth. This is implemented using a postorder walk of the
     * subtree under Node, down to the level of Depth. Level here is not the absolute
     * tree level used in the two main tree walks; it refers to the level below the
     * node whose leftmost descendant is being found.
     * @param node
     * @param level
     * @param depth
     */
    function getLeftmost(node, level, depth) {
        if (level >= depth) {
            return node
        } else if (isLeaf(node)) {
            return null
        } else {
            var rightmost = firstChild(node)
            var leftmost = getLeftmost(rightmost, level + 1, depth)
                /* Do a postorder walk of the subtree below Node. */
            while (!leftmost && hasRightSibling(rightmost)) {
                rightmost = rightSibling(rightmost)
                leftmost = getLeftmost(rightmost, level + 1, depth)
            }
            return leftmost
        }
    }



    return self;

})