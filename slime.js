/**
 * @copyright Created by Kevin Campbell based on code from Slime Volleyball 2 Player from Quin Pendragon
 *
 */



/* Virtual width/height */
/**@const*/ var WIDTH = 1000;
/**@const*/ var HEIGHT = 1000;

(function (window, document)
{

    /* For debugging */
    /**@const*/ var SHOW_RECT = false;

    /**@const*/ var SLIME_COLORS = ["red", "green", "yellow", "white", "black", "cyan"];
    /**@const*/ var SLIME_NAMES = ["Big Red Slime ", "Magic Green Slime ", "Golden Boy ", "The Great White Slime ", "The Grass Tree\251 ", "Cyanatron "];
    /**@const*/ var BALL_COLOR = "yellow";
    /**@const*/ var COURT_COLOR = "grey";
    /**@const*/ var NET_COLOR = "white";

    //P1 Keys
    /**@const*/ var KEYA = 65;
    /**@const*/ var KEYD = 68;
    /**@const*/ var KEYS = 83;
    /**@const*/ var KEYW = 87;
    /**@const*/ var KEYX = 88;

    //P2 Keys
    /**@const*/ var LEFT = 37;
    /**@const*/ var KEYJ = 74;
    /**@const*/ var RIGHT = 39;
    /**@const*/ var KEYL = 76;
    /**@const*/ var DOWN = 40;
    /**@const*/ var KEYK = 75;
    /**@const*/ var UP = 38;
    /**@const*/ var KEYI = 73;
    /**@const*/ var KEYM = 77;

    /**@const*/ var VALID_P1_BOOST_KEY_CODES = [KEYA, KEYD, KEYW, KEYS];
    /**@const*/ var VALID_P2_BOOST_KEY_CODES = [LEFT, RIGHT, UP, DOWN, KEYJ, KEYL, KEYI, KEYK];

    /**@const*/ var BOOST_KEY_PRESS_WINDOW_IN_MS = 800;
    /**@const*/ var BOOST_WINDOW = 2;
    /**@const*/ var FUDGE = 5; // 5

    /**@const*/ var REPLAY_BUFFER = 500;

    var ball_radius = 25; // 25
    var slime_radius = 50; // 50
    var timing_multiplier = 1;//(16.67/1000)/(20/1000);//16.67*2060/1(1000/20)*(1000)//1;//1000/60/20; // 1000/60/20
    var battle_mode = true; // false
    var scoring_run_for_super = 3;
    var boost_mode = false;

    /**
     * A player (slime)
     * @param color
     * @constructor
     * @param name
     * @param radius
     * @param name
     * @param radius
     * @param looksRight
     * @param keyCodes
     */
    function Player(color, name, radius, looksRight, keyCodes)
    {
        var _this = this;

        this.color = color;
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.previousX = 0;
        this.previousY = 0;
        this.super = false;
        this.blinkCount = 0;
        this.looksRight = looksRight;

        this.radius = radius;
        this.boostRemaining = 0;
        this.hasBoosted = false;
        this.boostKeyCode = null;
        this.lastKeyPress = null;
        this.secondLastKeyPress = null;

        this.keys = {
            "left": false,
            "right": false,
            "up": false,
            "down": false
        };

        this.boostCodes = {
            "left": [],
            "right": [],
            "up": [],
            "down": []
        };
        for(var i = 0; i < keyCodes.length; i += 4)
        {
            _this.boostCodes["left"].push(keyCodes[i]);
            _this.boostCodes["right"].push(keyCodes[i+1]);
            _this.boostCodes["up"].push(keyCodes[i+2]);
            _this.boostCodes["down"].push(keyCodes[i+3]);
        }


        this.reset = function(xPosition)
        {
            _this.setX(xPosition);
            _this.setY(0);
            _this.vX = 0;
            _this.vY = 0;
            _this.boostRemaining = 0;
            _this.hasBoosted = false;
            _this.boostKeyCode = null;
            _this.lastKeyPress = null;
            _this.secondLastKeyPress = null;
            console.log("RESET");
        };

        this.updateBoost = function(game)
        {
            if(game.boost_mode !== false) {
                return;
            }

            if(_this.boostRemaining > 0 || _this.hasBoosted)
            {
                return;
            }
            else if(_this.lastKeyPress === null || _this.secondLastKeyPress === null)
            {
                return;
            }
            else if(_this.lastKeyPress.start - _this.secondLastKeyPress.start < BOOST_KEY_PRESS_WINDOW_IN_MS)
            {
                if(_this.lastKeyPress.keyCode === _this.secondLastKeyPress.keyCode)
                {
                    _this.boostRemaining = BOOST_WINDOW;
                    _this.hasBoosted = true;
                    _this.boostKeyCode = _this.lastKeyPress.keyCode;
                    _this.lastKeyPress = null;
                    _this.secondLastKeyPress = null;
                    console.log("BOOST");
                }
            }

            if(new Date() - _this.secondLastKeyPress.start > BOOST_KEY_PRESS_WINDOW_IN_MS)
            {
                _this.secondLastKeyPress = null;
            }
            if(new Date() - _this.lastKeyPress.start > BOOST_KEY_PRESS_WINDOW_IN_MS)
            {
                _this.lastKeyPress = null;
            }
        };

        this.updateSpeeds = function()
        {

            if (_this.keys.left)
            {
                _this.vX = _this.super ? -16 : -8;
            }
            else if (_this.keys.right)
            {
                _this.vX = _this.super ? 16 : 8;
            }
            else
            {
                _this.vX = 0;
            }
            // player1 jump
            if (_this.keys.up && _this.y === 0)
            {
                _this.vY = _this.super ? 45 : 31;
            }
        };

        this.getBoostDirection = function()
        {
            if(_this.boostRemaining === 0)
            {
                return '';
            }
            else if(_this.boostCodes.down.indexOf(_this.boostKeyCode) > -1)
            {
                return "down";
            }
            else if(_this.boostCodes.up.indexOf(_this.boostKeyCode) > -1)
            {
                return "up";
            }
            else if(_this.boostCodes.left.indexOf(_this.boostKeyCode) > -1)
            {
                return "left";
            }
            else
            {
                return "right";
            }
        };

        /**
         * Draw the player on the screen
         * @param canvas HTMLCanvasElement
         * @param ball Ball The ball (used to determine pupil location)
         */
        this.draw = function (canvas, ball)
        {
            var xPix = _this.x * canvas.width / WIDTH;
            var yPix = ((4 * HEIGHT / 5) - _this.y) * canvas.height / HEIGHT;
            var rPix = _this.radius * canvas.width / WIDTH;

            var c = canvas.getContext('2d');

            // Draw slimer
            if (!_this.super)
            {
                if (_this.color && this.color.indexOf("img") === 0)
                {
                    c.fillStyle = c.createPattern(rob, 'no-repeat');
                }
                else
                {
                    c.fillStyle = _this.color;
                }
            }
            else
            {
                c.fillStyle = SLIME_COLORS[Math.floor(Math.random() * SLIME_COLORS.length)];
            }
            c.beginPath();
            c.arc(xPix, yPix, rPix, Math.PI, 0);
            c.fill();

            // Whale slimes!
            if (_this.radius === 75)
            {
                c.beginPath();
                var tr = rPix * .65;
                var tw = 10;
                if (_this.looksRight)
                {
                    c.arc(xPix - rPix, yPix - tr, tr, Math.PI / 2, Math.PI);
                    c.arc(xPix - rPix - tr, yPix - tr - tr / 2, tr / 2, Math.PI / 2, Math.PI);
                    c.lineTo(xPix - rPix - tr + tw, yPix - tr - tr / 4);
                    c.lineTo(xPix - rPix, yPix - tr - tr / 2);
                    c.arc(xPix - rPix - tr + tw + tw, yPix - tr - tr / 2, tr / 2, 0, Math.PI / 2);
                    c.arc(xPix - rPix + tw + tw, yPix - tr - tw, tr, Math.PI, Math.PI / 2, true);
                }
                else
                {
                    c.arc(xPix + rPix, yPix - tr, tr, Math.PI / 2, 0, true);
                    c.arc(xPix + rPix + tr, yPix - tr - tr / 2, tr / 2, Math.PI / 2, 0, true);
                    c.lineTo(xPix + rPix + tr - tw, yPix - tr - tr / 4);
                    c.lineTo(xPix + rPix, yPix - tr - tr / 2);
                    c.arc(xPix + rPix + tr - tw - tw, yPix - tr - tr / 2, tr / 2, Math.PI, Math.PI / 2, true);
                    c.arc(xPix + rPix - tw - tw, yPix - tr - tw, tr, 0, Math.PI / 2);
                }
                c.fill();
            }

            // Draw eye unless blinking
            if (_this.blinkCount !== 0)
            {
                _this.blinkCount--;
            }
            else
            {
                // Start a blink?
                if (Math.random() < 0.005)
                {
                    _this.blinkCount = 5 * timing_multiplier;
                }

                // Calculate ball's relative position (used for pupils)
                var ballXPix = ball.x * canvas.width / WIDTH;
                var ballYPix = ball.y * canvas.height / HEIGHT;
                var ballXDistance = xPix - ballXPix;
                var ballYDistance = yPix - ballYPix;
                var ballDistance = Math.floor(Math.sqrt(ballXDistance * ballXDistance + ballYDistance * ballYDistance));

                // Draw eye
                c.fillStyle = _this.super ? "red" : "white";
                var eyeRPix = canvas.width / 100;
                var eyeXPix = xPix;
                if (_this.looksRight)
                {
                    eyeXPix += eyeRPix * 2.5;
                }
                else
                {
                    eyeXPix -= eyeRPix * 2.5;
                }
                var eyeYPix = yPix - eyeRPix * 2.5;
                c.beginPath();
                c.arc(eyeXPix, eyeYPix, eyeRPix, 0, Math.PI * 2);
                c.fill();

                // Draw pupil
                if (ballDistance > 0)
                {
                    c.fillStyle = "black";
                    c.beginPath();
                    var pupilXPix = eyeXPix;
                    var pupilYPix = eyeYPix;
                    if (_this.looksRight)
                    {
                        pupilXPix -= 4 * ballXDistance / ballDistance;
                        pupilYPix -= (4 * ballYDistance) / ballDistance
                    }
                    else
                    {
                        pupilXPix -= 4 * ballXDistance / ballDistance;
                        pupilYPix -= (4 * ballYDistance) / ballDistance;
                    }
                    c.arc(pupilXPix,
                        pupilYPix,
                        eyeRPix / 2, 0, Math.PI * 2
                    );
                    c.fill();
                }
            }
        };

        /**
         * Clear the player on the screen
         * @param canvas HTMLCanvasElement
         */
        this.clear = function (canvas)
        {
            var rPix = Math.max(_this.radius, 50) * canvas.width / WIDTH;
            var xPix = (_this.previousX - Math.max(_this.radius, 50)) * canvas.width / WIDTH - 1;
            var yPix = ((4 * HEIGHT / 5) - _this.previousY) * canvas.height / HEIGHT - rPix - 1;
            var wPix = Math.max(_this.radius, 50) * 2 * canvas.width / WIDTH + 2;
            var hPix = Math.max(_this.radius, 50) * canvas.width / WIDTH + 1 + (_this.previousY > 0 ? 1 : 0);

            // Whale slimes!
            if (_this.radius === 75)
            {
                if (_this.looksRight)
                {
                    xPix -= rPix;
                }
                wPix += rPix;
            }

            var c = canvas.getContext('2d');
            c.beginPath();
            c.clearRect(xPix, yPix, wPix, hPix);

            if (SHOW_RECT)
            {
                c.strokeStyle = "cyan";
                c.strokeRect(xPix, yPix, wPix, hPix);
            }
            _this.previousX = _this.x;
            _this.previousY = _this.y;
        };

        /**
         * Moves the player to a new horizontal position
         * @param newX new horizontal position
         */
        this.setX = function (newX)
        {
            _this.x = newX;
        };

        /**
         * Moves the player to a new horizontal position
         * @param newY new horizontal position
         */
        this.setY = function (newY)
        {
            _this.y = newY;
        };

        /**
         * Moves any existing KeyPress over to the second to last, and stores a new KeyPress.
         * @param keyCode
         */
        this.addKeyPress = function(keyCode)
        {
            _this.secondLastKeyPress = _this.lastKeyPress;
            _this.lastKeyPress = new KeyPress(keyCode);
        }
    }

    /**
     * A KeyPress
     * @constructor
     * @param keyCode
     */
    function KeyPress(keyCode)
    {
        this.start = new Date();
        this.keyCode = keyCode;
    }

    /**
     * The ball (of type volley)
     * @constructor
     */
    function Ball(radius)
    {
        var _this = this;

        this.x = 0;
        this.y = 0;
        this.previousX = 0;
        this.previousY = 0;
        this.vX = 0;
        this.vY = 0;
        this.radius = radius;

        /**
         * Draw the ball on the screen
         * @param canvas HTMLCanvasElement
         */
        this.draw = function (canvas)
        {
            var ballRadPix = (_this.radius + FUDGE) * canvas.height / HEIGHT;
            var ballXPix = this.x * canvas.width / WIDTH;
            var ballYPix = ((4 * HEIGHT / 5) - this.y) * canvas.height / HEIGHT;

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
        this.clear = function (canvas)
        {
            var ballRadPix = (_this.radius + FUDGE) * canvas.height / HEIGHT;
            var ballDPix = ballRadPix * 2 + 2;
            var ballXPix = _this.previousX * canvas.width / WIDTH - ballRadPix - 1;
            var ballYPix = ((4 * HEIGHT / 5) - _this.previousY) * canvas.height / HEIGHT - ballRadPix - 1;

            var c = canvas.getContext('2d');
            c.beginPath();
            c.clearRect(ballXPix, ballYPix, ballDPix, ballDPix);

            if (SHOW_RECT)
            {
                c.strokeStyle = "cyan";
                c.strokeRect(ballXPix, ballYPix, ballDPix, ballDPix);
            }

            _this.previousX = _this.x;
            _this.previousY = _this.y;
        };

        /**
         * Moves the ball to a new horizontal position
         * @param newX new horizontal position
         */
        this.setX = function (newX)
        {
            _this.x = newX;
        };

        /**
         * Moves the ball to a new horizontal position
         * @param newY new horizontal position
         */
        this.setY = function (newY)
        {
            _this.y = newY;
        };
    }

    /**
     * The core game
     *
     * @param canvas HTMLCanvasElement
     * @param settings Object containing settings
     * @constructor
     */
    function Game(canvas, settings)
    {
        this.canvas = canvas;
        this.height = canvas.height;
        this.width = canvas.width;

        this.courtHeight = this.height / 5;

        var _game = this;
        applySettings(settings);

        _game.eventListeners = [];

        _game.commentary = ["", ""];

        _game.canChangeColor = false;
        _game.player1 = new Player(SLIME_COLORS[_game.player1Character], SLIME_NAMES[_game.player1Character], _game.slime_radius, true, VALID_P1_BOOST_KEY_CODES);
        _game.player2 = new Player(SLIME_COLORS[_game.player2Character], SLIME_NAMES[_game.player2Character], _game.slime_radius, false, VALID_P2_BOOST_KEY_CODES);
        _game.ball = new Ball(_game.ball_radius);

        function startMatch()
        {
            _game.player1Character = 0;
            _game.player2Character = 1;
            _game.player1.super = false;
            _game.player2.super = false;
            _game.nScore = 5;

            _game.scoringRun = 0;
            _game.fP1Touched = false;
            _game.fP2Touched = false;
            _game.nPointsScored = 0;
            _game.startTime = null;
            _game.nScore = 5;
            _game.fInPlay = false;

            _game.matchTime = 0;
        }

        function applySettings(settings)
        {
            // apply settings
            _game.ball_radius = settings.ball_radius ? settings.ball_radius : 25;
            _game.slime_radius = settings.slime_radius ? settings.slime_radius : 50; // 50
            _game.timing_multiplier = settings.timing_multiplier ? settings.timing_multiplier : 1;//(16.67/1000)/(20/1000);//16.67*2060/1(1000/20)*(1000)//1;//1000/60/20; // 1000/60/20
            _game.battle_mode = settings.battle_mode !== undefined ? settings.battle_mode : false; // false
            _game.scoring_run_for_super = settings.scoring_run_for_super ? settings.scoring_run_for_super : 3;
            _game.boost_mode = settings.boost_mode !== undefined ? settings.boost_mode : false;
        }

        this.applySettings = applySettings;

        function updateSlimers()
        {
            _game.player1.color = SLIME_COLORS[_game.player1Character];
            _game.player1.name = SLIME_NAMES[_game.player1Character];
            _game.player1.radius = _game.slime_radius;

            _game.player2.color = SLIME_COLORS[_game.player2Character];
            _game.player2.name = SLIME_NAMES[_game.player2Character];
            _game.player2.radius = _game.slime_radius;

            _game.ball.radius = _game.ball_radius;
        }

        function setCommentary(first, second)
        {
            _game.commentary[0] = first ? first : "";
            _game.commentary[1] = second ? second : "";
        }

        function broadcast(eventName, eventData)
        {
            _game.eventListeners.forEach(function(listener){
                if (listener.eventName === eventName)
                {
                    listener.process(eventData, _game);
                }
            });
        }

        function on(eventName, callback)
        {
            _game.eventListeners.push({
                eventName: eventName,
                process: callback
            });
        }

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

        function drawPrompt()
        {
            var c = _game.canvas.getContext('2d');
            var empty = _game.commentary[0].length === 0 && _game.commentary[1].length === 0;
            if (!empty)
            {
                c.font = '14px Helvetica';
                c.fillStyle = "lightgrey";
                c.textAlign = 'center';
                c.fillText(_game.commentary[0], _game.canvas.width / 2, (_game.canvas.height * 4) / 5 + 20 + 10);
                c.fillText(_game.commentary[1], _game.canvas.width / 2, (_game.canvas.height * 4) / 5 + 40 + 10);
            }

        }

        function drawScores()
        {
            var c = _game.canvas.getContext('2d');
            var k = _game.canvas.height / 40;
            c.clearRect(0, 0, _game.canvas.width, k * 2 + 22);

            var l, i;
            for (l = 0; l < _game.nScore; l++)
            {
                i = ((l + 1) * _game.canvas.width) / 24;
                c.beginPath();
                c.fillStyle = _game.player1.color;
                c.strokeStyle = 'white';
                c.arc(i, 20, k, 0, Math.PI * 2);
                c.fill();
                c.stroke();
            }

            for (l = 0; l < 10 - _game.nScore; l++)
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

        function resetSlimers()
        {
            _game.player1.reset(200);
            _game.player2.reset(800);
        }

        function resetBall(player2)
        {
            _game.ball.setX(player2 ? 800 : 200);
            _game.ball.setY(400);
            _game.ball.vX = 0;
            _game.ball.vY = 0;
        }

        function getCommentary(fP1Touched, fP2Touched, nScore, nPointsScored, scoringRun)
        {
            var promptMsg = _game.ball.x <= 500 ? _game.player2.name : _game.player1.name;
            if (!fP1Touched && !fP2Touched)
            {
                promptMsg = "What can I say?";
            }
            else if ((scoringRun < 0 ? -scoringRun : scoringRun) === _game.scoring_run_for_super)
            {
                promptMsg += "is on fire!";
            }
            else if (_game.ball.x > 500 && fP1Touched && !fP2Touched || _game.ball.x <= 500 && !fP1Touched && fP2Touched)
            {
                promptMsg += "aces the serve!";
            }
            else if (_game.ball.x > 500 && !fP1Touched && fP2Touched || _game.ball.x <= 500 && fP1Touched && !fP2Touched)
            {
                promptMsg += "dies laughing! :P";
            }
            else
            {
                switch (nScore)
                {
                    case 0: // '\0'
                    case 10: // '\n'
                        if (nPointsScored === 5)
                        {
                            promptMsg += "Wins with a QUICK FIVE!!!";
                        }
                        else if (scoringRun === 8)
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
            _game.player1.draw(_game.canvas, _game.ball);
            _game.player2.draw(_game.canvas, _game.ball);
            _game.ball.draw(_game.canvas);
            drawNet();
            drawCourt();
            drawPrompt();
        }

        function processKeyDown(e)
        {
            if(VALID_P1_BOOST_KEY_CODES.indexOf(e.keyCode) > -1)
            {
                _game.player1.addKeyPress(e.keyCode);
            }
            if(VALID_P2_BOOST_KEY_CODES.indexOf(e.keyCode) > -1)
            {
                _game.player2.addKeyPress(e.keyCode);
            }

            e.stopPropagation();
            e.preventDefault();
            switch (e.keyCode)
            {
                default:
                    break;

                case KEYA:
                    _game.player1.keys["left"] = true;
                    _game.player1.keys["right"] = false;
                    break;

                case KEYD:
                    _game.player1.keys["right"] = true;
                    _game.player1.keys["left"] = false;
                    break;

                case KEYW:
                    _game.player1.keys["up"] = true;
                    break;

                case KEYS:
                    _game.player1.keys["down"] = true;
                    break;

                case KEYX:
                    if (!_game.canChangeColor)
                    {
                        break;
                    }
                    do
                    {
                        _game.player1Character = (_game.player1Character < SLIME_NAMES.length - 1) ? (_game.player1Character + 1) : 0;
                    }
                    while (_game.player1Character === _game.player2Character);
                    updateSlimers();
                    drawScores();
                    break;

                case LEFT:
                case KEYJ:
                    _game.player2.keys["left"] = true;
                    _game.player2.keys["right"] = false;
                    break;

                case RIGHT:
                case KEYL:
                    _game.player2.keys["right"] = true;
                    _game.player2.keys["left"] = false;
                    break;

                case UP:
                case KEYI:
                    _game.player2.keys["up"] = true;
                    break;

                case DOWN:
                case KEYK:
                    _game.player2.keys["down"] = true;
                    break;
                case KEYM:
                    if (!_game.canChangeColor)
                    {
                        break;
                    }
                    do
                    {
                        _game.player2Character = (_game.player2Character < SLIME_NAMES.length - 1) ? (_game.player2Character + 1) : 0;
                    }
                    while (_game.player2Character === _game.player1Character);
                    updateSlimers();
                    drawScores();
                    break;
                case ' ':
                    _game.mousePressed = true;
                    break;
            }
        }

        function checkForBoosts(player)
        {
            if(_game.boost_mode !== false) {
                return player;
            }
            if(player.boostRemaining > 0 || player.hasBoosted)
            {
                return player;
            }
            else if(player.lastKeyPress === null || player.secondLastKeyPress === null)
            {
                return player;
            }
            else if(player.lastKeyPress.start - player.secondLastKeyPress.start < BOOST_KEY_PRESS_WINDOW_IN_MS)
            {
                if(player.lastKeyPress.keyCode === player.secondLastKeyPress.keyCode)
                {
                    player.boostRemaining = BOOST_WINDOW;
                    player.hasBoosted = true;
                    player.boostKeyCode = player.lastKeyPress.keyCode;
                    player.lastKeyPress = null;
                    player.secondLastKeyPress = null;
                    console.log("BOOST");
                }
            }
            if(new Date() - player.secondLastKeyPress.start > BOOST_KEY_PRESS_WINDOW_IN_MS)
            {
                player.secondLastKeyPress = null;
            }
            if(new Date() - player.lastKeyPress.start > BOOST_KEY_PRESS_WINDOW_IN_MS)
            {
                player.lastKeyPress = null;
            }
            return player;
        }
        
        function processKeyData()
        {
            _game.player1.updateBoost(_game);
            _game.player2.updateBoost(_game);

            _game.player1.updateSpeeds();
            _game.player2.updateSpeeds();
        }

        function processKeyUp(e)
        {
            //console.log("Keydown: " + new Date());
            e.stopPropagation();
            switch (e.keyCode)
            {
                default:
                    break;

                case KEYA:
                    _game.player1.keys["left"] = false;
                    break;

                case KEYD:
                    _game.player1.keys["right"] = false;
                    break;

                case KEYW:
                    _game.player1.keys["up"] = false;
                    break;

                case KEYS:
                    _game.player1.keys["down"] = false;
                    break;

                case LEFT:
                case KEYJ:
                    _game.player2.keys["left"] = false;
                    break;

                case RIGHT:
                case KEYL:
                    _game.player2.keys["right"] = false;
                    break;

                case UP:
                case KEYI:
                    _game.player2.keys["up"] = false;
                    break;

                case DOWN:
                case KEYK:
                    _game.player2.keys["down"] = false;
                    break;
            }
        }

        function processMouseDown(e)
        {
            e.stopPropagation();
            _game.mousePressed = true;
        }

        /*
         * Game start!
         */

        /* Add event handlers */
        document.addEventListener("keydown", processKeyDown, true);
        document.addEventListener("keyup", processKeyUp, true);
        canvas.addEventListener("mousedown", processMouseDown, true);

        startGame();

        /*
         * Main game
         */
        function startGame()
        {
            var replayPos = 0;
            var replayData = [];

            /* Reset the game */
            startMatch();

            /* Reset the slimes! */
            resetSlimers();

            /* Reset the ball */
            resetBall();

            drawingThread();

            startRally(false);

            function startRally(player2Serves)
            {
                setCommentary();
                resetSlimers();
                resetBall(player2Serves);
                clear();
                drawCourt();
                drawNet();
                updateSlimers();
                drawScores();
                replayPos = 0;
                replayData = [];
                _game.fP1Touched = false;
                _game.fP2Touched = false;
                _game.canChangeColor = true;
                _game.startTime = new Date().getTime();
                updateRally();
            }

            function drawingThread()
            {
                updateSlimers();
                clear();
                draw();
                drawStatus(_game.nPointsScored, _game.matchTime);
                requestAnimationFrame(drawingThread);
            }

            function updateRally()
            {
                _game.matchTime += new Date().getTime() - _game.startTime;
                _game.startTime = new Date().getTime();
                if (_game.ball.y < 35)
                {
                    broadcast('ball.collision.ground', {});
                    var scoreTime = new Date().getTime();
                    _game.nPointsScored++;
                    var player2Scores = _game.ball.x <= 500;
                    _game.nScore += player2Scores ? -1 : 1;
                    if ((_game.ball.x <= 500) && (_game.scoringRun >= 0))
                    {
                        _game.scoringRun++;
                    }
                    else if ((_game.ball.x > 500) && (_game.scoringRun <= 0))
                    {
                        _game.scoringRun--;
                    }
                    else if ((_game.ball.x <= 500) && (_game.scoringRun <= 0))
                    {
                        _game.scoringRun = 1;
                    }
                    else if ((_game.ball.x > 500) && (_game.scoringRun >= 0))
                    {
                        _game.scoringRun = -1;
                    }
                    // Anyone super slime?
                    if (_game.scoringRun <= -_game.scoring_run_for_super)
                    {
                        _game.player1.super = true;
                        _game.player2.super = false;
                    }
                    else if (_game.scoringRun >= _game.scoring_run_for_super)
                    {
                        _game.player1.super = false;
                        _game.player2.super = true;
                    }
                    else
                    {
                        _game.player1.super = false;
                        _game.player2.super = false;
                    }

                    _game.mousePressed = false;

                    if (_game.nScore !== 0 && _game.nScore !== 10)
                    {
                        _game.canChangeColor = false;
                        setCommentary(getCommentary(_game.fP1Touched, _game.fP2Touched, _game.nScore, _game.nPointsScored, _game.scoringRun), "Click mouse for replay...");

                        function playReplay()
                        {
                            if (_game.mousePressed)
                            {
                                _game.mousePressed = false;
                                _game.startTime += new Date().getTime() - scoreTime;
                                startRally(player2Scores);
                            }
                            else
                            {
                                var workPos = replayPos;
                                if (workPos >= replayData.length + 50)
                                {
                                    workPos = replayData.length - 1;
                                    replayPos = 0;
                                }
                                else if (workPos >= replayData.length)
                                {
                                    workPos = replayData.length - 1;
                                }
                                replayPos++;
                                
                                _game.ball.setX(replayData[workPos].ball.x);
                                _game.ball.setY(replayData[workPos].ball.y);
                                _game.player1.setX(replayData[workPos].player1.x);
                                _game.player1.setY(replayData[workPos].player1.y);
                                _game.player2.setX(replayData[workPos].player2.x);
                                _game.player2.setY(replayData[workPos].player2.y);

                                clear();
                                draw();

                                requestAnimationFrame(function ()
                                {
                                    // This slows down the game to the original speed (50fps)
                                    setTimeout(playReplay, 1000 / 50 - 1000 / 60);
                                });
                            }
                        }

                        setTimeout(function ()
                        {
                            if (_game.mousePressed)
                            {
                                _game.mousePressed = false;
                                setCommentary(_game.commentary[0], "Click mouse to continue...");
                                playReplay();
                            }
                            else
                            {
                                _game.startTime += new Date().getTime() - scoreTime;
                                startRally(player2Scores);
                            }
                        }, 2500);

                    }
                    else
                    {
                        var promptMsg = _game.nScore === 0 ? _game.player2.name : _game.player1.name;
                        promptMsg += "Wins the Game!";
                        setCommentary(getCommentary(_game.fP1Touched, _game.fP2Touched, _game.nScore, _game.nPointsScored, _game.scoringRun), promptMsg);
                        drawPrompt();
                        drawScores();

                        function startNewGame()
                        {
                            if (_game.mousePressed)
                            {
                                _game.mousePressed = false;
                                var player2StartsNextGame = _game.nScore === 0;
                                startMatch();
                                startRally(player2StartsNextGame);
                            }
                            else
                            {
                                requestAnimationFrame(function ()
                                {
                                    // This slows down the game to the original speed (50fps)
                                    setTimeout(startNewGame, 1000 / 50 - 1000 / 60);
                                });
                            }
                        }

                        startNewGame();
                    }
                }
                else
                {
                    processKeyData();
                    moveSlimers();
                    moveBall();
                    updateReplayData();
                    requestAnimationFrame(function ()
                    {
                        // This slows down the game to the original speed (50fps)
                        setTimeout(updateRally, 1000 / 50 - 1000 / 60);
                    });
                }
            }

            function moveSlimers()
            {
                var player1X = _game.player1.x;
                var player1Y = _game.player1.y;
                var player2X = _game.player2.x;
                var player2Y = _game.player2.y;

                player1X += _game.player1.vX * _game.timing_multiplier;
                if (player1X < _game.slime_radius)
                {
                    player1X = _game.slime_radius;
                }
                if (_game.battle_mode)
                {
                    if (player1X > WIDTH - _game.slime_radius)
                    {
                        player1X = WIDTH - _game.slime_radius;
                    }
                    else if (player1Y < 50 && player1X > 495 - _game.slime_radius && player1X < 501)
                    {
                        player1X = 495 - _game.slime_radius;
                    }
                    else if (player1Y < 50 && player1X > 500 && player1X < 505 + _game.slime_radius)
                    {
                        player1X = 505 + _game.slime_radius;
                    }
                }
                else
                {
                    if (player1X > 495 - _game.slime_radius)
                    {
                        player1X = 495 - _game.slime_radius;
                    }
                }
                if (_game.player1.vY !== 0)
                {
                    _game.player1.vY -= _game.player1.super ? 4 * _game.timing_multiplier : 2 * _game.timing_multiplier;
                    player1Y += _game.player1.vY * _game.timing_multiplier;
                    if (player1Y < 0)
                    {
                        player1Y = 0;
                        _game.player1.vY = 0;
                    }
                }

                if(_game.player2.boostRemaining > 0)
                {
                    var player = _game.player2;
                    player.boostRemaining -= _game.timing_multiplier;
                    var boostDirection = player.getBoostDirection();

                    if(boostDirection === "down")
                    {
                        player.vY = player.super ? -60 : -45;
                        player.vX = 0;
                    }
                    else if(boostDirection === "up")
                    {
                        player.vY = player.super ? 60 : 45;
                        player.vX = 0;
                    }
                    else if(boostDirection === "left")
                    {
                        player.vX = player.super ? -32 : -16;
                        player.vY = 0;
                    }
                    else if(boostDirection === "right")
                    {
                        player.vX = player.super ? 32 : 16;
                        player.vY = 0;
                    }
                }

                player2X += _game.player2.vX * _game.timing_multiplier;
                if (player2X > WIDTH - _game.slime_radius)
                {
                    player2X = WIDTH - _game.slime_radius;
                }
                if (_game.battle_mode)
                {
                    if (player2X > WIDTH - _game.slime_radius)
                    {
                        player2X = WIDTH - _game.slime_radius;
                    }
                    else if (player2Y < 50 && player2X < 505 + _game.slime_radius && player2X > 499)
                    {
                        player2X = 505 + _game.slime_radius;
                    }
                    else if (player2Y < 50 && player2X < 500 && player2X > 495 - _game.slime_radius)
                    {
                        player2X = 495 - _game.slime_radius;
                    }
                }
                else
                {
                    if (player2X < 505 + _game.slime_radius)
                    {
                        player2X = 505 + _game.slime_radius;
                    }
                }
                if (_game.player2.vY !== 0)
                {
                    _game.player2.vY -= _game.player2.super ? 4 * _game.timing_multiplier : 2 * _game.timing_multiplier;
                    player2Y += _game.player2.vY * _game.timing_multiplier;
                    if (player2Y < 0)
                    {
                        player2Y = 0;
                        _game.player2.vY = 0;

                        _game.player2.boostRemaining = 0;
                        _game.player2.hasBoosted = false;
                        _game.player2.boostKeyCode = null;
                    }
                }

                _game.player1.setX(player1X);
                _game.player1.setY(player1Y);
                _game.player2.setX(player2X);
                _game.player2.setY(player2Y);
            }

            function moveBall()
            {
                var maxXV = 15; // was 15
                var maxYV = 22; // was 22

                // move the ball
                var ballY = _game.ball.y;
                var ballX = _game.ball.x;
                ballY += --_game.ball.vY * _game.timing_multiplier;
                ballX += _game.ball.vX * _game.timing_multiplier;

                // collision detection
                var dx = 2 * (ballX - _game.player1.x);
                var dy = ballY - _game.player1.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var dvx = _game.ball.vX - _game.player1.vX;
                var dvy = _game.ball.vY - _game.player1.vY;
                if (dy > 0 && dist < _game.player1.radius * 2 + _game.ball_radius && dist > FUDGE)
                {
                    var velocityChangeP1 = (dx * dvx + dy * dvy) / dist;
                    ballX = _game.player1.x + (_game.player1.radius * 2 + _game.ball_radius) / 2 * dx / dist;
                    ballY = _game.player1.y + (_game.player1.radius * 2 + _game.ball_radius) * dy / dist;
                    // cap the velocity
                    if (velocityChangeP1 <= 0)
                    {
                        _game.ball.vX += _game.player1.vX - (2 * dx * velocityChangeP1 / dist);
                        if (_game.ball.vX < -maxXV)
                        {
                            _game.ball.vX = -maxXV;
                        }
                        if (_game.ball.vX > maxXV)
                        {
                            _game.ball.vX = maxXV;
                        }
                        _game.ball.vY += _game.player1.vY - (2 * dy * velocityChangeP1 / dist);
                        if (_game.ball.vY < -maxYV)
                        {
                            _game.ball.vY = -maxYV;
                        }
                        if (_game.ball.vY > maxYV)
                        {
                            _game.ball.vY = maxYV;
                        }
                    }
                    _game.fP1Touched = true;
                }

                // that stuff all over again, but for p2.
                dx = 2 * (ballX - _game.player2.x);
                dy = ballY - _game.player2.y;
                dist = Math.sqrt(dx * dx + dy * dy);
                dvx = _game.ball.vX - _game.player2.vX;
                dvy = _game.ball.vY - _game.player2.vY;
                if (dy > 0 && dist < _game.player2.radius * 2 + _game.ball_radius && dist > FUDGE)
                {
                    var velocityChangeP2 = (dx * dvx + dy * dvy) / dist;
                    ballX = _game.player2.x + (_game.player2.radius * 2 + _game.ball_radius) / 2 * dx / dist;
                    ballY = _game.player2.y + (_game.player2.radius * 2 + _game.ball_radius) * dy / dist;
                    if (velocityChangeP2 <= 0)
                    {
                        _game.ball.vX += _game.player2.vX - (2 * dx * velocityChangeP2 / dist);
                        if (_game.ball.vX < -maxXV)
                        {
                            _game.ball.vX = -maxXV;
                        }
                        if (_game.ball.vX > maxXV)
                        {
                            _game.ball.vX = maxXV;
                        }
                        _game.ball.vY += _game.player2.vY - (2 * dy * velocityChangeP2 / dist);
                        if (_game.ball.vY < -maxYV)
                        {
                            _game.ball.vY = -maxYV;
                        }
                        if (_game.ball.vY > maxYV)
                        {
                            _game.ball.vY = maxYV;
                        }
                    }
                    _game.fP2Touched = true;
                }
                // hits left wall
                if (ballX < 15)
                {
                    ballX = 15;
                    _game.ball.vX = -_game.ball.vX;
                }
                // hits right wall
                if (ballX > 985)
                {
                    ballX = 985;
                    _game.ball.vX = -_game.ball.vX;
                }
                // hits the post
                if (ballX > 480 && ballX < 520 && ballY < 140)
                {
                    // bounces off top of net
                    if (_game.ball.vY < 0 && ballY > 130)
                    {
                        _game.ball.vY *= -1;
                        ballY = 130;
                    }
                    else if (ballX < 500)
                    { // hits side of net
                        ballX = 480;
                        _game.ball.vX = _game.ball.vX >= 0 ? -_game.ball.vX : _game.ball.vX;
                    }
                    else
                    {
                        ballX = 520;
                        _game.ball.vX = _game.ball.vX <= 0 ? -_game.ball.vX : _game.ball.vX;
                    }
                }

                _game.ball.setX(ballX);
                _game.ball.setY(ballY);
            }

            function updateReplayData()
            {
                if (replayData.length > REPLAY_BUFFER)
                {
                    replayData.shift();
                }
                replayData.push({
                    ball: {
                        x: _game.ball.x,
                        y: _game.ball.y
                    },
                    player1: {
                        x: _game.player1.x,
                        y: _game.player1.y
                    },
                    player2: {
                        x: _game.player2.x,
                        y: _game.player2.y
                    }
                })
            }
        }
    }

    window["Game"] = Game;
})(window, document);

