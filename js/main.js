var rpsGame = 
{
    players: [],
    currentPlayer: null,
    secondaryPlayer: null,
    get arePlayersAvailable() {
        if(this.players.length < 2) return true;
        else return false;
    },
    get currentPlayerIndex()
    {
        return this.getPlayerIndex(this.currentPlayer);
    },
    get secondaryPlayerIndex()
    {
        return this.getPlayerIndex(this.secondaryPlayer);
    },
    getPlayerIndex: function(playerId)
    {
        return rpsGame.players.findIndex(i => i.id === playerId);
    },
    init: function()
    {
        // initialize database event handlers ----------------------------------------
        var palyers = firebase.database().ref("players/");
        palyers.on("child_added", this.playerJoined);

        var palyers = firebase.database().ref("players/");
        palyers.on("child_removed", this.playerLeft);

        var palyers = firebase.database().ref("players/");
        palyers.on("child_changed", this.playerChanged);

        // show jumbotron, modify depending player availability -----------------------
        $("#players-area").hide();
        this.toggleWelcomeForm();
        this.toggleSecondaryPlayer(false);

        // suscrive page closing avent ------------------------------------------------
        $(window).on("beforeunload", function() { rpsGame.leaveTheGame(true); });
        $("#exit").on("click", function() { rpsGame.leaveTheGame(false); });

        // play choises click event ---------------------------------------------------
        $("#play-choises>button").on("click", this.playClick);

        // suscrive join-game-submit click event --------------------------------------
        $("#join-game-submit").on("click", function(event) 
        {
            event.preventDefault();
            var name = $("#join-game-input").val().trim();
            $("#join-game-input").val("");
            if(name === "" || name === null) return;

            rpsGame.joinTheGame(name);
        });
    },
    joinTheGame(username)
    {
        if(rpsGame.arePlayersAvailable && rpsGame.currentPlayer === null)
        {
            var player = firebase.database().ref("players/").push();
            rpsGame.currentPlayer = player.key;
            player.set({
                name: username,
                wins: 0,
                lose: 0,
                id: player.key,
                currentPlay: "n"
            });

            firebase.database().ref("players/" + player.key + "/currentPlay").on("value", rpsGame.playerPlayChanged)

            $("#welcome").hide();
            $("#players-area").show();
        }
        
    },
    leaveTheGame: async function(isClosing)
    {
        if(isClosing) firebase.database().ref("players/").off();

        if(this.secondaryPlayer !== null) firebase.database().ref("players/" + this.secondaryPlayer + "/currentPlay").set("n");

        if(this.currentPlayer !== null)
        {
            var removed = await firebase.database().ref("players/" + this.currentPlayer).remove();
            
            this.currentPlayer = null;
            $("#players-area").hide();
            $("#welcome").show();
            console.log(removed);
        }
    },
    playerChanged: function(snapshot)
    {
        // save the changes --------------------------------------------------------
        var i = rpsGame.getPlayerIndex(snapshot.key);
        rpsGame.players[i] = snapshot.val();
        console.log("Player Changed");

        // print the changes on the screen ------------------------------------------
        var player = "secondary";
        if(rpsGame.players[i].id === rpsGame.currentPlayer) player = "primary";

        rpsGame.printPlayerChanges(i,player);

        // check if players had their play loked ------------------------------------
        rpsGame.computePlay();
    },
    playerJoined: function(snapshot)
    {
        // Push the new player in ---------------------------------------------------
        rpsGame.players.push(snapshot.val());
        console.log("Player Joined");
        
        // print the changes on the screen ------------------------------------------
        var i = rpsGame.getPlayerIndex(snapshot.key);
        var player = "secondary";
        if(rpsGame.players[i].id === rpsGame.currentPlayer) player = "primary";
        else
        {
            rpsGame.toggleSecondaryPlayer(true);
            rpsGame.secondaryPlayer = rpsGame.players[i].id;
        }
        rpsGame.printPlayerChanges(i,player);
        
        // toggle screen if the current player joined --------------------------------
        if(rpsGame.currentPlayer !== null) return;

        rpsGame.toggleWelcomeForm();
    },
    playerLeft: function(snapshot)
    {
        // remove the player ---------------------------------------------------------
        var i = rpsGame.getPlayerIndex(snapshot.key);
        rpsGame.players.splice(i, 1);
        console.log("Player Left");

        // print the changes on the screen -------------------------------------------
        if(snapshot.key !== rpsGame.currentPlayer)
        {
            rpsGame.toggleSecondaryPlayer(false);
            rpsGame.secondaryPlayer = null;
        }
        
        // toggle screen if current player left ---------------------------------------
        if(rpsGame.currentPlayer !== null) return;

        rpsGame.toggleWelcomeForm();
    },
    playerPlayChanged: function(snapshot)
    {
        console.log("player made a play");

        if(snapshot.val() === "n")
        {
            var choises = $("#play-choises>button");
            choises.removeClass("btn-success");
            choises.addClass("btn-dark");

            if(rpsGame.secondaryPlayer !== null)  choises.removeAttr("disabled");
        }
    },
    toggleWelcomeForm: function()
    {
        if(!rpsGame.arePlayersAvailable)
        {
            $("#join-game-form").hide();
        }
        else
        {
            $("#join-game-form").show();
        }
    },
    printPlayerChanges: function(i, playerChanged)
    {
        $("#player-" + playerChanged + "-name").text(this.players[i].name);
        $("#player-" + playerChanged + "-wins").text(this.players[i].wins);
        $("#player-" + playerChanged + "-losses").text(this.players[i].lose);
    },
    toggleSecondaryPlayer: function(show)
    {
        if(show)
        {
            $("#waiting-player-connection").hide();
            $("#player-secondary-name").show();
            $("#player-secondary-wins-p").show();
            $("#player-secondary-losses-p").show();
            $("#play-choises>button").removeAttr("disabled");
        }
        else
        {
            $("#waiting-player-connection").show();
            $("#player-secondary-name").hide();
            $("#player-secondary-wins-p").hide();
            $("#player-secondary-losses-p").hide();
            $("#play-choises>button").attr("disabled", "disabled");
        }
    },
    playClick: function()
    {
        var clickedObject = $(this);
        clickedObject.removeClass("btn-dark");
        clickedObject.addClass("btn-success");

        $("#play-choises>button").attr("disabled", "disabled");
        
        firebase.database().ref("players/" + rpsGame.currentPlayer + "/currentPlay").set(clickedObject.attr("data-value"));
    },
    computePlay: function()
    {
        if(this.currentPlayer === null && this.secondaryPlayer === null) return;
        
        var current = this.players[this.currentPlayerIndex].currentPlay;
        var secondary = this.players[this.secondaryPlayerIndex].currentPlay;

        if(current === "n" || secondary === "n") return
        else
        {
            console.log("players are loked");
        }

    }
};