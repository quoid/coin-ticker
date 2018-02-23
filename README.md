# Coin Ticker

Sandbox for playing with the [Coin Ticker Safari extension](https://github.com/quoid/coin-ticker)

- `gulp` to build sass variable in `src/_sass/_coins.scss` for the icons in the `src/img/coins` folder
- `JEKYLL_ENV=production jekyll build`
    - removes the `start` button used in development
    - adds the safari specific functions for google analytics
    
run `gulp`:
    - creates `icons.js` file
    - creates filename array from files in `/img/coins` folder
    - create `coins.scss`
        - sass variable to create background image classes
    - deletes `icons.js`