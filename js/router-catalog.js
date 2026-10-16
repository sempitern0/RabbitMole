/* Offline suggestions, not an exhaustive inventory or verification of router hardware.
   Keep "Otro / escribir…" available for firmware variants and new hardware. */
'use strict';
(()=>{
 const data={
  "Cisco": [
    "ISR 1100",
    "C1111-8P",
    "ISR 4321",
    "Catalyst 8200"
  ],
  "Cisco Meraki": [
    "MX67",
    "MX68",
    "MX75",
    "MX85"
  ],
  "MikroTik": [
    "hEX S (RB760iGS)",
    "RB5009UG+S+IN",
    "hAP ax3",
    "CCR2004-1G-12S+2XS"
  ],
  "Ubiquiti": [
    "EdgeRouter X",
    "EdgeRouter 4",
    "UniFi Cloud Gateway Ultra",
    "UniFi Dream Machine Pro",
    "UniFi Dream Router"
  ],
  "TP-Link (Omada)": [
    "ER605",
    "ER7206",
    "ER8411",
    "ER706W"
  ],
  "AVM (FRITZ!Box)": [
    "FRITZ!Box 7530 AX",
    "FRITZ!Box 7590 AX",
    "FRITZ!Box 5690 Pro"
  ],
  "Fortinet": [
    "FortiGate 40F",
    "FortiGate 60F",
    "FortiGate 80F",
    "FortiGate 100F"
  ],
  "DrayTek": [
    "Vigor 2866",
    "Vigor 2927",
    "Vigor 3910"
  ],
  "ASUS": [
    "RT-AX58U",
    "RT-AX86U Pro",
    "RT-AX88U Pro"
  ],
  "NETGEAR": [
    "BR200",
    "PR60X",
    "Nighthawk RAX50"
  ],
  "Zyxel": [
    "USG FLEX 100",
    "USG FLEX 200",
    "VPN100"
  ],
  "Teltonika": [
    "RUT241",
    "RUTX11",
    "RUTM50"
  ],
  "Peplink": [
    "Balance 20X",
    "Balance 310X",
    "MAX BR1 Pro 5G"
  ],
  "Juniper": [
    "SRX300",
    "SRX320",
    "SRX345"
  ]
};
 globalThis.AuditRouterCatalog=Object.freeze(Object.fromEntries(
   Object.entries(data).map(([vendor,models])=>[vendor,Object.freeze(models)])
 ));
})();
