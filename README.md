# 🎨 LazySVG - Interactive SVG Editor
[Доступно на Русском 🇷🇺](README-RU.md)

A simple web tool for creating vector shapes with support for Bézier curves.

## ✨ Features

- **Line Mode** - Create shapes from straight lines
- **Bezier Mode** - Create smooth curves with automatic control points
- **Visualization** - Visible points and control points on the canvas
- **Grid** - Background grid for easy positioning
- **Export** - Copy SVG and HTML code for use in projects
- **Interactive Canvas** - Add points with a simple click

## 🚀 Quick Start

```bash
# Install Dependencies
npm install

# Run the Dev Server
npm run dev
```

## 📖 How to use

### Adding points
1. Select the mode (Line or Bezier) on the left
2. Click on a white area of ​​the canvas to add a point
3. The points will be connected by lines or curves, depending on the selected mode

### Line mode
- Creates sharp angles between points
- Ideal for simple geometric shapes

### Bezier mode
- Automatically creates control points for smooth curves
- Visually displays control points (blue and green circles)
- Best for organic shapes and smooth curves

### Export
1. Copy the SVG code from the "SVG Code" section
2. Use the HTML code from the "HTML Code" section or paste the SVG into your project

## 🏗️ Architecture

```
src/
├── App.jsx # Main Application Component
├── components/
│ ├── Canvas.jsx # SVG canvas
│ ├── Point.jsx # Point on canvas
│ ├── Toolbar.jsx # Mode selector
│ └── BezierControls.jsx # Control point editor
├── hooks/
│ └── useDrag.js # Hook for dragging elements
├── store/
│ └── shapeStore.js # State store
├── utils/
│ ├── pathGenerator.js # SVG path generator
│ └── svgExport.js # SVG/HTML Export
└── main.jsx # Entry Point

styles/
└── global.css # Global Styles
```

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **Vite 8** - Build and Dev Server
- **SVG** - Vector Graphics
- **CSS3** - Styling

## 📝 Usage Examples

### Exported SVG Code

You can copy the SVG code and paste it:

```html
<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <path d="M" 152 252 C 212 252 192 102 252 102 ..."
  fill="none" stroke="black" stroke-width="2"/>
</svg>
```

### Full HTML Page

Export an HTML file with embedded SVG and styles for quick use.

## 📱 Compatibility

- Works in modern browsers (Chrome, Firefox, Safari, Edge)
- Supports touchscreens on mobile devices
- Responsive design for various screen sizes

## 📄 License

[MIT License](LICENSE.txt)

Created with ❤️ for vector designers!
