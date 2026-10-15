/* Default distribution: complete standalone/local RabbitMole edition. */
"use strict";
globalThis.RabbitMoleDeployment = Object.freeze({
  channel: "local",
  get profile() { return "private-full"; },
  get installed() { return true; }
});
