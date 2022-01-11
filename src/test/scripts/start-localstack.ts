#!/usr/bin/env ts-node-script

import { sync } from "cross-spawn";
import * as path from "path";

const ROOT_DIR = path.join(__dirname, "..");

/** LocalStack uses bridge mode networking, so the "dockerize" pattern doesn't work */
export async function startLocalStack() {
  const { status } = sync("docker-compose", ["up", "-d", "localstack"], {
    cwd: ROOT_DIR,
  });
  if (status !== 0) {
    throw new Error("Failed to start docker-compose!");
  }

  await waitForLocalStack();
}

async function waitForLocalStack() {
  while (true) {
    const { status } = sync("curl", ["http://localhost:4566"]);
    if (status !== 0) {
      console.info("LocalStack is not ready. Waiting 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      console.info("LocalStack is up!");
      break;
    }
  }
}

if (require.main === module) {
  startLocalStack();
}
