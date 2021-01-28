## ROADMAP

X - create initial script that builds localdb with all user reserves
X - create script that will look for events and request the new userReserve of that user, then update DB
X - create a script that will request all reserves updated and store it in db
X - create script to get updated reserve data
X - update aave-js package to use the new Graphs (old one is using different fields)
X - find minimal calculation to keep in the db to classify potential liquidation opportunities
X - use aave-js package to calculate parameters and create a queue for liquidation

- create solidity code for the flash loan call
- use hardhat to create a test for executing the transaction on a given block
- Find a way to execute the transaction on my node
- deploy bot
- Hope it works and don't be frontrunned and be happy
