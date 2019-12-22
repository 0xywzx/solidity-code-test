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
        } else if (game.guestPlayer == this.state.account) {
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
  }

  createGame = async () => {
    console.log(this.hand.value)
    // await this.state.gameContract.methods.createGame(0, this.passward.value).send({ from: this.state.account, value: this.deposit.value})
    // .once('receipt', async (receipt) => { 
    //   console.log(receipt)
    //   const game = await this.state.gameContract.methods.getGameInfo(Number(receipt.events.CreatedGame.returnValues.gameId)).call()
    //   this.setState({
    //     hostedGames: [...this.state.hostedGames, game]
    //   })
    // })
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
          <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
            <Tab eventKey="home" title="Open Game List">
            { this.state.openGames !== [] ? 
              <>
                { this.state.openGames.map((game, key) => {
                  return(
                    <div className="game-item" key={key}>
                      <span>
                        Game {game.gameId}
                      </span>
                      <span>
                        Ether: {web3.utils.fromWei(game.depositAmount, 'ether')}
                      </span>
                    </div>
                  )
                })}
              </> : <>
            </>}
            </Tab>
            <Tab eventKey="profile" title="Hosted Game List">
              { this.state.hostedGames !== [] ? 
                <>
                  { this.state.hostedGames.map((game, key) => {
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
                          return <p>Open</p>
                          else if (game.gameStatus == 1)
                          return <p>Show result</p>
                          else if (game.gameStatus == 2)
                          return <p>Draw</p>
                          else if (game.gameStatus == 3)
                          return <p>You win!</p>
                          else if (game.gameStatus == 4)
                          return <p>You lose</p>
                          else 
                          return <p>End</p>
                        })()}
                      </div>
                    )
                  })}
                </> : <>
              </>}
            </Tab>
            <Tab eventKey="contact" title="Joined Game List">
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
                          return <p>Waiting host response</p>
                          else if (game.gameStatus == 2)
                          return <p>Draw</p>
                          else if (game.gameStatus == 3)
                          return <p>You lose</p>
                          else if (game.gameStatus == 4)
                          return <p>You win</p>
                          else if (game.gameStatus == 5)
                          return <p>End</p>
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
