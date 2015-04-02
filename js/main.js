window.onload = function() {    
    "use strict";
    var game = new Phaser.Game(
                                500, 500,           // Width, height of game in px
                                Phaser.AUTO,        // Graphic rendering
                                'game',     
                                { preload: preload, // Preload function
                                  create: create,   // Creation function
                                  update: update }  // Update function
                               );

    var cursors;
    
    var numGroups = 4;
    var green; var yellow; var blue; var red;
    var groups = [  // each color has its own group, accessible with GROUP - other data is the current group state, images, and members
                  green = {GROUP: 0, STATE: 0, NAME: "GREEN", IMAGES: ['green', 'green_select', 'green_finalSTATE'], MEMBERS: []},
                  yellow = {GROUP: 0, STATE: 0, NAME: "YELLOW", IMAGES: ['yellow', 'yellow_select', 'yellow_finalSTATE'], MEMBERS: []}, 
                  blue = {GROUP: 0, STATE: 0, NAME: "BLUE", IMAGES: ['blue', 'blue_select', 'blue_finalSTATE'], MEMBERS: []}, 
                  red = {GROUP: 0, STATE: 0, NAME: "RED", IMAGES: ['red', 'red_select', 'red_finalSTATE'], MEMBERS: []}
                  ];

    
    function preload(){
        game.load.image('green', 'assets/img/green.png');
        game.load.image('yellow', 'assets/img/yellow.png');
        game.load.image('blue', 'assets/img/blue.png');
        game.load.image('red', 'assets/img/red.png');
        game.load.image('green_select', 'assets/img/green_select.png');
        game.load.image('yellow_select', 'assets/img/yellow_select.png');
        game.load.image('blue_select', 'assets/img/blue_select.png');
        game.load.image('red_select', 'assets/img/red_select.png');
        game.load.image('green_finalSTATE', 'assets/img/green_finalSTATE.png');
        game.load.image('yellow_finalSTATE', 'assets/img/yellow_finalSTATE.png');
        game.load.image('blue_finalSTATE', 'assets/img/blue_finalSTATE.png');
        game.load.image('red_finalSTATE', 'assets/img/red_finalSTATE.png');
    };
    
    function create(){
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        game.stage.backgroundColor = '#F8F8F8';
        
        cursors = game.input.keyboard.createCursorKeys();
        
        setCircles();
    };

    function update(){
    };
    
    function setCircles(){
        var dimension = 500/numGroups;
        var imgWidth = 50;
        var buffer = 10;
        var colPos = 1;
        var rowPos = 1;
        
        var i;
        for (i = 0; i < numGroups; i++){
            // iterate through groups to create a group for each color
            groups[i].GROUP = game.add.group();
            groups[i].GROUP.enableBody = true;
            
            var j;
            for (j = 0; j < numGroups; j++){
                // create all the circles belonging to the group
                var circle = groups[i].GROUP.create(
                                                      dimension*colPos - (imgWidth + buffer), // get the new circle position
                                                      dimension*rowPos - (imgWidth + buffer), 
                                                      groups[i].IMAGES[groups[i].STATE] // get the image, corresponding to the state (starting state = 0)
                                                      );
                circle.anchor.set(0.5);
                circle.body.immovable = true;
                circle.body.moves = false;
                circle.inputEnabled = true;
                circle.events.onInputDown.add(handle, this);
                circle.name = i.toString();  // use inherent Sprite name property to track GROUP INDEX of member: member.GROUP
                circle.health = groups[i].STATE;  // use inherent Sprite health property to track STATE of member: member.STATE
                groups[i].MEMBERS.push(circle);
                rowPos++;
            }
            colPos++;
            rowPos = 1;
        }
    };
    
    function handle(circle, pointer){
        var groupIndex = parseInt(circle.name);
    
        // adjust circle.STATE, group.STATE
        (circle.health === 0) ? circle.health++ : circle.health--;        
        (circle.health === 0) ? groups[groupIndex].STATE-- : groups[groupIndex].STATE++;
        
        if (groups[groupIndex].STATE === numGroups){
            // check if a whole column is selected
            groups[groupIndex].MEMBERS.forEach(
                function(member){ 
                    member.inputEnabled = false; 
                    member.health = 2;
                    member.loadTexture(groups[groupIndex].IMAGES[member.health]);
                }, this
            );
        }
        
        if (circle.health > 0){
            // now check if a whole row is selected
            var allIndexes = [0, 1, 2, 3];
            allIndexes.splice(groupIndex, 1); // find all adjacent columns
            
            var rowSelected = false; // bool to indicate if the entire row is selected
            var rowPos = 0;
            for (var i = 0; i < groups[groupIndex].MEMBERS.length; i++){
                // get the row position
                if (groups[groupIndex].MEMBERS[i] == circle) { rowPos = i; }
            }
        
            for (var i = 0; i < allIndexes.length; i++){
                // check if all other columns in the row are selected
                if (groups[allIndexes[i]].MEMBERS[rowPos].health > 0){ rowSelected = true; }
                else { rowSelected = false; break; }
            }
            if (rowSelected){
                // if all other columns in the row are selected, mark off the row
                circle.inputEnabled = false; 
                circle.health = 2;
                circle.loadTexture(groups[groupIndex].IMAGES[circle.health]);
                for (var i = 0; i < allIndexes.length; i++){
                    groups[allIndexes[i]].MEMBERS[rowPos].inputEnabled = false; 
                    groups[allIndexes[i]].MEMBERS[rowPos].health = 2;
                    groups[allIndexes[i]].MEMBERS[rowPos].loadTexture(groups[groupIndex].IMAGES[circle.health]);
                }
            }
        }
        
        //console.log(groups[groupIndex].NAME, " ", groups[groupIndex].STATE);
        circle.loadTexture(groups[groupIndex].IMAGES[circle.health]);
    };
};
