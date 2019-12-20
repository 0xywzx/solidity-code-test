pragma solidity ^0.5.0;

contract GameContract {

  address owner;
  uint256 internal gameId = 0;
  mapping(address => uint) public balanceOf;
  address constant depositAddress = address(0);
  address constant temporalGuestPlayer = address(1);
  mapping(uint256 => Game) public games;
  mapping(uint256 => GameHand) private gameHand;
  mapping(address => mapping(address => uint256)) public depositedEther;
  
  struct Game {
    uint256 gameId;
    address hostPlayer;
    bytes hostPlayerHand;
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
    bytes _hostPlayerHand = keccak256(_hand, _passward);
    games[gameId] = Game(gameId, msg.sender, _hostPlayerHand,temporalGuestPlayer, 0, msg.value, 0, now);
    deposit();
    emit CreatedGame(gameId, msg.sender, msg.value, now);
  }

  function deposit() public payable {
    balanceOf[msg.sender] = balanceOf[msg.sender] + msg.value;
  }

  function withdraw(uint256 _amount) private {
    msg.sender.transfer(_amount);
	}

  function closeGame(uint256 _gameId) public {
    Game memory _game = games[_gameId];
    require(_game.guestPlayer != temporalGuestPlayer);
    require(_game.hostPlayer == msg.sender);
    require(_game.lastUpdatedTime > now - 1 hours);
    withdraw(_game.depositAmount);
  }

  // Join game (deposit, hand)
  function joinGame(uint256 _gameId, uint256 _hand) public payable {
    Game memory _game = games[_gameId];
    require(_game.gameId == _gameId);
    require(_game.depositAmount == msg.value);
    _game.guestPlayer = msg.sender;
    _game.guestPlayerHand = _hand;
    _game.lastUpdatedTime = now;
    games[_gameId] = _game;
    deposit();
  }

  // 答え合わせ
  function endGame(uint256 _hand, string memory _passward) public payable {
    Game memory _game = games[_gameId];
    require(_game.hostPlayer == msg.sender);
    require(_game.hostPlayerHand == keccak256(_hand, _passward));

  }

}

