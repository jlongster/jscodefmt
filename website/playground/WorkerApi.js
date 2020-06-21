export default function (source) {
  const worker = new Worker(source);
  let counter = 0;
  const handlers = {};

  worker.addEventListener("message", (event) => {
    const { uid, message, error } = event.data;

    if (!handlers[uid]) {
      return;
    }

    const [resolve, reject] = handlers[uid];
    delete handlers[uid];

    if (error) {
      reject(error);
    } else {
      resolve(message);
    }
  });

  function postMessage(message) {
    const uid = ++counter;
    return new Promise((resolve, reject) => {
      handlers[uid] = [resolve, reject];
      worker.postMessage({ uid, message });
    });
  }

  return {
    getMetadata() {
      return postMessage({ type: "meta" });
    },
    format(code, options, debug) {
      return postMessage({ type: "format", code, options, debug });
    },
    postMessage,
  };
}
