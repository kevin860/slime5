/**
 * @copyright Created by Kevin Campbell based on code from Slime Volleyball 2 Player from Quin Pendragon
 *
 */
(function(window, document){

    /* For debugging */
    /**@const*/ var SHOW_RECT=false;

    /**@const*/ var BALL_RADIUS = 25;
    /**@const*/ var PLAYER_RADIUS = 50;
    /**@const*/ var FUDGE = 5;
    /**@const*/ var TIMING_MULTIPLIER = 1000/60/20;

    /**@const*/ var SCORING_RUN_FOR_SUPER = 3;

    /**@const*/ var SLIME_COLORS = ["red", "green", "yellow", "white", "black"];
    /**@const*/ var SLIME_NAMES = ["Big Red Slime ", "Magic Green Slime ", "Golden Boy ", "The Great White Slime ", "The Grass Tree\251 "];
    /**@const*/ var BALL_COLOR = "yellow";
    /**@const*/ var COURT_COLOR = "grey";
    /**@const*/ var NET_COLOR = "white";

    /* Virtual width/height */
    /**@const*/ var WIDTH = 1000;
    /**@const*/ var HEIGHT = 1000;

    /**@const*/ var LEFT = 37;
    /**@const*/ var KEYJ = 74;
    /**@const*/ var RIGHT = 39;
    /**@const*/ var KEYL = 76;
    /**@const*/ var DOWN = 40;
    /**@const*/ var KEYK = 75;
    /**@const*/ var UP = 38;
    /**@const*/ var KEYI = 73;

    /**@const*/ var KEYA = 65;
    /**@const*/ var KEYD = 68;
    /**@const*/ var KEYS = 83;
    /**@const*/ var KEYW = 87;

    /**
     * A player (slime)
     * @param color
     * @constructor
     */
    function Player(color, name)
    {
        this.color = color;
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.super = false;
        this.radius = PLAYER_RADIUS;
        this.diameter = this.radius * 2;

        this.setRadius = function(radius)
        {
            this.radius = radius;
            this.diameter = radius * 2;
        };

        /**
         * Draw the player on the screen
         * @param canvas HTMLCanvasElement
         */
        this.draw = function(canvas)
        {
            var xPix = this.x * canvas.width/WIDTH;
            var yPix = ((4 * HEIGHT / 5) - this.y) * canvas.height/HEIGHT;
            var rPix = this.radius * canvas.width/WIDTH;

            var c = canvas.getContext('2d');
            if (!this.super)
            {
                c.fillStyle = this.color;
            }
            else
            {
                c.fillStyle = SLIME_COLORS[Math.floor(Math.random() * SLIME_COLORS.length)];
            }
            c.beginPath();
            c.arc(xPix, yPix, rPix, Math.PI, 0);
            c.fill();
        };

        /**
         * Clear the player on the screen
         * @param canvas HTMLCanvasElement
         */
        this.clear = function(canvas)
        {
            var rPix = this.radius * canvas.width/WIDTH;
            var xPix = (this.x - this.radius) * canvas.width/WIDTH - 1;
            var yPix = ((4 * HEIGHT / 5) - this.y) * canvas.height/HEIGHT - rPix - 1;
            var wPix = this.diameter * canvas.width/WIDTH + 2;
            var hPix = this.radius * canvas.width/WIDTH + (this.y > 0 ? 2 : 1);

            var c = canvas.getContext('2d');
            c.beginPath();
            c.clearRect(xPix, yPix, wPix, hPix);

            if (SHOW_RECT)
            {
                c.strokeStyle = "cyan";
                c.strokeRect(xPix, yPix, wPix, hPix);
            }
        };
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
         * @param canvas HTMLCanvasElement
         */
        this.draw = function(canvas)
        {
            var ballRadPix = (BALL_RADIUS + FUDGE) * canvas.height/HEIGHT;
            var ballXPix = this.x * canvas.width/WIDTH;
            var ballYPix = ((4 * HEIGHT / 5) - this.y) * canvas.height/HEIGHT;

            var c = canvas.getContext('2d');
            c.beginPath();
            c.fillStyle = BALL_COLOR;
            c.arc(ballXPix, ballYPix, ballRadPix, 0, Math.PI * 2);
            c.fill();
        };

        /**
         * Clear the ball on the screen
         * @param canvas HTMLCanvasElement
         */
        this.clear = function(canvas)
        {
            var ballRadPix = (BALL_RADIUS + FUDGE) * canvas.height/HEIGHT;
            var ballDPix = ballRadPix * 2 + 2;
            var ballXPix = this.x * canvas.width/WIDTH - ballRadPix - 1;
            var ballYPix = ((4 * HEIGHT / 5) - this.y) * canvas.height/HEIGHT - ballRadPix - 1;

            var c = canvas.getContext('2d');
            c.beginPath();
            c.clearRect(ballXPix, ballYPix, ballDPix, ballDPix);

            if (SHOW_RECT)
            {
                c.strokeStyle = "cyan";
                c.strokeRect(ballXPix, ballYPix, ballDPix, ballDPix);
            }
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
        this.canvas = canvas;

        this.height = canvas.height;
        this.width = canvas.width;
        this.commentary = "Click the mouse to play...";

        this.courtHeight = this.height / 5;

        this.player1Character = 0;
        this.player2Character = 1;
        this.player1 = new Player(SLIME_COLORS[this.player1Character], SLIME_NAMES[this.player1Character]);
        this.player2 = new Player(SLIME_COLORS[this.player2Character], SLIME_NAMES[this.player2Character]);
        this.ball = new Ball();

        var _game = this;

        /**
         * Draw the court
         */
        function drawCourt()
        {
            var c = _game.canvas.getContext('2d');
            c.fillStyle = COURT_COLOR;
            c.beginPath();
            c.rect(0, _game.height - _game.courtHeight, _game.width, _game.courtHeight);
            c.fill();
        }

        function drawNet()
        {
            var c = _game.canvas.getContext('2d');
            c.fillStyle = NET_COLOR;
            c.beginPath();
            c.rect(_game.width / 2 - 2, (7 * _game.height) / 10, 4, _game.height / 10 + 5);
            c.fill();
        }

        function drawPrompt(promptMsg, i)
        {
            var c = _game.canvas.getContext('2d');
            if (promptMsg.length > 0)
            {
                c.font = '14px Helvetica';
                c.fillStyle = "lightgrey";
                c.textAlign = 'center';
                c.fillText(promptMsg, _game.canvas.width / 2, (_game.canvas.height * 4) / 5 + 20 * (i + 1) + 10);
            }
            else
            {
                drawCourt();
                drawNet();
            }

        }

        function drawScores(nScore)
        {
            var c = _game.canvas.getContext('2d');
            var k = _game.canvas.height / 40;
            c.clearRect(0, 0, _game.canvas.width, k * 2 + 22);

            var l, i;
            for(l = 0; l < nScore; l++)
            {
                i = ((l + 1) * _game.canvas.width) / 24;
                c.beginPath();
                c.fillStyle = _game.player1.color;
                c.strokeStyle = 'white';
                c.arc(i, 20, k, 0, Math.PI * 2);
                c.fill();
                c.stroke();
            }

            for(l = 0; l < 10 - nScore; l++)
            {
                i = _game.canvas.width - (((l + 1) * _game.canvas.width) / 24);
                c.beginPath();
                c.fillStyle = _game.player2.color;
                c.strokeStyle = 'white';
                c.arc(i, 20, k, 0, Math.PI * 2);
                c.fill();
                c.stroke();
            }
        }

        function formatTime(l)
        {
            var l1 = Math.floor((l / 10) % 100);
            var l2 = Math.floor((l / 1000) % 60);
            var l3 = Math.floor((l / 60000) % 60);
            var l4 = Math.floor(l / 0x36ee80);
            var s = "";
            if (l4 < 10)
            {
                s += "0";
            }
            s += l4;
            s += ":";
            if (l3 < 10)
            {
                s += "0";
            }
            s += l3;
            s += ":";
            if (l2 < 10)
            {
                s += "0";
            }
            s += l2;
            s += ":";
            if (l1 < 10)
            {
                s += "0";
            }
            s += l1;
            return s;
        }

        function drawStatus(nPointsScored, matchTime)
        {
            var s = "Points: " + nPointsScored + "   Elapsed: " + formatTime(matchTime);

            var c = _game.canvas.getContext('2d');
            var i = _game.canvas.height / 20;
            c.clearRect((_game.canvas.width / 2) - 115, 0, 230, 30);

            c.font = '12px Helvetica';
            c.fillStyle = 'white';
            c.textAlign = 'center';

            c.fillText(s, _game.canvas.width / 2, i);
        }

        function resetPlayers()
        {
            _game.player1.x = 200;
            _game.player1.y = 0;
            _game.player1.vX = 0;
            _game.player1.vY = 0;

            _game.player2.x = 800;
            _game.player2.y = 0;
            _game.player2.vX = 0;
            _game.player2.vY = 0;
        }

        function resetBall(player2)
        {
            _game.ball.x = player2 ? 800 : 200;
            _game.ball.y = 400;
            _game.ball.vX = 0;
            _game.ball.vY = 0;
        }

        function getCommentary(fP1Touched, fP2Touched, nScore, nPointsScored, scoringRun)
        {
            var promptMsg = _game.ball.x <= 500 ? _game.player2.name : _game.player1.name;
            if(!fP1Touched && !fP2Touched)
            {
                promptMsg = "What can I say?";
            }
            else if ((scoringRun < 0 ? - scoringRun:scoringRun) == SCORING_RUN_FOR_SUPER)
            {
                promptMsg += "is on fire!";
            }
            else if(_game.ball.x > 500 && fP1Touched && !fP2Touched || _game.ball.x <= 500 && !fP1Touched && fP2Touched)
            {
                promptMsg += "aces the serve!";
            }
            else if(_game.ball.x > 500 && !fP1Touched && fP2Touched || _game.ball.x <= 500 && fP1Touched && !fP2Touched)
            {
                promptMsg += "dies laughing! :P";
            }
            else
            {
                switch (nScore)
                {
                    case 0: // '\0'
                    case 10: // '\n'
                        if (nPointsScored == 5)
                        {
                            promptMsg += "Wins with a QUICK FIVE!!!";
                        }
                        else if (scoringRun == 8)
                        {
                            promptMsg += "Wins with a BIG NINE!!!";
                        }
                        else
                        {
                            promptMsg += "Wins!!!";
                        }
                        break;

                    case 4: // '\004'
                        promptMsg += _game.ball.x >= 500 ? "Scores!" : "takes the lead!!";
                        break;

                    case 6: // '\006'
                        promptMsg += _game.ball.x <= 500 ? "Scores!" : "takes the lead!!";
                        break;

                    case 5: // '\005'
                        promptMsg += "Equalizes!";
                        break;

                    default:
                        promptMsg += "Scores!";
                        break;
                }
            }
            return promptMsg;
        }

        function clear()
        {
            _game.player1.clear(_game.canvas);
            _game.player2.clear(_game.canvas);
            _game.ball.clear(_game.canvas);
        }


        function draw()
        {
            _game.player1.draw(_game.canvas);
            _game.player2.draw(_game.canvas);
            _game.ball.draw(_game.canvas);
        }


        function processKeyDown(e)
        {
            switch(e.keyCode)
            {
                default:
                    break;

                case KEYA:
                    _game.player1.vX = _game.player1.super ? -16 : -8;
                    break;

                case KEYD:
                    _game.player1.vX = _game.player1.super ? 16 : 8;
                    break;

                case KEYW:
                    if(_game.player1.y == 0)
                    {
                        _game.player1.vY = _game.player1.super ? 45 : 31;
                    }
                    break;

                case LEFT:
                case KEYJ:
                    _game.player2.vX = _game.player2.super ? -16 : -8;
                    break;

                case RIGHT:
                case KEYL:
                    _game.player2.vX = _game.player2.super ? 16 : 8;
                    break;

                case UP:
                case KEYI:
                    if(_game.player2.y == 0)
                    {
                        _game.player2.vY = _game.player2.super ? 45 : 31;
                    }
                    break;

                //case 'S':
                //case 's':
                //    if(!fCanChangeCol)
                //        break label0;
                //    do
                //        p1Col = p1Col != 4 ? p1Col + 1 : 0;
                //    while(p1Col == p2Col);
                //    drawScores();
                //    break label0;
                //
                //case Event.DOWN:
                //case 'K':
                //case 'k':
                //    if(fCanChangeCol)
                //    {
                //        do
                //            p2Col = p2Col != 4 ? p2Col + 1 : 0;
                //        while(p2Col == p1Col);
                //        drawScores();
                //        break label0;
                //    }
                //// fall through
                //
                //case ' ':
                //    mousePressed = true;
                //    break;
            }
        }

        function processKeyUp(e)
        {
            switch(e.keyCode)
            {
                default:
                    break;

                case KEYA:
                    if(_game.player1.vX < 0)
                    {
                        _game.player1.vX = 0;
                    }
                    break;

                case KEYD:
                    if(_game.player1.vX > 0)
                    {
                        _game.player1.vX = 0;
                    }
                    break;

                case LEFT:
                case KEYJ:
                    if(_game.player2.vX < 0)
                    {
                        _game.player2.vX = 0;
                    }
                    break;

                case RIGHT:
                case KEYL:
                    if(_game.player2.vX > 0)
                    {
                        _game.player2.vX = 0;
                    }
                    break;
            }
        }



        /*
         * Game start!
         */

        /* Add event handlers */
        document.addEventListener("keydown", processKeyDown, true);
        document.addEventListener("keyup", processKeyUp, true);

        startMatch();

        /*
         * Main game
         */
        function startMatch()
        {
            var replayPos = 0;
            var replayStart = 0;

            /* Reset the slimes! */
            resetPlayers();

            /* Reset the ball */
            resetBall();

            var scoringRun = 0;
            var fP1Touched = false;
            var fP2Touched = false;
            var nPointsScored = 0;
            var startTime = null;
            var nScore = 5;
            var fInPlay = false;

            var matchTime = 0;

            startRally(false);

            function startRally(player2Serves)
            {
                drawPrompt("", 1);
                clear();
                drawCourt();
                drawNet();
                drawScores(nScore);
                resetPlayers();
                resetBall(player2Serves);
                replayStart = false;
                replayPos = 0;
                fP1Touched = false;
                fP2Touched = false;
                startTime = new Date().getTime();
                updateRally();
            }

            function updateRally()
            {
                matchTime += new Date().getTime() - startTime;
                startTime = new Date().getTime();
                if(_game.ball.y < 35)
                {
                    var scoreTime = new Date().getTime();
                    nPointsScored++;
                    var player2Scores = _game.ball.x <= 500;
                    nScore += player2Scores ? -1 : 1;
                    if ((_game.ball.x <= 500) && (scoringRun >= 0))
                    {
                        scoringRun++;
                    }
                    else if ((_game.ball.x > 500) && (scoringRun <= 0))
                    {
                        scoringRun--;
                    }
                    else if ((_game.ball.x <= 500) && (scoringRun <= 0))
                    {
                        scoringRun = 1;
                    }
                    else if ((_game.ball.x > 500) && (scoringRun >= 0))
                    {
                        scoringRun = -1;
                    }
                    // Anyone super slime?
                    if (scoringRun <= -SCORING_RUN_FOR_SUPER)
                    {
                        _game.player1.super = true;
                        _game.player2.super = false;
                    }
                    else if (scoringRun >= SCORING_RUN_FOR_SUPER)
                    {
                        _game.player1.super = false;
                        _game.player2.super = true;
                    }
                    else
                    {
                        _game.player1.super = false;
                        _game.player2.super = false;
                    }
                    drawPrompt(getCommentary(fP1Touched, fP2Touched, nScore, nPointsScored, scoringRun), 0);

                    var flag = nScore != 0 && nScore != 10;
                    if(flag)
                    {
                        drawPrompt("Click mouse for replay...", 1);

                        _game.mousePressed = false;
                        setTimeout(function(){
                            if (_game.mousePressed)
                            {
                                //TODO playReplay
                                _game.mousePressed = false;
                            }
                            else
                            {
                                startTime += new Date().getTime() - scoreTime;
                                startRally(player2Scores);
                            }
                        }, 2500);

                    }
                }
                else
                {
                    clear();
                    moveSlimers();
                    moveBall();
                    draw();
                    drawStatus(nPointsScored, matchTime);
                    requestAnimationFrame(updateRally);
                    //setTimeout(updateRally, 20);
                }
            }

            function moveSlimers()
            {
                _game.player1.x += _game.player1.vX;
                if (_game.player1.x < 50)
                {
                    _game.player1.x = 50;
                }
                if (_game.player1.x > 445)
                {
                    _game.player1.x = 445;
                }
                if (_game.player1.vY != 0)
                {
                    _game.player1.vY -= _game.player1.super ? 4 : 2;
                    _game.player1.y += _game.player1.vY * TIMING_MULTIPLIER;
                    if (_game.player1.y < 0)
                    {
                        _game.player1.y = 0;
                        _game.player1.vY = 0;
                    }
                }
                _game.player2.x += _game.player2.vX;
                if (_game.player2.x > 950)
                {
                    _game.player2.x = 950;
                }
                if (_game.player2.x < 555)
                {
                    _game.player2.x = 555;
                }
                if (_game.player2.vY != 0)
                {
                    _game.player2.vY -= _game.player2.super ? 4 : 2;
                    _game.player2.y += _game.player2.vY * TIMING_MULTIPLIER;
                    if (_game.player2.y < 0)
                    {
                        _game.player2.y = 0;
                        _game.player2.vY = 0;
                    }
                }
            }




            function moveBall()
            {
                var maxXV = 15; // was 15
                var maxYV = 22; // was 22

                // move the ball
                _game.ball.y += --_game.ball.vY * TIMING_MULTIPLIER;
                _game.ball.x += _game.ball.vX * TIMING_MULTIPLIER;

                // collision detection
                var dx = 2 * (_game.ball.x - _game.player1.x);
                var dy = _game.ball.y - _game.player1.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var dvx = _game.ball.vX - _game.player1.vX;
                var dvy = _game.ball.vY - _game.player1.vY;
                if (dy > 0 && dist < _game.player1.diameter + BALL_RADIUS && dist > FUDGE)
                {
                    /* i have nfi what this is. i'm supposed to have done engineering
                     dynamics and i can't remember any equation with x*x'+y*y' in it...
                     it was a long time ago! - wedgey */
                    var something = (dx * dvx + dy * dvy) / dist;
                    _game.ball.x = _game.player1.x + (_game.player1.diameter + BALL_RADIUS) / 2 * dx / dist;
                    _game.ball.y = _game.player1.y + (_game.player1.diameter + BALL_RADIUS) * dy / dist;
                    // cap the velocity
                    if (something <= 0)
                    {
                        _game.ball.vX += _game.player1.vX - 2 * dx * something / dist;
                        if (_game.ball.vX < -maxXV)
                        {
                            _game.ball.vX = -maxXV;
                        }
                        if (_game.ball.vX > maxXV)
                        {
                            _game.ball.vX = maxXV;
                        }
                        _game.ball.vY += _game.player1.vY - 2 * dy * something / dist;
                        if (_game.ball.vY < -maxYV)
                        {
                            _game.ball.vY = -maxYV;
                        }
                        if (_game.ball.vY > maxYV)
                        {
                            _game.ball.vY = maxYV;
                        }
                    }
                    fP1Touched = true;
                }

                // that stuff all over again, but for p2.
                dx = 2 * (_game.ball.x - _game.player2.x);
                dy = _game.ball.y - _game.player2.y;
                dist = Math.sqrt(dx * dx + dy * dy);
                dvx = _game.ball.vX - _game.player2.vX;
                dvy = _game.ball.vY - _game.player2.vY;
                if (dy > 0 && dist < _game.player2.diameter + BALL_RADIUS && dist > FUDGE)
                {
                    var something = (dx * dvx + dy * dvy) / dist;
                    _game.ball.x = _game.player2.x + (_game.player2.diameter + BALL_RADIUS) / 2 * dx / dist;
                    _game.ball.y = _game.player2.y + (_game.player2.diameter + BALL_RADIUS) * dy / dist;
                    if (something <= 0)
                    {
                        _game.ball.vX += _game.player2.vX - 2 * dx * something / dist;
                        if (_game.ball.vX < -maxXV)
                        {
                            _game.ball.vX = -maxXV;
                        }
                        if (_game.ball.vX > maxXV)
                        {
                            _game.ball.vX = maxXV;
                        }
                        _game.ball.vY += _game.player2.vY - 2 * dy * something / dist;
                        if (_game.ball.vY < -maxYV)
                        {
                            _game.ball.vY = -maxYV;
                        }
                        if (_game.ball.vY > maxYV)
                        {
                            _game.ball.vY = maxYV;
                        }
                    }
                    fP2Touched = true;
                }
                // hits left wall
                if (_game.ball.x < 15)
                {
                    _game.ball.x = 15;
                    _game.ball.vX = -_game.ball.vX;
                }
                // hits right wall
                if (_game.ball.x > 985)
                {
                    _game.ball.x = 985;
                    _game.ball.vX = -_game.ball.vX;
                }
                // hits the post
                if (_game.ball.x > 480 && _game.ball.x < 520 && _game.ball.y < 140)
                {
                    // bounces off top of net
                    if (_game.ball.vY < 0 && _game.ball.y > 130)
                    {
                        _game.ball.vY *= -1;
                        _game.ball.y = 130;
                    }
                    else if (_game.ball.x < 500)
                    { // hits side of net
                        _game.ball.x = 480;
                        _game.ball.vX = _game.ball.vX >= 0 ? -_game.ball.vX : _game.ball.vX;
                    }
                    else
                    {
                        _game.ball.x = 520;
                        _game.ball.vX = _game.ball.vX <= 0 ? -_game.ball.vX : _game.ball.vX;
                    }
                }
            }


        }
    }

    window["Game"]=Game;
})(window, document);