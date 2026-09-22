// Genera assets/cv/Caleb_Churata_CV.pdf a partir de cv/index.html usando el
// Chrome del sistema (no descarga un Chromium propio). Correr con el sitio
// servido localmente, ej: python3 -m http.server 8731
const path = require('path');

(async () => {
  const { default: puppeteer } = await import('puppeteer-core');
  const url = process.argv[2] || 'http://localhost:8731/cv/index.html';
  const out = process.argv[3] || path.join(__dirname, '../assets/cv/Caleb_Churata_CV.pdf');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: out,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
  });
  await browser.close();
  console.log('CV PDF generado en', out);
})();
