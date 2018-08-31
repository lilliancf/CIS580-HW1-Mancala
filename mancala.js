
var turn = 0;

var board = [null,null];

var icons = [];

var ongoingGame = false;

function initGame() {
  ongoingGame = true;
  turn = 0;
  updateTurn();
  for (var p = 0; p < 2; p++){
    for (var c = 0; c < 6; c++) {
      board[p][c][0] = 4;
      for (var i = 1; i < 6; i++){
        board[p][c][i] = Math.floor(Math.random() * 106);
      }
    }
    board[p][6][0] = 0;
  }
  updateBoard();
}

function buttonClick() {
  initGame();
}

function movePieces(p, c) {
  var iStack = [];
  var num = board[p][c][0];
  for (var i = 1; i < num+1; i++) {
      iStack.push(board[p][c][i]);
      board[p][c][i] = null;
  }
  board[p][c][0] = 0;

  var lastCup = -1;
  for (var yours = c+1; yours<7&&iStack.length!=0; yours++) {
    board[p][yours][(board[p][yours][0]+1)] = iStack.pop();
    board[p][yours][0]++;
    lastCup = yours;
  }
  var player = p;
  while (iStack.length>0) {
    player = (player+1)%2;
    var count = iStack.length
    for(var opp = 0; (opp<count&&opp<7); opp++) {
      board[player][opp][(board[player][opp][0]+1)] = iStack.pop();
      board[player][opp][0]++;
      if (player===p) lastCup = opp;
      else lastCup = -1;
    }
  }

  if (checkIfGameOver()) {
    return;
  }
  // gives repeat turn if last pebble lands in players score cup
  if (lastCup===6) {
    turn = (turn + 1)%2;
  }

  // captures pieces on other side of board
  else if (player===p&&board[p][lastCup][0]===1&&board[(p+1)%2][Math.abs(lastCup-5)][0]!==0) {
    var caputureCup = Math.abs(lastCup-5);
    var otherP = (p + 1)%2;
    var capStack = []
    for (var cc = 1; cc < board[otherP][caputureCup][0]+1; cc++){
      capStack.push(board[otherP][caputureCup][cc])
      board[otherP][caputureCup][cc] = null;
    }
    board[otherP][caputureCup][0] = 0;

    capStack.push(board[p][lastCup][1]);
    board[p][lastCup][1] = null;
    board[p][lastCup][0]--;

    var curScore = board[p][6][0];

    for(var pp = curScore+1; capStack.length>0; pp++) {
      board[p][6][pp] = capStack.pop();
      board[p][6][0]++;
    }
  }
}

function checkIfGameOver() {
  var end = true;
  for (var c = 0; c < 6; c++) {
      if(board[turn][c][0]>0) {
        end = false;
      }
    }
    return end;
}

function moveGameOverPieces() {
  var winStack = [];
  for (var oc = 0; oc < 6; oc++) {
    for (var i = 1; i < board[(turn+1)%2][oc][0]+1; i++) {
      winStack.push(board[(turn+1)%2][oc][i]);
      board[(turn+1)%2][oc][i] = null;
    }
    board[(turn+1)%2][oc][0] = 0;
  }


  var curScore = board[(turn+1)%2][6][0];

  for(var pp = curScore+1; winStack.length>0; pp++) {
    board[(turn+1)%2][6][pp] = winStack.pop();
    board[(turn+1)%2][6][0]++;
  }
}


function cupClick(p, c) {
  if (ongoingGame) {
    if (validClick(p, c)) {
      movePieces(p, c);
      if (checkIfGameOver()) {
        moveGameOverPieces();
        updateWinner();
        ongoingGame = false;
      }
      else {
        turn = (turn+1)%2;
        updateTurn();
      }
      updateBoard();
    }
  }
}

//startup fuctions start
function loadIcons() {
  for (var i = 0; i < 106; i++) {
    icons[i] = '<img src="icons/' + i + '.png" class="icon"></img>';
  }
}

function makeBoardArr(){
  for (var p = 0; p < 2; p++) {
    board[p] = [];
    for(var c = 0; c < 7; c++) {
      board[p][c] = [];
    }
  }
}

function initClickEvents() {
  for (var p = 0; p < 2; p++) {
  const player = p;
    for (var c = 0; c < 7; c++) {
      const col = c;
      document.getElementById('col-p' + player + '-' + col).addEventListener('click', function(event){
        event.preventDefault();
        cupClick(player, col);
      });
    }
  }
  document.getElementById('button').addEventListener('click', function(event){
    event.preventDefault();
    buttonClick();
  });
}
// startup functions end

// ui update funtions start
function displayMessage(message) {
    document.getElementById('ui').innerHTML = message;
}

function updateTurn() {
  if (turn===0)  displayMessage("Blue's Turn");
  else displayMessage("Red's Turn");
}

function updateBoard() {
  for (var p = 0; p < 2; p++) {
    for (var c = 0; c < 7; c++) {
      var box = "";
      for (var i = 1; i < (board[p][c][0]+1); i++) {
        box += icons[board[p][c][i]];
      }
      document.getElementById('col-p' + p + '-' + c).innerHTML = box;
      document.getElementById('numCol-p' + p + '-' + c).innerHTML = board[p][c][0];
    }
  }
}

function updateWinner() {
  if(board[0][6][0] > board [1][6][0]) {
    displayMessage("Blue Wins! Press New Game to Play Again!");
  }
  else if (board[0][6][0] === board [1][6][0]){
    displayMessage("Tie! Press New Game to Play Again!");
  }
  else {
      displayMessage("Red Wins! Press New Game to Play Again!");
  }
}

function validClick(p, c) {
  if (p != turn) {
    displayMessage("Invalid Move - you can only move the emoji in your own cups");
    setTimeout(updateTurn, 2000);
    return false;
  }
   else if (c === 6) {
    displayMessage("Invalid Move - you can't move emoji out of the score cup");
    setTimeout(updateTurn, 2000);
    return false;
  }
  else if (board[p][c][0]===0) {
    displayMessage("Invalid Move - you can't make a move on an empty cup");
    setTimeout(updateTurn, 2000);
    return false;
  }
  return true;
}
// ui update functions end

loadIcons();
makeBoardArr();
initClickEvents();
//initGame();
