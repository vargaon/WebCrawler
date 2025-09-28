import { parentPort } from 'worker_threads';
import { WorkerTask } from './worker-task.interface';
import { url } from 'inspector';

const axios = require('axios');
const cheerio = require('cheerio');
const blockedExtRegex =
  /\.(jpg|jpeg|png|gif|webp|svg|pdf|docx?|xlsx?|pptx?|zip|rar|7z|tar|gz|mp3|mp4)([#?]|$)/i;

function isRelativeUrl(url: string) {
  const pattern = new RegExp('^(/|./)', 'i');
  return pattern.test(url);
}

parentPort.on('message', async (task: WorkerTask) => {
  const startNodeCrawlingTime = Date.now();
  const links = new Set<string>();

  try {
    const response = await axios.get(task.url);
    const $ = cheerio.load(response.data);

    const title = $('title').text();

    $('a').each((i, link) => {
      let url = $(link).attr('href');

      if (isRelativeUrl(url)) {
        url = new URL(url, task.url).href;
      }

      url = normalizeUrlRaw(url);

      if (url && url !== '' && url !== task.url && !blockedExtRegex.test(url)) {
        links.add(url);
      }
    });

    parentPort.postMessage({
      type: 'success',
      nodeId: task.nodeId,
      crawlingResult: {
        title,
        links: Array.from(links),
        crawlingTime: Date.now() - startNodeCrawlingTime,
        executionId: task.executionId,
        linkRe: task.linkRe,
      },
    });
  } catch (error) {
    parentPort.postMessage({
      type: 'error',
      nodeId: task.nodeId,
      message: error.message,
      executionId: task.executionId,
      url: task.url,
    });
  }
});

function normalizeUrlRaw(url: string, removeTrailingSlash = true): string {
  if (!url) return url;
  let s = url.trim();

  try {
    const u = new URL(s);

    // vyčistit pathname od více lomítek
    u.pathname = u.pathname.replace(/([^:]\/)\/+/g, '$1');

    // odebrat trailing slash, pokud chceme
    if (removeTrailingSlash && u.pathname !== '/') {
      u.pathname = u.pathname.replace(/\/+$/, '');
    }

    // zahodit query i hash
    u.search = '';
    u.hash = '';

    return u.origin + u.pathname;
  } catch {
    // fallback pro případy, kdy to není validní absolute URL
    s = s.replace(/([^:]\/)\/+/g, '$1'); // collapse //
    if (removeTrailingSlash) {
      s = s.replace(/\/+$/g, '');
    }
    // odříznout query a fragmenty
    s = s.split(/[?#]/)[0];
    return s;
  }
}
