# Redis Pub/Sub Listener GUI

### Filter

To filter the response, just write your filter based on following pattern:

```
key => CONDITION
```

For example, I want to filter the response just if the `size` is `50`

```
size => size === 50
```

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
    size: (size) => size === 50 || size === 70,
    color: (color) => ['blue', 'black'].includes(color.toLowerCase()),
    locations: (locations) =>
        locations.find((x) => ['JAPAN', 'USA'].includes(x.toUpperCase())),
    details: (details) => details.length < 30 && details.width >= 70
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
    size: (size) => size === 50 || size === 70,
    color: (color) => ['blue', 'black'].includes(color.toLowerCase()),
    details: (details) => details.length < 30 && details.width >= 70,
    locations: (locations) => {
        if (locations.includes('USA')) return true; // case sensitive
        if (locations.includes('Japan')) return true; // case sensitive

        const url = window.location.pathname.toLowerCase();
        if (url.includes('/en-us/')) return true; // not case sensitive
        if (url.includes('/es/')) return true; // not case sensitive
        return false;
    }
};
```
