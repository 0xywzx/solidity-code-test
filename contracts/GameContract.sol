pragma solidity ^0.5.0;

contract GameContract {

  address owner;
  uint256 private gameId = 0;
  mapping(address => mapping(uint => uint)) public balanceOf;
  address constant temporalGuestPlayer = address(1);
  mapping(uint256 => Game) private games;
  
  struct Game {
    uint256 gameId;
    address hostPlayer;
    bytes32 hostPlayerHand;
    address guestPlayer;
    uint256 depositAmount;
    uint guestPlayerHand;
    uint16 gameStatus;
    uint256 lastUpdatedTime;
  }

  event CreatedGame(uint256 gameId, address hostPlayer, uint256 depositAmount, uint256 openTime);

  constructor () public{
    owner = msg.sender;
  }

  // create game (deposit, hand, )
  function createGame(uint256 _hand, string memory _passward) public payable {
    gameId = gameId + 1;
    bytes32 _hostPlayerHand = keccak256(abi.encodePacked(_hand, _passward));
    games[gameId] = Game(gameId, msg.sender, _hostPlayerHand, temporalGuestPlayer, 0, msg.value, 0, now);
    deposit(gameId);
    emit CreatedGame(gameId, msg.sender, msg.value, now);
  }

  function deposit(uint256 _gameId) public payable {
    balanceOf[msg.sender][_gameId] = balanceOf[msg.sender][_gameId] + msg.value;
  }

  function withdraw(uint256 _amount) private {
    msg.sender.transfer(_amount);
	}

  function closeGame(uint256 _gameId) public {
    Game memory _game = games[_gameId];
    require(_game.gameStatus == 0);
    require(_game.guestPlayer != temporalGuestPlayer);
    require(_game.hostPlayer == msg.sender);
    require(_game.lastUpdatedTime > now - 1 hours);
    require(balanceOf[_game.hostPlayer][_gameId] >= _game.depositAmount);
    withdraw(_game.depositAmount);
    _game.gameStatus = 5;
    games[_gameId] = _game;
  }

  // Join game (deposit, hand)
  function joinGame(uint256 _gameId, uint256 _hand) public payable {
    Game memory _game = games[_gameId];
    require(_game.gameId == _gameId);
    require(_game.depositAmount == msg.value);
    require(_game.gameStatus == 0);
    _game.guestPlayer = msg.sender;
    _game.guestPlayerHand = _hand;
    _game.gameStatus = 1;
    _game.lastUpdatedTime = now;
    games[_gameId] = _game;
    deposit(_gameId);
  }

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

  // 答え合わせ
  function endGame(uint256 _gameId, uint256 _hand, string memory _passward) public payable {
    Game memory _game = games[_gameId];
    require(_game.hostPlayer == msg.sender);
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
  }

  function getDepositedEther(uint256 _gameId) public payable {
    Game memory _game = games[_gameId];
    require(_game.gameStatus >= 2);
    if (_game.gameStatus == 3) {
      require(_game.hostPlayer == msg.sender);
      require(balanceOf[msg.sender][_gameId] >= _game.depositAmount*2);
      withdraw(balanceOf[msg.sender][_gameId]);
    } else if (_game.gameStatus == 4) {
      require(_game.guestPlayer == msg.sender);
      require(balanceOf[msg.sender][_gameId] >= _game.depositAmount*2);
      withdraw(balanceOf[msg.sender][_gameId]);
    } else {
      require(balanceOf[msg.sender][_gameId] >= _game.depositAmount);
      withdraw(balanceOf[msg.sender][_gameId]);
    }
  }

}

