
const Contract = artifacts.require('./GameContract');

require('chai')
  .use(require('chai-as-promised'))
  .should() 

contract('TraceableToken', ([deployer, user1, user2]) => {
  beforeEach(async () => {
    contract = await Contract.new()
  })

  describe('game contract', () => {
    let gameId
    let hand
    let passward
    let depositAmount
    let result
    let createGameResult

    beforeEach(async () => {
      gameId = 1
      hand = 0
      passward = "passward"
      depositAmount = 2
      await contract.createGame(hand, passward, {from: user1, value: web3.utils.toWei(depositAmount.toString(), 'ether')})
    })

    it('host player created first game', async () => {
      result = await contract.getGameInfo(gameId, {from: deployer})
      result.hostPlayer.should.equal(user1, 'host player address is correct')
      result.depositAmount.toString().should.equal(web3.utils.toWei(depositAmount.toString(), 'ether') , 'deposit amount is correct')
      result.gameStatus.toString().should.equal("0", 'game status is correct')
      result = await contract.balanceOf(user1, gameId)
      result.toString().should.equal(web3.utils.toWei(depositAmount.toString(), 'ether'), 'deposited amount is correct')
    })

    describe('when no guset joind', () => {
      
    })

    describe('guest player join game', () => {

      describe('success', async() => {
        beforeEach(async () => {
          gameId = 1
          hand = 1
          await contract.joinGame(gameId, hand, {from: user2, value: web3.utils.toWei(depositAmount.toString(), 'ether')})
        })

        it('successfully joined a game', async () => {
          result = await contract.getGameInfo(1, {from: deployer})
          result.guestPlayer.should.equal(user2, 'host player address is correct')
          result.gameStatus.toString().should.equal("1", 'game status is correct')
          result = await contract.balanceOf(user2, gameId)
          result.toString().should.equal(web3.utils.toWei(depositAmount.toString(), 'ether'), 'deposited amount is correct')
        })

        describe('when host player has no response', () => {
  
        })
      })
      describe('failure', async() => {
        // deposit amount
        // gamestatus
        // ？？ guset player address ...
      })

      describe('host player won the game', () => {

        describe('success', async() => {
          beforeEach(async () => {
            gameId = 1
            hand = 1
            await contract.joinGame(gameId, hand, {from: user2, value: web3.utils.toWei(depositAmount.toString(), 'ether')})
            hand = 0
            passward = "passward"
            result = await contract.gameResult(gameId, hand, passward, {from: user1})
          })

          it('host player successfully won the game', async() => {
            result = await contract.getGameInfo(1, {from: deployer})
            result.gameStatus.toString().should.equal("3", 'game status is correct')
            let winnerDepositedEther = result.depositAmount*2
            result = await contract.balanceOf(user1, gameId)
            result.toString().should.equal(winnerDepositedEther.toString(), 'deposited amount is correct')
            result = await contract.balanceOf(user2, gameId)
            result.toString().should.equal("0", 'deposited amount is correct')
          })
          
          describe('get deposited ether', () => {
            describe('success', async() => {
              it('host player successfully withdrow deposited ether', async() => {
                result = await contract.getDepositedEther(1, {from: user1})
                
              })
            })
  
            describe('failure', async() => {
              // not host player
              // hand & password do not match
              // game status
            })

          })
          
        })

        describe('failure', async() => {
          // not host player
          // hand & password do not match
          // game status
        })
      })

      describe('guest player won the game', () => {
        describe('success', async() => {
          beforeEach(async () => {
            gameId = 1
            hand = 2
            await contract.joinGame(gameId, hand, {from: user2, value: web3.utils.toWei(depositAmount.toString(), 'ether')})
            hand = 0
            passward = "passward"
            result = await contract.gameResult(gameId, hand, passward, {from: user1})
          })

          it('guest player successfully won the game', async() => {
            result = await contract.getGameInfo(1, {from: deployer})
            result.gameStatus.toString().should.equal("4", 'game status is correct')
            let winnerDepositedEther = result.depositAmount*2
            result = await contract.balanceOf(user2, gameId)
            result.toString().should.equal(winnerDepositedEther.toString(), 'deposited amount is correct')
            result = await contract.balanceOf(user1, gameId)
            result.toString().should.equal("0", 'deposited amount is correct')
          })
          
          describe('get deposited ether', () => {
            describe('success', async() => {
              it('')
            })
  
            describe('failure', async() => {
              // not host player
              // hand & password do not match
              // game status
            })
          })

        })

        describe('failure', async() => {
          // not host player
          // hand & password do not match
          // game status
        })
      })

      describe('drow game', () => {
        describe('success', async() => {
          beforeEach(async () => {
            gameId = 1
            hand = 0
            await contract.joinGame(gameId, hand, {from: user2, value: web3.utils.toWei(depositAmount.toString(), 'ether')})
            hand = 0
            passward = "passward"
            result = await contract.gameResult(gameId, hand, passward, {from: user1})
          })

          it('guest player successfully won the game', async() => {
            result = await contract.getGameInfo(1, {from: deployer})
            result.gameStatus.toString().should.equal("2", 'game status is correct')
            let depositedEther = result.depositAmount
            result = await contract.balanceOf(user1, gameId)
            result.toString().should.equal(depositedEther.toString(), 'deposited amount is correct')
            result = await contract.balanceOf(user2, gameId)
            result.toString().should.equal(depositedEther, 'deposited amount is correct')
          })
          
          describe('get deposited ether', () => {
            describe('success', async() => {
              it('')
            })
  
            describe('failure', async() => {
              // not host player
              // hand & password do not match
              // game status
            })
          })

        })

      })

    })

  })

})
