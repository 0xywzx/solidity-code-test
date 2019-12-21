var GameContract = artifacts.require("./GameContract.sol");

module.exports = function(deployer) {
  deployer.deploy(GameContract).then(instance => {
    console.log('ABI:',JSON.stringify(instance.abi))
  })  
};