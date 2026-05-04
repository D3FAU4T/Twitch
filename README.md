# Twitch

A wrapper for Twitch APIs as a modern alternative to tmi.js. The documentation is currently very limited, but will improve gradually.

## Example

```ts
import Client from "./src/core/Client";

const client = new Client({
    clientId: Bun.env.TWITCH_CLIENT_ID,
    accessToken: Bun.env.TOKEN,
    userId: "<your bot id here>",
    broadcasterUserId: "<your channel id here>",
});

client.on("channel.chat.message", (notification) => {
    console.log(notification);
});

client.on("stream.online", (notification) => {
    console.log("Stream online event:", notification.event);
});

await client.subscribe({
    type: "stream.online",
    version: "1",
    condition: {
        broadcaster_user_id: "<your channel id here>",
    },
});

await client.connect();
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.13. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
