import { parentPort } from 'worker_threads';
import { WorkerTask } from './worker-task.interface';

const axios = require('axios');
const cheerio = require('cheerio');

function isRelativeUrl(url: string) {
  const pattern = new RegExp('^(/|./)', 'i');
  return pattern.test(url);
}

parentPort.on('message', async (task: WorkerTask) => {
  const startNodeCrawlingTime = Date.now();
  const response = await axios.get(task.url);
  const $ = cheerio.load(response.data);

  const title = $('title').text();
  const links = new Set<string>();

  $('a').each((i, link) => {
    links.add($(link).attr('href'));
  });

  const linksArray = Array.from(links).map((link) => {
    if (isRelativeUrl(link)) {
      return task.url + link.replace(/^\./, '');
    }
    return link;
  });

  const nodeCrawlingTime = Date.now() - startNodeCrawlingTime;

  parentPort.postMessage({
    type: 'finishedCrawling',
    nodeId: task.nodeId,
    crawlingResult: {
      title,
      links: linksArray.filter((link) => Boolean(link)),
      crawlingTime: nodeCrawlingTime,
    },
  });
});
