// This is where you put your code. Your aim is to write some code that gets the player to the end of the maze and that
// it works for every given maze.
//
// You'll be evaluated on the following points:
//
// 1. (70%) Your code works - for every given maze, your player makes it to the end when we run it (don't make us wait forever though)
// 2. (20%) Code readability - we can read and understand your code
// 3. (10%) Documentation - you explained well your approach and documented your code (where it was needed)
//
// Good luck!

"use strict";

MazeAPI.onRun(function() {

    console.log("Your code is running ..");

    //TODO: Explain your approach here
    /*
     * The key ideas for the maze algorithm are simple, but powerful.
     *
     * We use only local information - the branches available at every coordinate.
     * We save this local information for reuse whenever we return to the same square.
     *
     * Optimizations that utilize global information (namely, the geometrical structure of the paths)
     * would allow for a faster, better-scaling algorithm, but would be more complex.
     *
     * // ******* //
     * // STEP 1
     * // ******* //
     * The first concept used in the algorithm is to break loops by replacing one point in each loop
     * with a wall (logically).  This will never close off a route to the exit.
     * (Note that paths that merge are effectively loops, and the same reasoning applies.)
     * See comments in the code itself for the simple, slick approach that is used to detect and close loops
     * via local information only.
     *
     * // ******* //
     * // STEP 2
     * // ******* //
     * Once loops have logically been eliminated, the entire maze becomes a tree structure,
     * which simplifies the logic.  We use a depth-first approach to walking through the maze;
     * this means that we always choose to move deeper into the tree, before choosing to backtrack.
     * If we reach a dead end, we backtrack to the nearest branch and a simple trick can be used to logically replace
     * the entrance to the dead end with a logical, local wall (see comments in the code).
     * We then move down the next untraveled branch (if there is one) or, if there is no untraveled branch available,
     * we continue backtracking. This continues in iterative fashion.
     *
     * // ******* //
     * // COMMENTS
     * // ******* //
     * The above algorithm is robust against the starting position.
     * The starting position can be anywhere inside of the maze (not just at an edge or corner).
     * Also, the maze does not need to be rectangular.
     * There is a guaranteed O(n) efficiency to this algorithm because every path is guaranteed to
     * be traversed at most once in either direction.
     *
     * NOTE: An ECMAScript 6 supporting browser is required.
     */

    // Should be self-explanatory - the MAXIMUM allowed width/height of the maze
    // (the actual width/height can be less).
    // Will be dynamically resized if necessary.
    var maxMazeWidth = 50;
    var maxMazeHeight = 50;

    // ****************************************************************************** //
    // Create a buffer to track maze data.
    // The starting point is taken to be (0,0),
    // and the coordinates can be negative.
    // ****************************************************************************** //
    var mazeData = null;
    expandBufferIfNecessary({"row" : maxMazeHeight / 2 + 1, "col" : maxMazeWidth / 2 + 1}); // Initialize the buffer for the first time.

    // Track our current position in the maze.
    var row = 0;
    var col = 0;

    // ****************************************************************************** //
    // Kick off the recursive movement through the maze.
    // ****************************************************************************** //
    move();

    // ****************************************************************************** //
    // CALLED FROM ABOVE
    // The core function - make a single move through the maze,
    // starting at the current position
    // ****************************************************************************** //
    function move() {

        //console.log("Look what is around you: ", MazeAPI.lookAround());

        var surroundings = MazeAPI.lookAround();

        if (MazeAPI.isEnd()) {
            // We are at the exit of the maze!
            return;
        }

        var newPos = null;

        var openBranch = detectOpenBranch(surroundings);
        if (openBranch) {
            // A path that has NEVER been taken is available.  Take it.
            // ... This works even for corridors without a branch.
            newPos = openBranch;
        }
        else {
            // No untrodden path is available, so we must backtrack.
            // The algorithm guarantees that there can be only one possible backtracking direction.
            var backtrackBranch = locateBacktrackBranch(surroundings);
            if (!backtrackBranch) {
                // Either the algorithm is broken, or there is no exit to this maze
                throw "There is no exit to the maze!";
            }
            newPos = backtrackBranch;
        }

        // Set the proper bit to indicate that we are moving in the given direction.
        var currentData = mazeData[row * (maxMazeWidth + 1) + col];
        currentData |= newPos.bit;
        mazeData[row * (maxMazeWidth + 1) + col] = currentData;
        row = newPos.row;
        col = newPos.col;
        MazeAPI.move(newPos.dir, move);
    }

    // THE FOLLOWING FUNCTION IS CALLED FROM ABOVE
    // Definitions of functions are allowed after calls to those functions, when this function syntax is used
    function detectOpenBranch(surroundings) {
        if (surroundings.up === "space") {
            var testPos = {"row" : row-1, "col" : col, "bit" : 1, "dir" : "up"};
            if (testDirection(testPos)) {
                return testPos;
            }
        }
        if (surroundings.right === "space") {
            var testPos = {"row" : row, "col" : col+1, "bit" : 2, "dir" : "right"};
            if (testDirection(testPos)) {
                return testPos;
            }
        }
        if (surroundings.down === "space") {
            var testPos = {"row" : row+1, "col" : col, "bit" : 4, "dir" : "down"};
            if (testDirection(testPos)) {
                return testPos;
            }
        }
        if (surroundings.left === "space") {
            var testPos = {"row" : row, "col" : col-1, "bit" : 8, "dir" : "left"};
            if (testDirection(testPos)) {
                return testPos;
            }
        }

        return null;

        function testDirection(testPos) {
            expandBufferIfNecessary(testPos);

            // ****************************************************************************** //
            // A position being tested represents an open branch
            // if we have NEVER been at the given position.
            // This is the case if the 'up', 'down', 'right' & 'left' bits
            // of the position being tested are all unset
            // (meaning that we never moved in any direction out of the given position)
            // ****************************************************************************** //

            // Get the data byte corresponding to the test position
            var testByte = mazeData[testPos.row * (maxMazeWidth + 1) + testPos.col];
            if ( (testByte & 1) || (testByte & 2) || (testByte & 4) || (testByte & 8) ) {
                return false;
            }
            return true;
        }
    }

    // THE FOLLOWING FUNCTION IS CALLED FROM ABOVE
    // Definitions of functions are allowed after calls to those functions, when this function syntax is used
    function locateBacktrackBranch(surroundings) {
        if (surroundings.up === "space") {
            var testPos = {"row" : row-1, "col" : col, "bit" : 1, "dir" : "up"};
            if (testDirection(testPos, 4, 1)) {
                return testPos;
            }
        }
        if (surroundings.right === "space") {
            var testPos = {"row" : row, "col" : col+1, "bit" : 2, "dir" : "right"};
            if (testDirection(testPos, 8, 2)) {
                return testPos;
            }
        }
        if (surroundings.down === "space") {
            var testPos = {"row" : row+1, "col" : col, "bit" : 4, "dir" : "down"};
            if (testDirection(testPos, 1, 4)) {
                return testPos;
            }
        }
        if (surroundings.left === "space") {
            var testPos = {"row" : row, "col" : col-1, "bit" : 8, "dir" : "left"};
            if (testDirection(testPos, 2, 8)) {
                return testPos;
            }
        }

        return null;

        function testDirection(testPos, testBitFromTarget, testBitToTarget) {
            expandBufferIfNecessary(testPos);

            // ****************************************************************************** //
            // A position being tested represents a branch that can be backtracked across
            // if and only if the path FROM the test position TO our current position has been traversed,
            // but NOT the path FROM our current position TO the test position.
            // ****************************************************************************** //

            // Get the data byte corresponding to the test position and to the current position
            var targetData = mazeData[testPos.row * (maxMazeWidth + 1) + testPos.col];
            var currentData = mazeData[row * (maxMazeWidth + 1) + col];
            if ( ((targetData & testBitFromTarget) != 0) && ((currentData & testBitToTarget) == 0) ) {
                return true;
            }
            return false;
        }
    }

    // THE FOLLOWING FUNCTION IS CALLED FROM ABOVE
    // Definitions of functions are allowed after calls to those functions, when this function syntax is used
    function expandBufferIfNecessary(testPos) {
        // In case the maze is larger than our current maximum, exponentially increase its size.
        var doExpandWidth = false;
        var doExpandHeight = false;
        var x = testPos.col;
        var y = testPos.row;
        if (Math.abs(x) > maxMazeWidth / 2) { doExpandWidth = true; }
        if (Math.abs(y) > maxMazeHeight / 2) { doExpandHeight = true; }
        if (doExpandWidth || doExpandHeight) {
            var newBufferSize = ((doExpandWidth ? maxMazeWidth * 2 : maxMazeWidth) + 1) * ((doExpandHeight ? maxMazeHeight * 2 : maxMazeHeight) + 1);
            var tempBuffer = new ArrayBuffer(newBufferSize);
            var tempData = new Uint8Array(tempBuffer);
            if (mazeData !== null) {
                var currentTargetIndex = 0;
                var currentSourceIndex = 0;
                for (var j = 0; j < maxMazeHeight + 1; ++j) {
                    tempData.set(mazeData.subarray(currentSourceIndex, currentSourceIndex + maxMazeWidth), currentTargetIndex);
                    currentSourceIndex += maxMazeWidth;
                    currentTargetIndex += (doExpandWidth ? maxMazeWidth * 2 : maxMazeWidth) + 1;
                }
            }
            maxMazeWidth *= 2;
            maxMazeHeight *= 2;
            mazeData = tempData;
        }
    }

});
