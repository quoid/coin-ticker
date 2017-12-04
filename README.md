# Coin Ticker

A Safari extension that puts a configurable cryptocurrency ticker right in your browser.

![ticker image](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/ticker.png)

## Installation

Download the [latest coin_ticker.safariextz](https://github.com/quoid/coin-ticker/releases) release and double-click it to install or install it via the [Safari Extensions Gallery](https://safari-extensions.apple.com/details/?id=com.quoid.cointicker-J74Q8V8V8N).

## Usage

Once installed, and you've clicked the extension for the first time, you'll have to click the settings icon to set which coins you'd like to track.

![settings image](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/settings.png)

From here, you can tick the checkboxes of any coins you'd like to track. Once you exit the settings page, the ticker will update for the coins you've selected. You can update the coin data *manually* by clicking the `update` button. To respect API limits, you can only update the data once every 10 seconds. If you attempt to update the data more frequently, the update request will be deferred until 10 seconds has past since your previous update.

To make finding your coins easier, you can use the filter bar in the settings page to filter all available coins. You can also use the search flag `:checked` to only show coins you have already selected. You can only track, at max, 50 coins at one time.

You can add/remove coins at any time by going back into the settings page.

## Notes

- All data is from [CryptoCompare](https://www.cryptocompare.com) and generalized from multiple exchanges
- All prices are reflected in `$USD`
- Coin icons from [cryptocoins](https://github.com/allienworks/cryptocoins)
- Extension logo inspired by [Anton Kalik](https://thenounproject.com/antonkalik/)

## Pipeline

https://github.com/quoid/coin-ticker/milestones

<img src="https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/logo.png" width="64" height="64">
