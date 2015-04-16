/**
 * @copyright Created by Kevin Campbell based on code from Slime Volleyball 2 Player from Quin Pendragon
 *
 */
(function(window, document){

    /**@const*/ var BALL_RADIUS = 25;
    /**@const*/ var PLAYER_RADIUS = 50;

    /**@const*/ var SLIME_COLORS = ["red", "green", "yellow", "white", "black"];
    /**@const*/ var BALL_COLOR = "yellow";
    /**@const*/ var BACKGROUND_COLOR = "blue";
    /**@const*/ var COURT_COLOR = "grey";
    /**@const*/ var COURT_HEIGHT = ""

    /**
     * A player (slime)
     * @param color
     * @constructor
     */
    function Player(color)
    {
        this.color = color;
        this.x = 0;
        this.y = 0;
        this.r = PLAYER_RADIUS;

        /**
         * Draw the player on the screen
         * @param c CanvasRenderingContext2D
         */
        this.draw = function(c)
        {
            c.fillStyle = this.color;
            c.beginPath();
            c.arc(this.x, this.y, this.r, Math.PI, Math.PI*2);
            c.fill();
        }
    }

    /**
     * The ball (of type volley)
     * @constructor
     */
    function Ball()
    {
        this.x = 0;
        this.y = 0;
        this.vX = 0;
        this.vY = 0;

        /**
         * Draw the ball on the screen
         * @param c CanvasRenderingContext2D
         */
        this.draw = function(c)
        {
            c.fillStyle = BALL_COLOR;
            c.beginPath();
            c.arc(this.x, this.y, BALL_RADIUS, 0, Math.PI * 2);
            c.fill();
        }
    }

    /**
     * The core game
     *
     * @param canvas HTMLCanvasElement
     * @constructor
     */
    function Game(canvas)
    {
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = canvas.getContext("2d");

        this.height = canvas.height;
        this.width = canvas.width;

        this.courtHeight = this.height / 5;
        this.player1Bounds = {
            left:0,
            right:this.width/2,
            top:this.height,
            bottom:this.height - this.courtHeight
        };
        this.player2Bounds = {
            left:0,
            right:this.width/2,
            top:this.height,
            bottom:this.height - this.courtHeight
        };

        this.player1Score = 0;
        this.player2Score = 0;

        this.player1 = new Player(SLIME_COLORS[0]);
        this.player2 = new Player(SLIME_COLORS[1]);
        this.ball = new Ball();

        var _game = this;


        /**
         * Draw the court
         */
        function drawCourt()
        {
            var c = _game.ctx;
            c.fillStyle = COURT_COLOR;
            c.beginPath();
            c.rect(0, _game.height - _game.courtHeight, _game.width, _game.courtHeight);
            c.fill();
        }

        /**
         *
         * @param slime Player
         * @param bounds Object
         */
        function resetSlime(slime, bounds)
        {
            slime.x = ((bounds.right - bounds.left) / 2) + bounds.left;
            slime.y = bounds.bottom;
        }

        function resetBall()
        {
            _game.ball.x = _game.width / 2;
            _game.ball.y = _game.height / 5;
        }

        /*
         * Game start!
         */
        /* Draw the court */
        drawCourt();

        /* Reset the slimes! */
        resetSlime(this.player1, this.player1Bounds);
        resetSlime(this.player2, this.player2Bounds);

        /* Reset the ball */
        resetBall();


        // Start game drawing thread
        setInterval(function(){
            _game.player1.draw(_game.ctx);
            _game.player2.draw(_game.ctx);
            _game.ball.draw(_game.ctx);
        }, 16.67);
    }

    window["Game"]=Game;
})(window, document);