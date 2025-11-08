# Image Usage Guide - WebP with PNG Fallback

## How to Use WebP Images in HTML

Replace old `<img>` tags with `<picture>` elements for WebP with PNG fallback:

### Before:
```html
<img src="images/backgrounds/main-game-bg.png" alt="Main game background">
```

### After:
```html
<picture>
    <source srcset="images/backgrounds/main-game-bg.webp" type="image/webp">
    <img src="images/backgrounds/main-game-bg.png" alt="Main game background">
</picture>
```

## In CSS (Background Images)

```css
/* Use WebP with fallback */
.element {
    background-image: url('images/backgrounds/main-game-bg.png'); /* Fallback */
    background-image: url('images/backgrounds/main-game-bg.webp'); /* Modern browsers */
}

/* Or use @supports */
.element {
    background-image: url('images/backgrounds/main-game-bg.png');
}

@supports (background-image: url('test.webp')) {
    .element {
        background-image: url('images/backgrounds/main-game-bg.webp');
    }
}
```

## In JavaScript

```javascript
// Feature detection
function supportsWebP() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
}

const ext = supportsWebP() ? '.webp' : '.png';
const imagePath = `images/backgrounds/main-game-bg${ext}`;
```

## Converted Images:

15 images processed
15 successfully converted
0 skipped
0 failed

Total size reduction: 93.2%
Original size: 16.84MB
New size: 1.15MB
Savings: 15.69MB

## Browser Support

WebP is supported by:
- ✅ Chrome 23+
- ✅ Firefox 65+
- ✅ Edge 18+
- ✅ Safari 14+ (iOS 14+)
- ✅ Opera 12.1+

Fallback PNG ensures 100% compatibility.
