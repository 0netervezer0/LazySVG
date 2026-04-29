export function exportSVG(pathD) {
  return `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <path d="${pathD}" fill="none" stroke="black" stroke-width="2"/>
</svg>`;
}

export function exportHTML(pathD) {
  const svgContent = exportSVG(pathD);
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