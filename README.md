# Redis Pub/Sub Listener GUI

![Redi Pub/Sub GUI](./screenshot.png 'Redi Pub/Sub GUI')

## Top Bar

Just write the redis enter the `host` and `port` or just leave it with the defaults. after that you can click on `Start` button to listen and recieve the message on default channels.

You can also `Stop` to recieving any message fron the channels.

There is another `Clear` button that help to remove and cleare recieved messages from redis channels.

You can find to `Up`/`Down` button, these help you to increase or decrase the font of console.

# Settings

The `Eye Button`, it helps you to follow the console logs and scroll down or up without any concern about news logs and auto scrolling issue.

The `Save` button save all things that you write in inputs or set on the switches.

The `Load` button also helps you to reload the saved settings.

Pay attention that you can save only one settings and use it for all of your channel pages.

# SSH Client

IF you need to connect the redis on another server with SSh, you can switch it `on` and write down your credentials. and then start the listener.

# Another huge SETTINGS

Default channel is `info`, if you want to listen on another channel, just write down the channel name before you click on `start` button.

Can you see the little buggy counter box with the silly plus/mines buttons? that helps you to set the logs stock size. the default set on 500, if you have strong and crazy system, just increase the number.

### Filter

To filter the response, just write your filter based on following pattern:

```
key => CONDITION
```

For example, I want to filter the response just if the `size` is `50`

```
size => size === 50
```

**Pay attentions: until you click on `Submit Filter`, there filter doesn't make any effect on logs, so whene you wrote down the filter, just click on _Submit Button_**

**For condition you can use any javascript methods that help you to filter the data.**

If you have more than one condition, just write another condition on the **Next Line**:

```
size => size === 50
color => color === 'Blue'
```

This is a complete example:

```javascript
const products = [
  {
    name: 'A',
    color: 'Blue',
    size: 50,
    locations: ['USA', 'Europe'],
    details: { length: 20, width: 70 }
  },
  {
    name: 'B',
    color: 'Blue',
    size: 60,
    locations: [],
    details: { length: 20, width: 70 }
  },
  {
    name: 'C',
    color: 'Black',
    size: 70,
    locations: ['Japan'],
    details: { length: 20, width: 71 }
  },
  {
    name: 'D',
    color: 'Green',
    size: 50,
    locations: ['USA'],
    details: { length: 20, width: 71 }
  }
];

const filters = {
  size: size => size === 50 || size === 70,
  color: color => ['blue', 'black'].includes(color.toLowerCase()),
  locations: locations =>
    locations.find(x => ['JAPAN', 'USA'].includes(x.toUpperCase())),
  details: details => details.length < 30 && details.width >= 70
};

// RESULT:
// [
//     {
//         name: 'A',
//         color: 'Blue',
//         size: 50,
//         locations: ['USA', 'Europe'],
//         details: { length: 20, width: 70 }
//     },
//     {
//         name: 'C',
//         color: 'Black',
//         size: 70,
//         locations: ['Japan'],
//         details: { length: 20, width: 71 }
//     }
// ]
```

Another filter example:

```javascript
const filters = {
  size: size => size === 50 || size === 70,
  color: color => ['blue', 'black'].includes(color.toLowerCase()),
  details: details => details.length < 30 && details.width >= 70,
  locations: locations => {
    if (locations.includes('USA')) return true; // case sensitive
    if (locations.includes('Japan')) return true; // case sensitive

    const url = window.location.pathname.toLowerCase();
    if (url.includes('/en-us/')) return true; // not case sensitive
    if (url.includes('/es/')) return true; // not case sensitive
    return false;
  }
};
```
