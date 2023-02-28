const express = require("express");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const app = express();

const PAGE_PUPPETER_OPTS = {
  networkIdle2Timeout: 5000,
  waitUntil: 'networkidle2',
  timeout: 300000,
}

const URL = 'https://regex101.com/';

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

function fixAttr(valOfattr, URL) {
  if(!/(^https:\/\/)|(.ru)|(.com)/.test(valOfattr) && valOfattr) {
    valOfattr = valOfattr.replace(/^\/+/, '');
    return `${URL}${valOfattr}`;
  }
  return ''
}


async function getPageContent(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto(url, PAGE_PUPPETER_OPTS);
    const loadeadContent = await page.content();
    await browser.close();

    return loadeadContent;

  } catch(err) {throw err}
}

app.get('/', asyncMiddleware(async (req, res) => {
  try {
    const pageContent = await getPageContent(URL);
    const $ = await cheerio.load(pageContent);

    $('link[href]').each((_, el) => $(el).attr('href',(_,attr) => fixAttr(attr, URL)))
    $('script[src]').each((i, el) => $(el).attr('src',(_,attr) => fixAttr(attr, URL)))

    res.send($.html())
  } catch(err) {throw err} 
}));

app.listen(8080)
