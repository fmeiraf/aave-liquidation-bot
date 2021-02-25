//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { FlashLoanReceiverBase } from "./FlashLoanReceiverBase.sol";
import { IUniswapV2Router02 } from "../interfaces/IUniswapV2Router02.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
  ILendingPoolAddressesProvider
} from "../interfaces/ILendingPoolAddressesProvider.sol";

contract LiquidatorDebug is Ownable, FlashLoanReceiverBase {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IUniswapV2Router02 public uniswapRouter;
  address public UNISWAP_ROUTER_ADDRESS =
    0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

  address public PROFIT_RECIPIENT = 0xAeA2dF19506eA7bc1b3AA82f29a3115c77f0c21e;

  constructor(ILendingPoolAddressesProvider _addressProvider)
    public
    FlashLoanReceiverBase(_addressProvider)
  {
    uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
  }

  function changeProfitRecipient(address recipient) public onlyOwner {
    PROFIT_RECIPIENT = recipient;
  }

  function getProfitRecipient() public view returns (address) {
    return PROFIT_RECIPIENT;
  }

  struct DebugInfo {
    uint256 debtAssetInitialBalance;
    uint256 collateralBalanceAfterLiquidation;
    uint256 debtAssetAfterLiquidation;
    uint256 debtAmountNeedinSwap;
    uint256 debtAssetFinalBalance;
    uint256 collateralBalanceAfterSwap;
  }

  function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external override returns (bool) {
    //
    // This contract now has the funds requested.
    // Your logic goes here.
    //
    DebugInfo memory debugInfo;

    //decoding final params
    (address collateralAddress, address liquidableUser) =
      abi.decode(params, (address, address));

    debugInfo.debtAssetInitialBalance = IERC20(assets[0]).balanceOf(
      address(this)
    );

    console.log(
      "The balance of Debt token at the start of Flash Loan run",
      debugInfo.debtAssetInitialBalance
    );
    //approving funds to be withdraw by Aave to pay the user debt
    require(
      IERC20(assets[0]).approve(address(LENDING_POOL), amounts[0]),
      "Approval error"
    );

    //making the liquidation call
    LENDING_POOL.liquidationCall(
      collateralAddress,
      assets[0],
      liquidableUser,
      uint256(-1),
      false
    );

    debugInfo.debtAssetAfterLiquidation = IERC20(assets[0]).balanceOf(
      address(this)
    );

    //swaping collateral for debt to pay the flashLoan
    address[] memory path = new address[](2);
    path[0] = collateralAddress;
    path[1] = assets[0];

    // checking collateral balance after liquidation
    debugInfo.collateralBalanceAfterLiquidation = IERC20(collateralAddress)
      .balanceOf(address(this));
    require(
      debugInfo.collateralBalanceAfterLiquidation > uint256(0),
      "There is no collateral balance"
    );

    console.log(
      "Amount of collateral received ",
      debugInfo.collateralBalanceAfterLiquidation
    );

    // aproving funds to be pulled by Uni + swaping collateral by debt asset
    require(
      IERC20(collateralAddress).approve(
        address(UNISWAP_ROUTER_ADDRESS),
        debugInfo.collateralBalanceAfterLiquidation
      ),
      "Approval error"
    );
    // uniswapRouter.swapExactTokensForTokens(
    //   debugInfo.collateralBalanceAfterLiquidation,
    //   0,
    //   path,
    //   address(this),
    //   block.timestamp + 5
    // );

    debugInfo.debtAmountNeedinSwap = uint256(0)
      .add(debugInfo.debtAssetInitialBalance)
      .sub(debugInfo.debtAssetAfterLiquidation)
      .add(premiums[0]);

    console.log(
      "Amount payed for debt",
      uint256(0).add(debugInfo.debtAssetInitialBalance).sub(
        debugInfo.debtAssetAfterLiquidation
      )
    );

    console.log("Amount being asked for swap", debugInfo.debtAmountNeedinSwap);

    uniswapRouter.swapTokensForExactTokens(
      debugInfo.debtAmountNeedinSwap,
      debugInfo.collateralBalanceAfterLiquidation,
      path,
      address(this),
      block.timestamp + 5
    );

    debugInfo.debtAssetFinalBalance = IERC20(assets[0]).balanceOf(
      address(this)
    );
    console.log(
      "The final debt balance in before paying fees",
      debugInfo.debtAssetFinalBalance
    );

    debugInfo.collateralBalanceAfterSwap = IERC20(collateralAddress).balanceOf(
      address(this)
    );

    console.log(
      "Collateral Balance after swap: ",
      debugInfo.collateralBalanceAfterSwap
    );

    console.log("PRemium being paid", premiums[0]);
    console.log(
      "Premium / loan",
      premiums[0].div(debugInfo.debtAssetInitialBalance)
    );

    // At the end of your logic above, this contract owes
    // the flashloaned amounts + premiums.
    // Therefore ensure your contract has enough to repay
    // these amounts.

    // Approve the LendingPool contract allowance to *pull* the owed amount
    for (uint256 i = 0; i < assets.length; i++) {
      uint256 amountOwing = amounts[i].add(premiums[i]);
      IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
    }

    return true;
  }

  function callFlashLoan(
    address debtAsset,
    address collateralAddress,
    address liquidableUser,
    uint256 loanAmount
  ) public onlyOwner {
    address receiverAddress = address(this);

    address[] memory assets = new address[](1);
    assets[0] = address(debtAsset);

    uint256[] memory amounts = new uint256[](1);
    amounts[0] = loanAmount;

    uint256[] memory modes = new uint256[](1);
    modes[0] = 0;

    address onBehalfOf = address(this);
    bytes memory params =
      abi.encode(address(collateralAddress), address(liquidableUser));
    uint16 referralCode = 0;

    LENDING_POOL.flashLoan(
      receiverAddress,
      assets,
      amounts,
      modes,
      onBehalfOf,
      params,
      referralCode
    );
    console.log("Finsihed flash loan");

    uint256 finalCollateralAssetValue =
      IERC20(address(collateralAddress)).balanceOf(address(this));
    console.log(
      "Final Collateral asset value - After Flash Loan: ",
      finalCollateralAssetValue
    );

    require(finalCollateralAssetValue > 0, "No balance to transfer");

    address profitRecipient = owner(); //using the owner here is easier for debug reasons, in prod this should be profitRecipient

    require(
      IERC20(address(collateralAddress)).transfer(
        profitRecipient,
        finalCollateralAssetValue
      ),
      "Tranfer didn't go through"
    );
  }
}
