import { sleep, randomIntFromInterval } from "./utils";

async function fakeAPI(opts = {}) {
  const url = `https://jsonplaceholder.typicode.com/posts?_page=1&_limit=10`;
  const res = await fetch(url, opts);
  await sleep(randomIntFromInterval(500, 3000), opts);
  return await res.json();
}

export default function apiSearch() {
  const controller = new AbortController(); // new controller for each request
  const signal = controller.signal;
  const request = fakeAPI({ signal });
  // const request = sleep(randomIntFromInterval(500, 3000), { signal });
  return { request, controller };
}
