# Coin Ticker

<img src="https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/logo.png" width="64" height="64">

A Safari extension that puts a configurable cryptocurrency ticker right in your browser.

![ticker image](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/ticker.png)

## Installation

Download the [latest coin_ticker.safariextz](https://github.com/quoid/coin-ticker/releases) release and double-click it to install or install it via the [Safari Extensions Gallery](https://safari-extensions.apple.com/details/?id=com.quoid.cointicker-J74Q8V8V8N). If you've made it to this page, I would **highly** suggest installing the extension through Github as it is the latest version.

The version in the [Safari Extensions Gallery](https://safari-extensions.apple.com/details/?id=com.quoid.cointicker-J74Q8V8V8N) is **not currently up to date** with the version here, on Github.

## Usage

Once installed head over to the settings page, but clicking the settings icon, and select the coins you'd like to track.

![adding coins](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/addcoins.gif)

To make finding your coins easier, you can use the filter bar in the settings page to filter all available coins. You can also use the search flag `:checked` to only show coins you have already selected. 

![filter coins](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/checked.gif)

You can only track, at max, 50 coins at one time.

When you leave the settings page the ticker will grab the prices and data for the coins you selected.

You can update the coin data *manually* by clicking the `update` button. To respect API limits, you can only update the data once every 10 seconds.

By default, the coins in ticker are ordered alphabetically (the same order you see in the settings page). You can reorder the coins by dragging and dropping them by their icons.

![reorder coins](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/reorder.gif)

## Notes

- All data is from [CryptoCompare](https://www.cryptocompare.com) and generalized from multiple exchanges
- All prices are reflected in `$USD`
- Coin icons from [cryptocoins](https://github.com/allienworks/cryptocoins)
- Extension logo inspired by [Anton Kalik](https://thenounproject.com/antonkalik/)

## Pipeline

https://github.com/quoid/coin-ticker/milestones

## Coins Requests

If you aren't able to track a coin that you'd like to, please make a github issue and **assign the request label** to it. I will make sure to include the coin in the next update.
