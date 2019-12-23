import React, { Component } from 'react'
import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import web3 from './web3.js'
import GameContract from './abis/GameContract.json'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {   
    try {
      const networkId = await web3.eth.net.getId()
      const gameContract = new web3.eth.Contract(GameContract.abi, GameContract.networks[networkId].address)
      this.setState({ gameContract })  
      const accounts = await web3.eth.getAccounts()
      this.setState({ account: accounts[0] })
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
    await this.loadGameInfo()
  }

  async loadGameInfo() {
    const currentGameId = await this.state.gameContract.methods.getGameId().call()
    if (currentGameId >= 1) {
      for (var i = 1; i <= currentGameId; i++) {
        const game = await this.state.gameContract.methods.getGameInfo(i).call()
        if (game.hostPlayer == this.state.account) {
          this.setState({
            hostedGames: [...this.state.hostedGames, game]
          })
        } else if (game.guestPlayer == this.state.account) {
          this.setState({
            joinedGames: [...this.state.joinedGames, game]
          })
        } else if (game.gameStatus == 0) {
          this.setState({
            openGames: [...this.state.openGames, game]
          })
        }
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      hostedGames: [],
      joinedGames: [],
      openGames: []
    }
    this.createGame = this.createGame.bind(this)
    this.joinGame = this.joinGame.bind(this)
  }

  createGame = async () => {
    const depositAmount = web3.utils.toWei((this.deposit.value).toString(), 'ether')
    await this.state.gameContract.methods.createGame(0, this.passward.value).send({ from: this.state.account, value: depositAmount})
    .once('receipt', async (receipt) => { 
      console.log(receipt)
      const game = await this.state.gameContract.methods.getGameInfo(Number(receipt.events.CreatedGame.returnValues.gameId)).call()
      this.setState({
        openGames: [...this.state.openGames, game],
        hostedGames: [...this.state.hostedGames, game]
      })
    })
  }

  joinGame = async (game, key) => {
    const guestHand = 'guestHand' + key
    await this.state.gameContract.methods.joinGame(game.gameId, this.state[guestHand]).send({ from: this.state.account, value: game.depositAmount})
    .once('receipt', async (receipt) => { 
      console.log(receipt)
    })
    const gameInfo = await this.state.gameContract.methods.getGameInfo(game.gameId).call()
    this.setState({
      joinedGames: [...this.state.joinedGames, gameInfo]
    })
    const openGamesArrey = this.state.openGames
    await openGamesArrey.some(function(v, i) {
      if (v.gameId == game.gameId) {
        openGamesArrey.splice(i, 1)
      } 
    })
    await this.setState({
      openGames: openGamesArrey
    })
  }

  showResult = async (game, key) => {
    const showResultHand = 'showResultHand' + key
    const showResultPassward = 'showResultPassward' + key
    await this.state.gameContract.methods.gameResult(game.gameId, this.state[showResultHand], this.state[showResultPassward]).send({ from: this.state.account})
    .once('receipt', async (receipt) => { 
      console.log(receipt)
    })
    const gameInfo = await this.state.gameContract.methods.getGameInfo(game.gameId).call()
    const hostedGamesArrey = await this.state.hostedGames
    hostedGamesArrey.some(function(v, i) {
      if (v.gameId == gameInfo.gameId) {
        hostedGamesArrey.splice(i, 1)
        hostedGamesArrey.push(gameInfo)
        hostedGamesArrey.sort((a, b) => a.gameId - b.gameId)
      } 
    })
    await this.setState({
      hostedGames: hostedGamesArrey
    })
  }

  getEtherFromWinner = async (game) => {
    await this.state.gameContract.methods.getDepositedEtherFromWinner(game.gameId).send({ from: this.state.account})
    .once('receipt', async (receipt) => { 
      console.log(receipt)
    })
    const gameInfo = await this.state.gameContract.methods.getGameInfo(game.gameId).call()
    if (game.hostPlayer == this.state.account) {
      const hostedGamesArrey = await this.state.hostedGames
      await hostedGamesArrey.some(function(v, i) {
        if (v.gameId == gameInfo.gameId) {
          hostedGamesArrey.splice(i, 1)
          hostedGamesArrey.push(gameInfo)
          hostedGamesArrey.sort((a, b) => a.game - b.game)
        } 
      })
      await this.setState({
        hostedGames: hostedGamesArrey
      })
    } else if (game.guestPlayer == this.state.account) {
      const joinedGamesArrey = await this.state.joinedGames
      await joinedGamesArrey.some(function(v, i) {
        if (v.gameId == gameInfo.gameId) {
          joinedGamesArrey.splice(i, 1)
          joinedGamesArrey.push(gameInfo)
          joinedGamesArrey.sort((a, b) => a.gameId - b.gameId)
        } 
      })
      await this.setState({
        joinedGames: joinedGamesArrey
      })
    }
  }
  
  getEther = async (game) => {
    await this.state.gameContract.methods.getDepositedEther(game.gameId).send({ from: this.state.account})
    .once('receipt', async (receipt) => { 
      console.log(receipt)
    })
    const gameInfo = await this.state.gameContract.methods.getGameInfo(game.gameId).call()
    if (game.hostPlayer == this.state.account) {
      const hostedGamesArrey = await this.state.hostedGames
      await hostedGamesArrey.some(function(v, i) {
        if (v.gameId == gameInfo.gameId) {
          hostedGamesArrey.splice(i, 1)
          hostedGamesArrey.push(gameInfo)
          hostedGamesArrey.sort((a, b) => a.game - b.game)
        } 
      })
      await this.setState({
        hostedGames: hostedGamesArrey
      })
    } else if (game.guestPlayer == this.state.account) {
      const joinedGamesArrey = await this.state.joinedGames
      await joinedGamesArrey.some(function(v, i) {
        if (v.gameId == gameInfo.gameId) {
          joinedGamesArrey.splice(i, 1)
          joinedGamesArrey.push(gameInfo)
          joinedGamesArrey.sort((a, b) => a.gameId - b.gameId)
        } 
      })
      await this.setState({
        joinedGames: joinedGamesArrey
      })
    }
  }

  render() {
    return (
    <div className="App">
      <header className="App-header">
        Solidity Rock Scissors Paper
      </header>
      <div className="App-body">
        <div className="create-game">
          <h2>Create Game</h2>
          <p>
            Hand :
            <select ref={(input) => { this.hand = input }}>>
              <option value="0" >Rock</option>
              <option value="1">Scissors</option>
              <option value="2">Paper</option>
            </select>
          </p>
          <p>
            Deposit: 
            <input type="number" placeholder=""
              ref={(input) => { this.deposit = input　}}>
            </input>
          </p>
          <p>
            Passward : 
            <input type="texr" placeholder=""
              ref={(input) => { this.passward = input }}>
            </input>
          </p>
          <button
            onClick={this.createGame}>
            Create Game
          </button>
        </div>
        <div className="game-list">
          <Tabs defaultActiveKey="openGame">
            <Tab eventKey="openGame" title="Open Game List">
            { this.state.openGames !== [] ? 
              <>
                { this.state.openGames.map((game, key) => {
                  const guestHand = 'guestHand' + key
                  return(
                    <div className="game-item" key={key}>
                      <span>
                        Game {game.gameId}
                      </span>
                      <span>
                        Ether: {web3.utils.fromWei(game.depositAmount, 'ether')}
                      </span>
                      <span>
                        Hand :
                        <select onChange={async(e) => await this.setState({ [guestHand] : e.target.value }) }>
                          <option value="--">Choose hand</option>
                          <option value="0" >Rock</option>
                          <option value="1">Scissors</option>
                          <option value="2">Paper</option>
                        </select>
                      </span>
                      <button
                        onClick={(e) => { this.joinGame(game, key) }}>
                        Join Game
                      </button>
                    </div>
                  )
                })}
              </> : <>
            </>}
            </Tab>
            <Tab eventKey="hostGame" title="Hosted Game List">
              { this.state.hostedGames !== [] ? 
                <>
                  { this.state.hostedGames.map((game, key) => {
                    const showResultHand = 'showResultHand' + key
                    const showResultPassward = 'showResultPassward' + key
                    return(
                      <div className="game-item" key={key}>
                        <span>
                          Game {game.gameId}
                        </span>
                        <span>
                          Ether: {web3.utils.fromWei(game.depositAmount, 'ether')}
                        </span>
                        {(() => {
                          if (game.gameStatus == 0)
                          return <span>Waiting guset</span>
                          else if (game.gameStatus == 1)
                          return <>
                            <span>Guset Joined</span>
                            <span>Type same hand and passward</span><br/>
                            <span>
                              Hand :
                              <select onChange={async(e) => await this.setState({ [showResultHand] : e.target.value }) }>
                                <option value="--">Choose hand</option>
                                <option value="0" >Rock</option>
                                <option value="1">Scissors</option>
                                <option value="2">Paper</option>
                              </select>
                            </span>
                            <span>
                              Passward : 
                              <input type="text" onChange={async(e) => await this.setState({ [showResultPassward] : e.target.value }) }>
                              </input>
                            </span>
                            <button
                              onClick={(e) => { this.showResult(game, key) }}>
                              Show result
                            </button>
                          </>
                          else if (game.gameStatus == 2 && this.state.gameContract.methods.balanceOf(game.gameId, this.state.account) == 0)
                          return <span>End</span>
                          else if (game.gameStatus == 2)
                          return <>
                            <span>draw</span>
                            <button
                              onClick={(e) => { this.getEther(game) }}>
                              Get ether
                            </button>
                          </>
                          else if (game.gameStatus == 3)
                          return <>
                            <span>You win!</span>
                            <button
                              onClick={(e) => { this.getEtherFromWinner(game) }}>
                              Get ether
                            </button>
                          </>  
                          else if (game.gameStatus == 4)
                          return <span>You lose</span>
                          else 
                          return <span>End</span>
                        })()}
                      </div>
                    )
                  })}
                </> : <>
              </>}
            </Tab>
            <Tab eventKey="guestGame" title="Joined Game List">
              { this.state.joinedGames !== [] ? 
                <>
                  { this.state.joinedGames.map((game, key) => {
                    return(
                      <div className="game-item" key={key}>
                        <span>
                          Game {game.gameId}
                        </span>
                        <span>
                          Ether: {web3.utils.fromWei(game.depositAmount, 'ether')}
                        </span>
                        {(() => {
                          if (game.gameStatus == 1)
                          return <span className="status">Waiting host response</span>
                          else if (game.gameStatus == 2 && this.state.gameContract.methods.balanceOf(game.gameId, this.state.account) == 0)
                          return <span>End</span>
                          else if (game.gameStatus == 2)
                          return <>
                            <span>draw</span>
                            <button
                              onClick={(e) => { this.getEther(game) }}>
                              Get ether
                            </button>
                          </>
                          else if (game.gameStatus == 3)
                          return <span>You lose</span>
                          else if (game.gameStatus == 4)
                          return <>
                            <span>You win!</span>
                            <button
                              onClick={(e) => { this.getEtherFromWinner(game) }}>
                              Get ether
                            </button>
                          </>  
                          else if (game.gameStatus == 5)
                          return <span>End</span>
                        })()}
                      </div>
                    )
                  })}
                </> : <>
              </>}
            </Tab>
          </Tabs>          
        </div>
      </div>
    </div>
    )
  }
}  

export default App;
