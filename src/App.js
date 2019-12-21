import React, { Component } from 'react'
import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import web3 from './web3.js'
import GameContract from './abis/GameContract.json'

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
  }

  render() {
    return (
    <div className="App">
      <header className="App-header">

      </header>
    </div>
    )
  }
}  

export default App;
