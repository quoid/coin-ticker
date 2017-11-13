# Coin Ticker

A Safari extension that puts a configurable cryptocurrency ticker right in your browser.

![ticker image](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/ticker.png)

## Installation

Download the [latest coin_ticker.safariextz](https://github.com/quoid/coin-ticker/releases) release and double-click it to install or install it via the [Safari Extensions Gallery](https://safari-extensions.apple.com/details/?id=com.quoid.cointicker-J74Q8V8V8N).

## Usage

Once installed, and you've clicked the extension for the first time, you'll have to click the settings icon to set which cryptocurrency pairs you'd like to track.

![settings image](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/settings.png)

Select all cryptocurrency pairs you'd like to track and then exit the settings page. Once you exit the settings the page, the ticker will update for the pairs you've selected. You can update the prices manually by clicking the refresh button. To respect API limits, you can only click the refresh button once every 3 seconds.

You can add/remove pairs at any time by going back into the settings page.

## Notes

*Currently*, the only markets supported are [GDAX](https://www.gdax.com) and [Poloniex](https://poloniex.com).

All prices are reflected in `$USD` and converted to `$USD` by the GDAX `BTC-USD` price.


## Pipeline

https://github.com/quoid/coin-ticker/issues/7