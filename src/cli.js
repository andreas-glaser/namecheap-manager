#!/usr/bin/env node
// path: src/cli.js
const { Command } = require("commander");
const NamecheapClient = require("./namecheapClient");
const client = new NamecheapClient();
const { parseTTL } = require("./utils/ttl");

const program = new Command();
program
  .name("namecheap-manager")
  .version("1.0.0")
  .description("Minimal Namecheap DNS and Domain Privacy helper");

/* ───────── Domain commands ───────── */
program
  .command("domains:list")
  .description("List all domains in your Namecheap account")
  .option("--page <n>", "Page number (default 1)", 1)
  .option("--size <n>", "Page size 1-100 (default 100)", 100)
  .action(async (opts) => {
    try {
      const list = await client.listDomains(
        Number(opts.page),
        Number(opts.size),
      );
      console.table(list);
    } catch (err) {
      console.error("Error listing domains:", err.message);
      process.exit(1);
    }
  });

/* ───────── DNS Record commands ───────── */
program
  .command("dns:list <domain>")
  .description("List DNS records for a domain")
  .action(async (domain) => {
    try {
      const records = await client.getHosts(domain);
      console.table(records);
    } catch (err) {
      console.error(`Error fetching DNS records for ${domain}:`, err.message);
      process.exit(1);
    }
  });

program
  .command("dns:add <domain> <name> <type> <value>")
  .description("Add a new DNS record")
  .option(
    "--ttl <value>",
    "TTL: auto | 1m | 5m | 20m | 30m | 60m | <seconds>",
    "30m",
  )
  .option("--mx <pref>", "MX preference")
  .action(async (domain, name, type, value, opts) => {
    try {
      await client.addHosts(domain, [
        {
          name,
          type: type.toUpperCase(),
          address: value,
          ttl: parseTTL(opts.ttl),
          mxPref: opts.mx,
        },
      ]);
      console.log("Record added.");
    } catch (err) {
      console.error(`Error adding DNS record for ${domain}:`, err.message);
      process.exit(1);
    }
  });

program
  .command("dns:delete <domain> <hostId...>")
  .description("Delete DNS record(s) by HostID")
  .action(async (domain, ids) => {
    try {
      await client.deleteHosts(domain, ids);
      console.log("Record(s) removed.");
    } catch (err) {
      console.error(`Error deleting DNS record(s) for ${domain}:`, err.message);
      process.exit(1);
    }
  });

/* ───────── Domain Privacy (WhoisGuard) ───────── */
program
  .command("privacy:status <domain>")
  .description("Show domain privacy status for a domain")
  .action(async (domain) => {
    try {
      const status = await client.getWhoisStatus(domain);
      console.log(`Privacy status for ${domain}: ${status}`);
    } catch (err) {
      console.error(
        `Error fetching privacy status for ${domain}:`,
        err.message,
      );
      process.exit(1);
    }
  });

program
  .command("privacy:enable <domain>")
  .description("Enable domain privacy (WhoisGuard) for a domain")
  .action(async (domain) => {
    try {
      await client.enablePrivacy(domain);
      console.log("Domain privacy enabled.");
    } catch (err) {
      console.error(`Error enabling privacy for ${domain}:`, err.message);
      process.exit(1);
    }
  });

program
  .command("privacy:disable <domain>")
  .description("Disable domain privacy (WhoisGuard) for a domain")
  .action(async (domain) => {
    try {
      await client.disablePrivacy(domain);
      console.log("Domain privacy disabled.");
    } catch (err) {
      console.error(`Error disabling privacy for ${domain}:`, err.message);
      process.exit(1);
    }
  });

program.parseAsync();
