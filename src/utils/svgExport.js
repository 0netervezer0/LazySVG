export function exportSVG(pathD, strokeWidth = 2, fillColor = "none", strokeColor = "black", fillEnabled = false, pointsLength = 0) {
  const fill = fillEnabled && pointsLength > 2 ? fillColor : "none";
  return `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <path d="${pathD}" fill="${fill}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
</svg>`;
}

export function exportHTML(pathD, strokeWidth = 2, fillColor = "none", strokeColor = "black", fillEnabled = false, pointsLength = 0) {
  const svgContent = exportSVG(pathD, strokeWidth, fillColor, strokeColor, fillEnabled, pointsLength);
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SVG Figure</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    svg {
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 100%;
      max-width: 600px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>SVG Figure</h1>
    ${svgContent}
  </div>
</body>
</html>`;
}