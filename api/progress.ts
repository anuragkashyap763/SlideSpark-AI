// // api/progress.ts
// export const config = {
//   runtime: "edge",
// };

// export default async function handler() {
//   const encoder = new TextEncoder();

//   const stream = new ReadableStream({
//     start(controller) {
//       let progress = 0;
//       const interval = setInterval(() => {
//         progress += 10;
//         controller.enqueue(encoder.encode(`data: ${progress}\n\n`));
//         if (progress >= 100) {
//           clearInterval(interval);
//           controller.close();
//         }
//       }, 400);
//     },
//   });

//   return new Response(stream, {
//     headers: {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache",
//       Connection: "keep-alive",
//     },
//   });
// }


























// api/progress.ts
export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let progress = 0;

  const interval = setInterval(() => {
    progress += 10;
    res.write(`data: ${progress}\n\n`);

    if (progress >= 100) {
      clearInterval(interval);
      res.write("data: done\n\n");
      res.end();
    }
  }, 400);
}

