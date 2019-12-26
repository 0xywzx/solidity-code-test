pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract GameContract {

  address owner;
  uint256 private gameId = 0;
  mapping(address => mapping(uint => uint)) public balanceOf;
  address constant temporalGuestPlayer = address(1);
  mapping(uint256 => Game) private games;
  
  // hand 0: rock, 1: Scissors, 2: paper
  // game status 0: game created, 1:guest joined, 2:draw game, 3: host is winner, 4: guest is winner, 5: game closed, 6: host withdrawed ether from a draw game, 7: host withdrawed ether from a draw game
  struct Game {
    uint256 gameId;
    address hostPlayer;
    bytes32 hostPlayerHand;
    address guestPlayer;
    uint guestPlayerHand;
    uint gameStatus;
    uint256 depositAmount;
    uint256 lastUpdatedTime;
  }

  event CreatedGame(uint256 gameId);

  constructor () public{
    owner = msg.sender;
  }

  // 1. create game (deposit ether, hand will be encrypted with passward)
  function createGame(uint256 _hand, string memory _passward) public payable {
    gameId = gameId + 1;
    bytes32 _hostPlayerHand = keccak256(abi.encodePacked(_hand, _passward));
    games[gameId] = Game(gameId, msg.sender, _hostPlayerHand, temporalGuestPlayer, 0, 0, msg.value, now);
    deposit(gameId);
    emit CreatedGame(gameId);
  }

  function deposit(uint256 _gameId) public payable {
    balanceOf[msg.sender][_gameId] = balanceOf[msg.sender][_gameId] + msg.value;
  }

  function withdraw(uint256 _amount) private {
    msg.sender.transfer(_amount);
	}

  // **1** when no guest joined
  function closeGame(uint256 _gameId) public {
    Game memory _game = games[_gameId];
    require(_game.gameStatus == 0);
    require(_game.hostPlayer == msg.sender);
    require(now - 5 minutes > _game.lastUpdatedTime);
    require(balanceOf[_game.hostPlayer][_gameId] >= _game.depositAmount);
    withdraw(_game.depositAmount);
    _game.gameStatus = 5;
    games[_gameId] = _game;
  }

  // 2. Join game (deposit, hand)
  function joinGame(uint256 _gameId, uint256 _hand) public payable {
    Game memory _game = games[_gameId];
    require(_game.hostPlayer != msg.sender);
    require(_game.depositAmount == msg.value);
    require(_game.gameStatus == 0);
    _game.guestPlayer = msg.sender;
    _game.guestPlayerHand = _hand;
    _game.gameStatus = 1;
    _game.lastUpdatedTime = now;
    deposit(_gameId);
    games[_gameId] = _game;
  }

  // **2** when host player has no response
  function closeGameByGuest(uint256 _gameId) public {
    Game memory _game = games[_gameId];
    require(_game.gameStatus == 1);
    require(_game.guestPlayer == msg.sender);
    require(_game.lastUpdatedTime > now - 1 hours);
    require(balanceOf[_game.guestPlayer][_gameId] >= _game.depositAmount);
    withdraw(_game.depositAmount);
    _game.gameStatus = 5;
    games[_gameId] = _game;
  }

  // 3. show game result
  function gameResult(uint256 _gameId, uint256 _hand, string memory _passward) public {
    Game memory _game = games[_gameId];
    require(_game.hostPlayer == msg.sender);
    require(_game.gameStatus == 1);
    require(_game.hostPlayerHand == keccak256(abi.encodePacked(_hand, _passward)));
    if (_hand ==  _game.guestPlayerHand) {
      _game.gameStatus = 2;
    } else if ((_hand == 0 && _game.guestPlayerHand == 1) || (_hand == 1 && _game.guestPlayerHand == 2) || (_hand == 2 && _game.guestPlayerHand == 0)) {
      _game.gameStatus = 3;
      balanceOf[_game.hostPlayer][_gameId] = balanceOf[_game.hostPlayer][_gameId] + _game.depositAmount;
      balanceOf[_game.guestPlayer][_gameId] = balanceOf[_game.guestPlayer][_gameId] - _game.depositAmount;
    } else {
      _game.gameStatus = 4;
      balanceOf[_game.guestPlayer][_gameId] = balanceOf[_game.guestPlayer][_gameId] + _game.depositAmount;
      balanceOf[_game.hostPlayer][_gameId] = balanceOf[_game.hostPlayer][_gameId] - _game.depositAmount;
    }
    games[_gameId] = _game;
  }

  // 4-1. get ether from winner
  function getDepositedEtherFromWinner(uint256 _gameId) public payable {
    Game memory _game = games[_gameId];
    require((_game.gameStatus == 3 && _game.hostPlayer == msg.sender) || (_game.gameStatus == 4) && (_game.guestPlayer == msg.sender)); 
    require(balanceOf[msg.sender][_gameId] >= _game.depositAmount*2);
    withdraw(balanceOf[msg.sender][_gameId]);
    balanceOf[msg.sender][_gameId] = 0;
    _game.gameStatus = 5;
    games[_gameId] = _game;
  }

  // 4-2. get deposited ether from a draw game
  function getDepositedEther(uint256 _gameId) public payable {
    Game memory _game = games[_gameId];
    require(_game.gameStatus == 2);
    require((_game.hostPlayer == msg.sender) || (_game.guestPlayer == msg.sender)); 
    require(balanceOf[msg.sender][_gameId] >= _game.depositAmount);
    withdraw(balanceOf[msg.sender][_gameId]);
    balanceOf[msg.sender][_gameId] = 0;
    if(balanceOf[_game.hostPlayer][_gameId] == 0 && balanceOf[_game.guestPlayer][_gameId] == 0) {
      _game.gameStatus = 5;
      games[_gameId] = _game;
    }
  }

  function getGameInfo(uint256 _gameId) external view returns (Game memory) {
    return games[_gameId];
  }

  function getGameId() external view returns (uint256) {
    return gameId;
  }

}