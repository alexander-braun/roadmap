/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  setTimeout(() => {
    postMessage('cookie expired');
  }, data * 1000 - new Date().getTime());
});
