#!/usr/bin/env node

import { Logger } from "@perf-profiler/logger";
import { program } from "commander";
import { deploy } from "./deploy";

program
  .command("deploy")
  .description("Deploy to Netlify. Smaller package size than Netlify CLI")
  .requiredOption("--auth <authorizationToken>", "Netlify auth token")
  .requiredOption("--site <siteId>", "Netlify site id")
  .requiredOption("--dir <folderPath>", "Folder to be deployed")
  .option("--prod", "Deploy to production or draft")
  .action(async (options) => {
    const url = await deploy({
      authorizationToken: options.auth,
      siteId: options.site,
      folderPath: options.dir,
      draft: !options.prod,
    });

    Logger.success(`Report deployed to ${url}`);
  });

program.parse();
