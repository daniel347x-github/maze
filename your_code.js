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
     * The first concept used in the algorithm is to break loops by replacing one point in each loop
     * with a wall (logically).  This will never close off a route to the exit.
     * (Note that merging paths are effectively loops, and the same reasoning applies.)
     * See comments in the code itself for the simple, slick approach that is used to detect and close loops
     * via local information only.
     *
     * Once loops have logically been eliminated, the entire maze becomes a tree structure,
     * which simplifies the logic.  We use a depth-first approach to walking through the maze;
     * this means that we always choose to move deeper into the tree, before choosing to backtrack.
     * If we reach a dead end, we backtrack to the nearest branch and a simple trick can be used to logically replace
     * the entrance to the dead end with a wall (see comments in the code).
     * We then move down the next untraveled branch (if there is one) or continue backtracking & close off the branch (if not),
     * in iterative fashion.
     *
     * The above approach guarantees that we close off dead-end paths properly and never travel the same path
     * in the same direction, so there is a guaranteed O(n) efficiency to this algorithm.
     * We are also guaranteed to eventually travel all paths, at least one of which will lead to the exit.
     *
     * A couple of comments: The above algorithm is robust against the starting position.
     * The starting position can be anywhere inside of the maze (not just at an edge or corner).
     */

    //TODO: Enter your code here

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

});
