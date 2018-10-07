var rpsGame = 
{
    players: null,
    currentPlayer: null,
    get currentPlayerKey() { if(this.currentPlayer === null) return null; else return this.currentPlayer.substring(0, this.currentPlayer.indexOf("/")); },
    get areYouInTheGame() {
        if(this.currentPlayer === null) return false;
        else if(this.players === null) return false;
        else 
        {
            var player1 = "player1/" + this.players.player1.name;
            var player2 = "player2/" + this.players.player2.name;
            if(this.currentPlayer === player1) return true;
            else if(this.currentPlayer === player2) return true;
            else return false;
        }
    },
    init: function()
    {
        this.currentPlayer = localStorage.getItem("rpsGamePlayer");
        console.log(this.currentPlayer);
        palyers = firebase.database().ref("players/");
        palyers.on("value", this.playersChanged);


        $("#join-game").on("click", function()
        { 
            var modal = '<div id="join-game-modal" class="container-fluid">\
                    <div class="row justify-content-sm-center">\
                        <div class="col-12 col-sm-8 col-md-4">\
                            <form id="join-game-modal-form">\
                                <div class="form-group">\
                                    <input type="input" class="form-control" id="join-game-input" aria-describedby="emailHelp" placeholder="Type in your name">\
                                </div>\
                                <button type="submit" class="btn btn-primary" id="join-game-submit">Submit</button>\
                            </form>\
                        </div>\
                    </div>\
                </div>';

            $(modal).appendTo("body");
            $("#join-game-submit").on("click", function(event) 
            {
                event.preventDefault();
                var name = $("#join-game-input").val().trim();
                rpsGame.joinTheGame(name);
                $("#join-game-modal").remove();
            })
        });
    },
    joinTheGame(username)
    {
        var player = null;
        if(rpsGame.players.player1.available)
        {
            player = firebase.database().ref("players/player1/");
        }
        else
        {
            player = firebase.database().ref("players/player2/");
        }        
        this.currentPlayer = player.key + "/" + username;
        player.set({ 
            name: username,
            wins: 0,
            lose: 0,
            currentPlay: null,
            available: false
        });
        localStorage.setItem("rpsGamePlayer", this.currentPlayer);
    },
    playersChanged: function(snapshot)
    {
        rpsGame.players = snapshot.val();
        console.log(rpsGame.players);

        if(rpsGame.areYouInTheGame)
        {
            console.log("you are in the game");
        }
        else { console.log("no current player"); }
    },
    leaveTheGame: function()
    {
        localStorage.removeItem("rpsGamePlayer");
        player = firebase.database().ref("players/" + this.currentPlayerKey);
        this.currentPlayer = null;
        player.set({ available: true });
    }

};