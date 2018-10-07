var rpsGame = 
{
    players: [],
    currentPlayer: null,
    get arePlayersAvailable() {
        if(this.players.length < 2) return true;
        else return false;
    },
    get currentPlayerIndex()
    {
        return this.getPlayerIndex(this.currentPlayer);
    },
    getPlayerIndex: function(playerId)
    {
        return rpsGame.players.findIndex(i => i.id === playerId.key);
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
        $("#join-game-form").hide();

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
                id: player.key
            });

            $("#welcome").hide();
            $("#players-area").show();
        }
        
    },
    leaveTheGame: async function(isClosing)
    {
        if(isClosing) firebase.database().ref("players/").off();

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
        var i = rpsGame.getPlayerIndex(snapshot.key);
        rpsGame.players[i] = snapshot.val();
        console.log(rpsGame.players);
    },
    playerJoined: function(snapshot)
    {
        rpsGame.players.push(snapshot.val());
        console.log(rpsGame.players);

        if(rpsGame.currentPlayer !== null) return;

        rpsGame.toggleWelcomeForm();
    },
    playerLeft: function(snapshot)
    {
        var i = rpsGame.getPlayerIndex(snapshot.key);
        rpsGame.players.splice(i, 1);
        console.log(rpsGame.players);

        if(rpsGame.currentPlayer !== null) return;

        rpsGame.toggleWelcomeForm();
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
    }
};