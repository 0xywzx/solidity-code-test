import React, { Component } from 'react'
import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import web3 from './web3.js'
import GameContract from './abis/GameContract.json'
import { Button } from 'react-bootstrap'

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
        this.setState({
          games: [...this.state.games, game]
        })
      }
    }
    console.log(this.state.games)
  }

  constructor(props) {
    super(props)
    this.state = {
      games: []
    }
    this.createGame = this.createGame.bind(this)
  }

  createGame = async () => {

  }

  render() {
    return (
    <div className="App">
      <header className="App-header">
        Solidity Rock Scissors Paper
      </header>
      <div className="App-body">
        <div className="create-game">
        <Button
          variant="outline-info"
          onClick={this.createGame}>
          Create Game 
        </Button>
        </div>
        <div className="game-list">
          <h2>Game List</h2>
          { this.state.games !== [] ? 
            <>
              { this.state.games.map((game, key) => {
                return(
                  <div className="game-item" key={key}>
                    <p className="content">Game {game.hameId}</p>
                    <p className="content">Ether: {game.depositAmount}</p>
                    <p className="content">Host Player: {game.hostPlayer}</p>
                  </div>
                )
              })}
            </> : <>
          </>}
        </div>
      </div>
    </div>
    )
  }
}  

export default App;
