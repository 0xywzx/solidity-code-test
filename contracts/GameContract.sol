pragma solidity ^0.5.0;

contract GameContract {

  address owner;
  uint256 internal gameId = 0;
  address constant depositAddress = address(0);
  address constant temporalGuestPlayer = address(1);
  mapping(uint256 => Game) public games;
  mapping(uint256 => GameHand) private gameHand;
  mapping(address => mapping(address => uint256)) public depositedEther;
  
  struct Game {
    uint256 gameId;
    address hostPlayer;
    address guestPlayer;
    uint256 depositAmount;
    uint16 gameStatus;
    uint256 openTime;
  }

  struct GameHand {
    uint hostPlayerHand;
    uint guestPlayerHand;
  }

  event CreatedGame(uint256 gameId, address hostPlayer, uint256 depositAmount, uint256 openTime);

  constructor () public{
    owner = msg.sender;
  }

  function createGane() public payable {
    gameId = gameId + 1;
    games[gameId] = Game(gameId, msg.sender, temporalGuestPlayer, msg.value, 0, now);
    deposit();
    emit CreatedGame(gameId, msg.sender, msg.value, now);
  }

  function deposit() public payable {
  }

  function withdraw(uint256 _amount) private {
    msg.sender.transfer(_amount);
	}

  function CloseGame(uint256 _gameId) public {
    require(games[_gameId].hostPlayer == msg.sender);
    require(games[_gameId].openTime > now - 1 hours);
    withdraw(games[_gameId].depositAmount);
  }


}

