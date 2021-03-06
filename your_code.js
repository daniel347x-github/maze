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
     * We use and save only local information: which of the four directions the user has traversed out of any given square.
     *
     * We save this information in a bitmask utilizing 4 bits per coordinate. For efficiency, we store the bitmasks in a (contiguous) ArrayBuffer.
     *
     * The fact that only the 'up', 'right', 'down', 'left' traversal information needs to be saved per square
     * in order to complete the maze belies the REASONING behind the algorithm.
     *
     * The REAL algorithm - conceptually and in specific detail - follows.
     *
     * // ******* //
     * // CONCEPT 1
     * // ******* //
     * The first concept used in the algorithm is to break loops by replacing one point in each loop with a wall (logically speaking).
     * This will never close off a route to the exit.
     * (Note that paths that merge are effectively loops, and the same reasoning applies.)
     * We create a logical wall at the exact boundary between two squares that, if crossed, would cause us to rejoin a path we've already been on
     * (assuming we're not backtracking, which is discussed below).  This breaks all loops!
     *
     * // ******* //
     * // CONCEPT 2
     * // ******* //
     * Once loops have logically been eliminated, the entire maze becomes a tree structure, which simplifies the logic.
     * We use a depth-first approach to walking through the maze; this means that we always choose to move deeper into the tree, before choosing to backtrack.
     * If we reach a dead end, we backtrack to the nearest decision-point branch and a simple test later indicates that the branch
     * is now a dead end (see comments below) - this also becomes a 'logical wall'.
     * We then move down the next untraveled branch (if there is one) or, if there is no untraveled branch available, we continue backtracking.
     *
     * This procedure continues in iterative fashion,
     * breaking loops and closing off entire dead-end paths with logical walls until the remaining available test paths converge on a path to the end of the maze.
     *
     * // ******* //
     * // Algorithm
     * // ******* //
     * With the above overall concepts in place, we can now derive the algorithm itself.
     * The algorithm breaks the motion into two modes: forward mode, and backtracking mode.
     * (1) Forward mode (depth-first)
     *     In this mode the user always moves across uncharted territory.  If there is an adjacent square
     *     to be traversed that has never been visited previously, take it without question!
     *     Given two or more available such squares, the order does not matter.
     *     Careful consideration of this rule reveals that the algorithm will always cause the user
     *     to move deeper into the (logical) tree structure before moving to sibling branches in the tree structure.
     *     This makes it a depth-first algorithm.
     *     (This assumes that loops have been broken, which is accomplished by the backtracking algorithm, discussed next.)
     * (2) Backtracking mode
     *     When there is no available square that has NOT been traversed adjacent to the current square,
     *     the user has found (or is on) a dead end branch relative to the tree structure of the maze.
     *     (This follows from the fact that the exit of the maze will always be an open branch within the tree structure.)
     *     The user must now backtrack out of the dead branch.
     *     The user backtracks following two rules.
     *     (a) Follow rule (1) (and therefore end backtracking) if there is an adjacent square available that has never been traversed.
     *     (b) Do not backtrack onto a square if that would cause a loop to form, or if we would enter a dead-end path.
     *         - Break Loops: Careful consideration reveals that a simple condition
     *           indicates the presence of a loop that would form if an adjacent square were chosen.
     *           Namely: If the user HAS previously BEEN on the
     *           given adjacent square, but has NEVER moved FROM the adjacent square TO the current square (and has never moved
     *           from the current square to the given adjacent square, though the latter is a condition that can never occur),
     *           then a loop would form by moving to that adjacent square; do not do so.
     *         - Avoid dead ends: If the user has previously moved both FROM the adjacent square TO the current square,
     *           and TO the adjacent square FROM the current square, this is a dead-end.  Do not take it.
     *         From the above, the backtracking condition is revealed: The user MUST have previously moved FROM the adjacent square
     *         TO the current square, but MUST NOT have moved TO the adjacent square FROM the current square.
     *         If this single condition is met on squares that have no adjacent open branches, this is a valid backtracking square.
     *         Note that there can only be one possible valid backtracking move available at any given position with no adjacent open branches.
     *
     * That's all!  With the above algorithm & rules in place, the maze can be traversed.
     * You can see from the above rules that only the local 'up', 'right', 'down', 'left' traversal information needs to be tracked for every square.
     *
     * // ******************* //
     * // ADDITIONAL COMMENTS
     * // ******************* //
     * The above algorithm is robust against the starting position.
     * The starting position can be anywhere inside of the maze (not just at an edge or corner).
     * Also, the maze does not need to be rectangular.
     * There is a guaranteed O(n) efficiency to this algorithm because every path is guaranteed to
     * be traversed at most once in either direction.
     * Optimizations that utilize global information (namely, the geometrical structure of the paths)
     * would allow for a faster, better-scaling algorithm, but would be more complex.
     *
     * NOTE: An ECMAScript 6 supporting browser is required.
     */

    // ****************************************************************************** //
    // Create a helper object that wraps the internal functions
    // ****************************************************************************** //
    var internals = new implementation();

    // ****************************************************************************** //
    // Kick off the recursive movement through the maze.
    // (See below for the function definition)
    // ****************************************************************************** //
    move();

    // ****************************************************************************** //
    // THE FOLLOWING FUNCTION IS CALLED FROM IMMEDIATELY ABOVE
    // This is the core function - it makes a single move through the maze,
    // starting at the current position
    // ****************************************************************************** //
    function move() {

        var surroundings = MazeAPI.lookAround();

        if (MazeAPI.isEnd()) {
            // We are at the exit of the maze!
            return;
        }

        // This variable will be filled with the new position to which we are going to move
        var newPos = null;

        // ****************************************************************************** //
        // This is a depth-first algorithm.
        // Therefore, first check if there is an adjacent position that is available (not a wall)
        // and that we have NOT visited before.
        // The order does not matter - if there are more than one such open branches, just move down the first one we find.
        // The condition of an open branch is that ALL FOUR DIRECTIONS leading FROM the target (adjacent) position
        // must NEVER have been traversed.
        // ****************************************************************************** //
        var openBranch = internals.detectOpenBranch(surroundings);
        if (openBranch) {
            // ****************************************************************************** //
            // A path onto an adjacent square that has NEVER been visited is available.  Take it.
            // ... This works even for corridors (i.e., squares without a decision-point branch).
            // ****************************************************************************** //
            newPos = openBranch;
        }
        else {
            // ****************************************************************************** //
            // No open branch is available, so we must backtrack.
            // The algorithm guarantees that there will be one and only one backtracking direction
            // from a given square assuming that there IS an exit to the maze and that no open branch squares are available.
            // (This also applies in corridors.)
            // THE PROPER BACKTRACKING SQUARE IS FOUND SIMPLY BY BREAKING LOOPS and AVOIDING DEAD END PATHS:
            // - Break loops:
            //   If we have previously been on the target adjacent square but NEVER traversed to/from that square
            //   from/to our current square, this reveals a LOOP and we break that loop by treating that boundary
            //   as a LOGICAL WALL: It is rejected as a backtracking possibility.
            // - Skip dead ends:
            //   If we have previously traversed in BOTH directions over a given boundary,
            //   this reveals a DEAD END and it counts as a LOGICAL WALL; it is rejected as a backtracking possibility.
            // Therefore, the condition for a BACKTRACKING path is simply that
            // we must NEVER have previously moved FROM the current position TO the target position,
            // but that we MUST HAVE previously moved FROM the target position TO the current position.
            // ****************************************************************************** //
            var backtrackBranch = internals.locateBacktrackBranch(surroundings);
            if (!backtrackBranch) {
                // Either the algorithm is broken, or there is no exit to this maze
                throw "There is no exit to the maze!";
            }
            newPos = backtrackBranch;
        }

        // ****************************************************************************** //
        // This is the key state-saving step of the algorithm!
        // Set the proper state bit to indicate that we are traversing in the given direction from the current square.
        // ****************************************************************************** //
        var bufferIndex = internals.getBufferIndex(internals.row, internals.col);
        var currentData = internals.mazeData[bufferIndex];
        currentData |= newPos.bit;
        internals.mazeData[bufferIndex] = currentData;

        // Save our new position
        internals.row = newPos.row;
        internals.col = newPos.col;

        // Now call the API to actually make the move
        // (once the animation is complete, the API will call our 'move' function again)
        MazeAPI.move(newPos.dir, move);
    }

});

// ****************************************************************************** //
// The following constructor function (class) contains the IMPLEMENTATION details.
// For the algorithm itself, see above.
// ****************************************************************************** //
function implementation() {

    var self = this;

    // Should be self-explanatory - the MAXIMUM allowed width/height of the maze (the actual width/height can be less).
    // Will be dynamically resized if necessary.
    // START THE DIMENSION AT (2+1, 2+1) TO DEMONSTRATE THAT THE MAZE-EXPANSION CODE IS BUG-FREE.
    self.maxMazeWidth = 2;
    self.maxMazeHeight = 2;

    console.log("Initial dimensions of maze: " + self.maxMazeHeight + "x" + self.maxMazeWidth);

    // Track our current position in the maze.
    self.row = 0;
    self.col = 0;

    // ****************************************************************************** //
    // Create a buffer to track LOCAL maze data (which of the four directions have been traversed out of each & every square?).
    // Initialize to 0 for all squares & potential squares.
    // The starting point in the maze is taken to be (0,0) (the center of a POTENTIAL maze, even if the ACTUAL maze
    // has (0,0) at the upper left because the starting position is at the upper left).
    // The coordinates can be negative in the general case.
    // EACH COORDINATE corresponds to a single byte in the buffer.
    // The function that calculates the index within the buffer for the data byte for a given (row,col) is below.
    //
    // The BYTE for each coordinate is a bitmask:
    // 0x01 represents UP
    // 0x02 represents RIGHT
    // 0x04 represents DOWN
    // 0x08 represents LEFT
    // (The remaining 4 bits in each byte are unused)
    //
    // If a bit is SET, it means that the path FROM the given coordinate in the given direction has been traversed.
    // Each byte is initialized to all 0's, meaning no squares have been traversed at the beginning.
    // This local information is all the information that we need to solve the maze in O(n).
    // ****************************************************************************** //
    // This object will be instantiated at the end of this constructor function (in a call to 'expandBufferIfNecessary')
    self.mazeData = null;

    // ****************************************************************************** //
    // This function tests to see if there are any OPEN BRANCHES adjacent to the current position.
    // ... That means specifically: any adjacent position that we have NEVER BEEN ON previously is an OPEN BRANCH,
    // given by the condition that the given adjacent position has NEVER been traversed OUT OF (in any direction).
    // (This works even in corridors, so no special logic is used for that case.)
    // ****************************************************************************** //
    self.detectOpenBranch = function(surroundings) {
        if (surroundings.up === "space") {
            // Test the square above to see if it's ever been traversed out of
            var testPos = {"row" : self.row-1, "col" : self.col, "bit" : 1, "dir" : "up"};
            if (testDirection(testPos)) {
                return testPos;
            }
        }
        if (surroundings.right === "space") {
            // Test the square to the right to see if it's ever been traversed out of
            var testPos = {"row" : self.row, "col" : self.col+1, "bit" : 2, "dir" : "right"};
            if (testDirection(testPos)) {
                return testPos;
            }
        }
        if (surroundings.down === "space") {
            // Test the square below to see if it's ever been traversed out of
            var testPos = {"row" : self.row+1, "col" : self.col, "bit" : 4, "dir" : "down"};
            if (testDirection(testPos)) {
                return testPos;
            }
        }
        if (surroundings.left === "space") {
            // Test the square to the left to see if it's ever been traversed out of
            var testPos = {"row" : self.row, "col" : self.col-1, "bit" : 8, "dir" : "left"};
            if (testDirection(testPos)) {
                return testPos;
            }
        }

        return null;

        // ****************************************************************************** //
        // Test a single adjacent position to see if we have ever been on it
        // (i.e., to see if it has ever been traversed out of).
        // ****************************************************************************** //
        function testDirection(testPos) {
            self.expandBufferIfNecessary(testPos); // if the position we are about to test would be OUTSIDE the current maze's maximum dimensions, enlarge the data buffer storing the maze data

            // ****************************************************************************** //
            // A position being tested represents an open branch
            // if we have NEVER been at the given position.
            // This is the case if the 'up', 'down', 'right' & 'left' bits
            // of the position being tested are all unset
            // (meaning that we never moved in any direction out of the given position)
            // ****************************************************************************** //

            // Get the data byte corresponding to the test position
            var testByte = self.mazeData[self.getBufferIndex(testPos.row, testPos.col)];

            // Test if any bit has been set - if so, we HAVE been on that square, so return false
            if ( (testByte & 1) || (testByte & 2) || (testByte & 4) || (testByte & 8) ) {
                return false;
            }

            // Success!  The square being tested has never been visited before.
            // It is an open branch.  Return true.
            return true;
        }
    };

    // ****************************************************************************** //
    // This function tests to see which direction we need to go to backtrack.
    // The algorithm guarantees that if there are no open branch positions adjacent to our current position,
    // there MUST be one and only one direction in which to backtrack (assuming there is a path to the exit).
    // The condition is that the given adjacent position is one FROM which we have previously moved TO our current position,
    // but one TO which we have never moved FROM our current position.
    // ****************************************************************************** //
    self.locateBacktrackBranch = function(surroundings) {
        if (surroundings.up === "space") {
            // Test the square above to see if the backtracking condition is met
            var testPos = {"row" : self.row-1, "col" : self.col, "bit" : 1, "dir" : "up"};
            if (testDirection(testPos, 4, 1)) {
                return testPos;
            }
        }
        if (surroundings.right === "space") {
            // Test the square to the right to see if the backtracking condition is met
            var testPos = {"row" : self.row, "col" : self.col+1, "bit" : 2, "dir" : "right"};
            if (testDirection(testPos, 8, 2)) {
                return testPos;
            }
        }
        if (surroundings.down === "space") {
            // Test the square below to see if the backtracking condition is met
            var testPos = {"row" : self.row+1, "col" : self.col, "bit" : 4, "dir" : "down"};
            if (testDirection(testPos, 1, 4)) {
                return testPos;
            }
        }
        if (surroundings.left === "space") {
            // Test the square to the left to see if the backtracking condition is met
            var testPos = {"row" : self.row, "col" : self.col-1, "bit" : 8, "dir" : "left"};
            if (testDirection(testPos, 2, 8)) {
                return testPos;
            }
        }

        return null;

        // ****************************************************************************** //
        // Test a single adjacent position to see if the (above) backtracking condition is met for that position.
        // ****************************************************************************** //
        function testDirection(testPos, testBitFromTarget, testBitToTarget) {
            self.expandBufferIfNecessary(testPos); // if the position we are about to test would be OUTSIDE the current maze's maximum dimensions, enlarge the data buffer storing the maze data.

            // ****************************************************************************** //
            // A position being tested represents a branch that can be backtracked across
            // if and only if the path FROM the test position TO our current position has been traversed,
            // but NOT the path FROM our current position TO the test position.
            // ****************************************************************************** //

            // Get the data byte corresponding to the test position and to the current position

            var targetData = self.mazeData[self.getBufferIndex(testPos.row, testPos.col)];
            var currentData = self.mazeData[self.getBufferIndex(self.row, self.col)];

            // Test for the backtracking condition
            if ( ((targetData & testBitFromTarget) != 0) && ((currentData & testBitToTarget) == 0) ) {
                // The backtracking condition is met: return true
                return true;
            }

            // The backtracking condition has not been met: return false
            return false;
        }
    };

    // ****************************************************************************** //
    // This function expands the data buffer if the maze is becoming too big.
    // Note that the maze CAN be SMALLER than the maximum dimensions.
    // ****************************************************************************** //
    self.expandBufferIfNecessary = function(testPos) {
        // In case the maze is larger than our current maximum, exponentially increase its size.
        var doExpandWidth = false;
        var doExpandHeight = false;
        var x = testPos.col;
        var y = testPos.row;
        if (Math.abs(x) > self.maxMazeWidth / 2) { doExpandWidth = true; }
        if (Math.abs(y) > self.maxMazeHeight / 2) { doExpandHeight = true; }
        if (doExpandWidth || doExpandHeight) {
            
            var newMazeWidth = self.maxMazeWidth;
            var newMazeHeight = self.maxMazeHeight;
            if (doExpandWidth) { newMazeWidth *= 2; }
            if (doExpandHeight) { newMazeHeight *= 2; }
            //console.log("Prior to expanding maze, contents of buffer:");
            //self.spitBuffer();
            //console.log("Expanding maze to " + newMazeHeight + "x" + newMazeWidth);
            var newBufferSize = (newMazeWidth + 1) * (newMazeHeight + 1);
            var tempBuffer = new ArrayBuffer(newBufferSize);
            var tempData = new Uint8Array(tempBuffer);
            if (self.mazeData !== null) {
                // There is existing maze data.
                // Intelligently copy the existing data into our new data buffer.
                // (It's non-trivial logic, but still fairly simple.
                // Note that in each data structure, the row data appears contiguously, with the first row's data immediately followed
                // by the second row's data, and so on to the final row.)
                
                var currentTargetIndex = 0;
                if (doExpandHeight) {
                    // pad with rows at bottom
                    currentTargetIndex += (self.maxMazeHeight / 2) * (newMazeWidth + 1);
                }
                if (doExpandWidth) {
                    // pad with columns at left
                    currentTargetIndex += self.maxMazeWidth / 2;
                }
                var currentSourceIndex = 0;
                for (var j = 0; j < self.maxMazeHeight + 1; ++j) {
                    // set the data
                    var dataToCopy = "";
                    for (var d=0; d<self.maxMazeWidth + 1; ++d) {
                        dataToCopy += self.mazeData[currentSourceIndex+d];
                    }
                    //console.log("source index: " + currentSourceIndex + ", row width: " + (self.maxMazeWidth + 1) + ", target index: " + currentTargetIndex + ", data: " + dataToCopy);
                    tempData.set(self.mazeData.subarray(currentSourceIndex, currentSourceIndex + self.maxMazeWidth + 1), currentTargetIndex);
                    currentSourceIndex += self.maxMazeWidth + 1;
                    currentTargetIndex += newMazeWidth + 1;
                }
            }
            self.maxMazeWidth = newMazeWidth;
            self.maxMazeHeight = newMazeHeight;
            self.mazeData = tempData;
            //self.spitBuffer();
        }
    };
    
    self.spitBuffer = function() {
        if (self.mazeData == null) {
            console.log("Uninitialzed buffer!");
            return;
        }
        var rawData = "";
        for (var count = 0; count < (self.maxMazeWidth+1) * (self.maxMazeHeight+1); ++count) {
            rawData += self.mazeData[count];
        }
        console.log("Raw data:");
        console.log(rawData);
        for (var row=-1*self.maxMazeHeight/2; row<=self.maxMazeHeight/2; ++row) {
            var singleRow = "";
            for (var col=-1*self.maxMazeWidth/2; col<=self.maxMazeWidth/2; ++col) {
                singleRow += self.mazeData[self.getBufferIndex(row,col)];
            }
            console.log(singleRow);
        }
    }

    self.getBufferIndex = function(row, col) {

        // Given a row and column index, calculate the corresponding index in the data buffer containing the data byte
        // representing that row and column.

        // (0,0) is in the CENTER of the maze represented by the data buffer (even if the ACTUAL maze has (0,0) at the upper-left)

        // The dimensions of the maze represented by the data structure (which can be larger than the actual maze dimensions)
        // are (maxMazeHeight+1, maxMazeWidth+1) - we add one to each dimension so that the 0 can be precisely at the center,
        // with maxMazeHeight/2 and maxMazeWidth/2 squares extending in both directions from the center

        // The very middle index of the BUFFER is given by the following formula
        var zeroPt = ((self.maxMazeWidth + 1) * (self.maxMazeHeight + 1) - 1) / 2;

        // For every row below or above 0, subtract or add a full width.
        // ('row' can be negative because (0,0) represents the center of the maze)
        var rowPt = zeroPt + row * (self.maxMazeWidth + 1);

        // For every col below or above 0, subtract or add that many columns
        // ('col' can be negative because (0,0) represents the center of the maze)
        var rowColPt = rowPt + col;

        return rowColPt;
    };

    // Initialize the buffer for the default (starting) maximum maze dimensions.
    self.expandBufferIfNecessary({"row" : self.maxMazeHeight / 2 + 1, "col" : self.maxMazeWidth / 2 + 1});

}
