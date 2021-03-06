# Coin Ticker

<img src="https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/logo.png" width="64" height="64">

A Safari, Chrome & Firefox extension that puts a configurable cryptocurrency ticker right in your browser.

![ticker image](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/safari/Screenshot.png)

## Installation

**Safari**

Download the [latest coin_ticker.safariextz](https://github.com/quoid/coin-ticker/releases) release and double-click it to install or install it via the [Safari Extensions Gallery](https://safari-extensions.apple.com/details/?id=com.quoid.cointicker-J74Q8V8V8N). If you've made it to this page, I would **highly** suggest installing the extension through Github as it is the latest version.

The version in the [Safari Extensions Gallery](https://safari-extensions.apple.com/details/?id=com.quoid.cointicker-J74Q8V8V8N) is **not currently up to date** with the version here, on Github.

Developed for Safari 7+.

**Chrome**

Head over to the [Chrome Extension Store](https://chrome.google.com/webstore/detail/cointicker/heohpoipgmadpdmafmddijgdckhnhaml) and install the extension from there.

Developed for Chrome 55+.

**Firefox**
Install on Firefox through the [Firefox Add-on page](https://addons.mozilla.org/en-US/firefox/addon/coin-ticker/).

## Usage

Upon first launch of the extension, there will be a short list of default coins displayed the ticker. You can change the coins that will be displayed in the ticker by clicking the `+` icon in the top bar of the extension.

![first launch](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/gif/first.gif)

To make finding your coins easier, you can use the filter bar on the tracking page to sort through all the different coins available.

![add coins](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/gif/add.gif)

You can use the search flag `:checked` within the filter bar to *only* show the coins that are currently selected. This makes "de-selecting" coins much easier. 

![filter coins](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/gif/checked.gif)

By default the coins are ordered by their rank on [CoinMarketCap](https://coinmarketcap.com) at around the time of the last update. Ranks change often, so don't expect the ranks in this extension to be reflective of the current coin rank (but it should be close).

You can reorder the coins by dragging and dropping from *their icons*.

![reorder coins](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/gif/drag.gif)

## Currencies
Prices can be reflected in the following fiat currencies: `"AUD", "BRL", "CAD", "CHF", "CLP", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PKR", "PLN", "RUB", "SEK", "SGD", "THB", "TRY", "TWD", "ZAR"`

You can also choose to show prices in `BTC`.

You can change the currency settings on the settings page.

![change currency](https://raw.githubusercontent.com/quoid/coin-ticker/sandbox/etc/gif/settings.gif)

## Notes
- All data is from [CoinMarketCap](https://coinmarketcap.com)
- Coin icons from a personal fork of [cryptocoins](https://github.com/quoid/cryptocoins)
- Extension logo inspired by [Anton Kalik](https://thenounproject.com/antonkalik/)
- Because of API limits, the price data updates every 60 seconds

## Pipeline

https://github.com/quoid/coin-ticker/milestones

## Donate

## License

[Open Software License 3.0](https://choosealicense.com/licenses/osl-3.0/)