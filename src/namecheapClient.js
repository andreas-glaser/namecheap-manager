// path: src/namecheapClient.js
const axios = require("axios");
const qs = require("node:querystring");
const cfg = require("./config");
const parseXml = require("./utils/parseXml");

class NamecheapClient {
  constructor() {
    for (const k of ["apiUser", "apiKey", "userName", "clientIp"]) {
      if (!cfg[k])
        throw new Error(
          `Missing config value ${k} – check .env or config.json`,
        );
    }
  }

  /* ───────────── Domain list ───────────── */
  async listDomains(page = 1, pageSize = 100) {
    const extra = { Page: page, PageSize: pageSize, SortBy: "NAME" };
    const res = await this.#requestNoDomain("namecheap.domains.getList", extra);
    const raw = res?.CommandResponse?.DomainGetListResult?.Domain;
    if (!raw) return [];
    const items = Array.isArray(raw) ? raw : [raw];
    return items.map((d) => ({
      id: d.ID,
      name: d.Name,
      created: d.Created,
      expires: d.Expires,
      isExpired: d.IsExpired === "true",
      isLocked: d.IsLocked === "true",
      autoRenew: d.AutoRenew === "true",
      whoisGuard: d.WhoisGuard,
      isPremium: d.IsPremium === "true",
      isOurDNS: d.IsOurDNS === "true",
    }));
  }

  /* ───────────── DNS Record commands ───────────── */
  async getHosts(domain) {
    const res = await this.#request("namecheap.domains.dns.getHosts", domain);
    const dnsBlock = res?.CommandResponse?.DomainDNSGetHostsResult;
    const hostsRaw = dnsBlock?.host || dnsBlock?.Host;
    if (!hostsRaw) return [];
    const list = Array.isArray(hostsRaw) ? hostsRaw : [hostsRaw];
    return list.map((h) => ({
      hostId: h.HostId,
      name: h.Name,
      type: h.Type,
      address: h.Address,
      mxPref: h.MXPref,
      ttl: Number(h.TTL),
    }));
  }

  async setHosts(domain, records) {
    const p = {};
    records.forEach((rec, i) => {
      const n = i + 1;
      p[`HostName${n}`] = rec.name;
      p[`RecordType${n}`] = rec.type;
      p[`Address${n}`] = rec.address;
      if (rec.mxPref) p[`MXPref${n}`] = rec.mxPref;
      if (rec.ttl ?? rec.ttl === 0) p[`TTL${n}`] = rec.ttl;
    });
    return this.#request("namecheap.domains.dns.setHosts", domain, p);
  }

  async addHosts(domain, newRecs) {
    const current = await this.getHosts(domain);
    return this.setHosts(domain, [...current, ...newRecs]);
  }

  async deleteHosts(domain, ids) {
    const current = await this.getHosts(domain);
    const remaining = current.filter((r) => !ids.includes(r.hostId));
    return this.setHosts(domain, remaining);
  }

  /* ───────── Domain Privacy (WhoisGuard) ───────── */
  async getWhoisGuardList() {
    const res = await this.#requestNoDomain("namecheap.whoisguard.getList");
    const raw = res?.CommandResponse?.WhoisguardGetListResult?.Whoisguard;
    if (!raw) return [];
    const items = Array.isArray(raw) ? raw : [raw];
    return items.map((item) => ({
      domainName: item.DomainName,
      whoisguardId: item.WhoisguardID || item.WhoisguardId,
      isEnabled: item.IsEnabled === "true",
      expires: item.Expires,
    }));
  }

  async getWhoisStatus(domain) {
    const list = await this.getWhoisGuardList();
    const e = list.find((x) => x.domainName === domain);
    return e ? (e.isEnabled ? "ENABLED" : "DISABLED") : "NOTPRESENT";
  }

  async enablePrivacy(domain) {
    const list = await this.getWhoisGuardList();
    const e = list.find((x) => x.domainName === domain);
    if (!e) {
      throw new Error(
        `No privacy subscription exists for ${domain}. Purchase via dashboard first.`,
      );
    }
    if (e.isEnabled) return;
    await this.#requestNoDomain("namecheap.whoisguard.enable", {
      WhoisguardID: e.whoisguardId,
    });
  }

  async disablePrivacy(domain) {
    const list = await this.getWhoisGuardList();
    const e = list.find((x) => x.domainName === domain);
    if (!e) {
      throw new Error(`No privacy subscription exists for ${domain}.`);
    }
    if (!e.isEnabled) return;
    await this.#requestNoDomain("namecheap.whoisguard.disable", {
      WhoisguardID: e.whoisguardId,
    });
  }

  /* ───────── Internals ───────── */
  async #request(cmd, domain, extra = {}) {
    const [sld, ...tldParts] = domain.replace(/\.$/, "").split(".");
    const base = {
      ApiUser: cfg.apiUser,
      ApiKey: cfg.apiKey,
      UserName: cfg.userName,
      ClientIp: cfg.clientIp,
      Command: cmd,
      SLD: sld,
      TLD: tldParts.join("."),
      ...extra,
    };
    const url = `${cfg.endpoint}?${qs.stringify(base)}`;
    const method = cmd.endsWith("setHosts") ? "post" : "get";
    const { data: xml } = await axios({ url, method });
    return parseXml(xml);
  }

  async #requestNoDomain(cmd, extra = {}) {
    const base = {
      ApiUser: cfg.apiUser,
      ApiKey: cfg.apiKey,
      UserName: cfg.userName,
      ClientIp: cfg.clientIp,
      Command: cmd,
      ...extra,
    };
    const url = `${cfg.endpoint}?${qs.stringify(base)}`;
    const { data: xml } = await axios.get(url);
    return parseXml(xml);
  }
}

module.exports = NamecheapClient;
