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
     * My approach is ...
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