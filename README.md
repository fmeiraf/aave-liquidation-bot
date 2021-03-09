# Aave Liquidation Bot

This is an an Aave liquidation bot using Flash Loans :)

### Instructions to run this

1. Clone this repo. <br>
2. Run : <pre>npm install</pre>
3. Create a .env file on the base directory, following the recommendations on (SAMPLE.env)<br>
4. Open a first terminal window, run the following to start the local database and keep updating itself: <pre>npm run start-db</pre>
5. FOR TESTING: on a second terminal window, to have a script selecting the best liquidation trade and running it on a mainnet/kovan fork, run: <pre>npm run test-contract</pre>
6. FOR LIVE EXECUTION on Kovan/Mainnet: on a second terminal window, t run: <pre>npm run execute-trades</pre>
