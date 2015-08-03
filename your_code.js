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
    expandBufferIfNecessary(51, 51); // Initialize the buffer for the first time.

    // Track our current position in the maze.
    var row = 0;
    var col = 0;

    // ****************************************************************************** //
    // The core function - make a single move through the maze,
    // starting at the current position
    // ****************************************************************************** //
    function move() {
        if (MazeAPI.isEnd()) {
            // We are at the exit!
            return;
        }

        var openBranch = detectOpenBranch();
        if (openBranch) {
            // A path that has NEVER been taken is available.  Take it.
            // ... This works even for corridors without a branch.

            return;
        }

        // No untrodden path is available, so we must backtrack.
        // The algorithm guarantees that there can be only one possible backtracking direction.
        var backtrackBranch = locateBacktrackBranch();
        if (!backtrackBranch) {
            // Either the algorithm is broken, or there is no exit to this maze
            throw "There is no exit to the maze!";
        }

    }

    if (false) {
        /**
         * This is a very silly algorithm. It moves the player in a random direction until it reaches the end (if it ever does!)
         * TODO: Remove this code .. it's here just as an example of how to use the MazeAPI
         */
        var directions = ['down','up','left','right'];

        var moveRandomly = function() {

            console.log("Look what is around you: ", MazeAPI.lookAround());

            if (!MazeAPI.isEnd()) {
                var rndMove = Math.floor(Math.random() * 4);
                MazeAPI.move(directions[rndMove], moveRandomly);
            }

        };

        moveRandomly();
    }

    function expandBufferIfNecessary(x, y) { // Definitions of functions are allowed after calls to those functions, when this syntax is used
        // In case the maze is larger than our current maximum, exponentially increase its size.
        var doExpandWidth = false;
        var doExpandHeight = false;
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
