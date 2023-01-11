const chromium = require("chrome-aws-lambda");

exports.handler = async (event) => {
  const url = event.queryStringParameters.url;
  const pg = event.queryStringParameters.pg;

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    headless: true,
    ignoreHTTPSErrors: true,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  const buffer = await page.pdf({
    pageRanges: pg,
    displayHeaderFooter: true,
    footerTemplate: `
          <div style="color: lightgray; border-top: solid lightgray 1px; font-size: 6px; padding-top: 5px; text-align: center; width: 100%;">
            <span>© 2022 The American Road & Transportation Builders Association (ARTBA).  All rights reserved. No part of this document may be reproduced or transmitted in any form or by any means, electronic, mechanical, photocopying, recording, or otherwise, without prior written permission of ARTBA. </span> - <span class="pageNumber"></span>
          </div>
        `,
    format: "letter",
    margin: {
      bottom: 100, // minimum required for footer msg to display
      left: 25,
      right: 35,
      top: 100,
    },
    printBackground: true,
  });

  return {
    statusCode: 200,
    headers: {
      "Content-type": "application/pdf",
    },
    body: buffer.toString("base64"),
    isBase64Encoded: true,
  };
};
