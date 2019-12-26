
const Contract = artifacts.require('./GameContract');

require('chai')
  .use(require('chai-as-promised'))
  .should() 

contract('TraceableToken', ([deployer, user1, user2, user3]) => {
  beforeEach(async () => {
    contract = await Contract.new()
  })

  describe('game contract', () => {
    let gameId
    let hand
    let password
    let depositAmount
    let result
    let createGameResult

    beforeEach(async () => {
      gameId = 1
      hand = 0
      password = "password"
      depositAmount = 2
      await contract.createGame(hand, password, {from: user1, value: web3.utils.toWei(depositAmount.toString(), 'ether')})
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
      // test from frontend
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
          // test from frontend
        })
      })
      describe('failure', async() => {
        it('host player can not join hosted game', async () => {
          await contract.joinGame(gameId, hand, {from: user1, value: web3.utils.toWei(depositAmount.toString(), 'ether')}).should.be.rejected
        })
        it('insufficient deposit amount', async () => {
          await contract.joinGame(gameId, hand, {from: user1, value: web3.utils.toWei('1', 'ether')}).should.be.rejected
        })
      })

      describe('host player won the game', () => {

        describe('success', async() => {
          beforeEach(async () => {
            gameId = 1
            hand = 1
            await contract.joinGame(gameId, hand, {from: user2, value: web3.utils.toWei(depositAmount.toString(), 'ether')})
            hand = 0
            password = "password"
            result = await contract.gameResult(gameId, hand, password, {from: user1})
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
              beforeEach(async () => {
                result = await contract.getDepositedEtherFromWinner(1, {from: user1})
              })
              it('host player successfully withdrow deposited ether', async() => {
                result = await contract.getGameInfo(1, {from: deployer})
                result.gameStatus.toString().should.equal("5", 'game status is correct')
                result = await contract.balanceOf(user1, gameId)
                result.toString().should.equal("0", 'deposited balance is correct')
              })
            })
  
            describe('failure', async() => {
              it('get ether from loser', async () => {
                result = await contract.getDepositedEtherFromWinner(1, {from: user2}).should.be.rejected
              })
            })
          })
          
        })

        describe('failure', async() => {
          it('not host player', async () => {
            await contract.gameResult(gameId, hand, password, {from: user2}).should.be.rejected
          })
          it('hand does not match', async () => {
            await contract.gameResult(gameId, 2, password, {from: user1}).should.be.rejected
          })
          it('hand does not match', async () => {
            await contract.gameResult(gameId, hand, "wrong password", {from: user1}).should.be.rejected
          })
        })
      })

      describe('guest player won the game', () => {
        describe('success', async() => {
          beforeEach(async () => {
            gameId = 1
            hand = 2
            await contract.joinGame(gameId, hand, {from: user2, value: web3.utils.toWei(depositAmount.toString(), 'ether')})
            hand = 0
            password = "password"
            result = await contract.gameResult(gameId, hand, password, {from: user1})
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
              beforeEach(async () => {
                result = await contract.getDepositedEtherFromWinner(1, {from: user2})
              })
              it('host player successfully withdrow deposited ether', async() => {
                result = await contract.getGameInfo(1, {from: deployer})
                result.gameStatus.toString().should.equal("5", 'game status is correct')
                result = await contract.balanceOf(user2, gameId)
                result.toString().should.equal("0", 'deposited balance is correct')
              })
            })

            describe('failure', async() => {
              it('get ether from loser', async () => {
                result = await contract.getDepositedEtherFromWinner(1, {from: user1}).should.be.rejected
              })
            })
          })

        })
      })

      describe('drow game', () => {
        describe('success', async() => {
          beforeEach(async () => {
            gameId = 1
            hand = 0
            await contract.joinGame(gameId, hand, {from: user2, value: web3.utils.toWei(depositAmount.toString(), 'ether')})
            hand = 0
            password = "password"
            result = await contract.gameResult(gameId, hand, password, {from: user1})
          })

          it('successfully drwa the game', async() => {
            result = await contract.getGameInfo(1, {from: deployer})
            result.gameStatus.toString().should.equal("2", 'game status is correct')
            let depositedEther = result.depositAmount
            result = await contract.balanceOf(user1, gameId)
            result.toString().should.equal(depositedEther.toString(), 'deposited amount is correct')
            result = await contract.balanceOf(user2, gameId)
            result.toString().should.equal(depositedEther.toString(), 'deposited amount is correct')
          })
          
          describe('get deposited ether', () => {
            describe('success', async() => {
              it('successfully get deposited ether (host → guest)', async () => {
                // withdraw from host 
                result = await contract.getDepositedEther(1, {from: user1})
                result = await contract.getGameInfo(1, {from: deployer})
                result.gameStatus.toString().should.equal("2", 'game status is correct')
                let depositedEther = result.depositAmount
                result = await contract.balanceOf(user1, gameId)
                result.toString().should.equal("0", 'deposited balance is correct')
                result = await contract.balanceOf(user2, gameId)
                result.toString().should.equal(depositedEther.toString(), 'deposited amount is correct')
                // withdraw from guest
                result = await contract.getDepositedEther(1, {from: user2})
                result = await contract.getGameInfo(1, {from: deployer})
                result.gameStatus.toString().should.equal("5", 'game status is correct')
                result = await contract.balanceOf(user2, gameId)
                result.toString().should.equal("0", 'deposited balance is correct')
              })
              it('successfully get deposited ether (guest → host)', async () => {
                // withdraw from guest
                result = await contract.getDepositedEther(1, {from: user2})
                result = await contract.getGameInfo(1, {from: deployer})
                result.gameStatus.toString().should.equal("2", 'game status is correct')
                let depositedEther = result.depositAmount
                result = await contract.balanceOf(user1, gameId)
                result.toString().should.equal(depositedEther.toString(), 'deposited balance is correct')
                result = await contract.balanceOf(user2, gameId)
                result.toString().should.equal("0", 'deposited balnace is correct')
                // withdraw from host
                result = await contract.getDepositedEther(1, {from: user1})
                result = await contract.getGameInfo(1, {from: deployer})
                result.gameStatus.toString().should.equal("5", 'game status is correct')
                result = await contract.balanceOf(user1, gameId)
                result.toString().should.equal("0", 'deposited balance is correct')
              })
            })
  
            describe('failure', async() => {
              it('get ether from 3rd party', async () => {
                result = await contract.getDepositedEther(1, {from: user3}).should.be.rejected
              })
            })
          })

        })

      })

    })

  })

})
