/* Default distribution: complete standalone/local RabbitMole edition. */
"use strict";
globalThis.RabbitMoleDeployment = Object.freeze({
  channel: "local",
  companionAvailable: false, // Raw/local source checkouts do not bundle a Windows executable.
  get profile() { return "private-full"; },
  get installed() { return true; }
});
