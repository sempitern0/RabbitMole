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
 const EXTRA_ROUTERS={"Cisco":["Catalyst C8200L","Catalyst C8300","Catalyst C8500","ISR 1111-8P","ISR 4461","RV340"],"Cisco Meraki":["MX68W","MX84","MX95","MX105","MX250","MX450"],"MikroTik":["hEX (RB750Gr3)","hEX S (2025)","L009UiGS-RM","RB5009UPr+S+IN","CCR2116-12G-4S+","CCR2216-1G-12XS-2XQ","Chateau 5G ax"],"Ubiquiti":["UniFi Cloud Gateway Max","UniFi Gateway Lite","UniFi Dream Machine SE","UniFi Enterprise Fortress Gateway","EdgeRouter 6P"],"TP-Link (Omada)":["ER707-M2","ER7412-M2","ER7406","ER7212PC","ER706W-4G","ER605W"],"AVM (FRITZ!Box)":["FRITZ!Box 5530 Fiber","FRITZ!Box 5590 Fiber","FRITZ!Box 7690","FRITZ!Box 5690 XGS"],"DrayTek":["Vigor 2865","Vigor 2926","Vigor 2962","Vigor 3912","Vigor 2135"],"NETGEAR":["BR500","PR460X","Orbi Pro SXK30"],"Teltonika":["RUT956","RUTX12","RUTM51","RUTX50","RUT200"],"Peplink":["Balance 20","Balance 380X","MAX BR1 Mini","MAX Transit Pro"],"Juniper":["SRX340","SRX1500","SRX1600"],"Aruba":["9004 Gateway","9012 Gateway","9240 Gateway"],"D-Link":["DWR-953","DWR-978","DVA-X1850","DVA-G3672B"],"Comtrend":["VG-8050","AR-5387un","VR-3032u","VG-8050N"],"ZTE":["ZXHN H298A","ZXHN H3600","ZXHN H6645P"],"Huawei":["AR617VW","AR1220E","NetEngine AR651","NetEngine AR6140"],"Synology":["RT2600ac","RT6600ax","WRX560"],"GL.iNet":["GL-MT3000 Beryl AX","GL-MT6000 Flint 2","GL-X3000 Spitz AX"],"Cudy":["R700","R1300","LT500","WR3000"],"Cambium Networks":["cnPilot R201","cnPilot R195W","Network Service Edge NSE3000"]};
 const ONT={"Huawei":["EchoLife EG8145V5","OptiXstar EG8140H5","OptiXstar EG8145X6-10","OptiXstar EG8147X6-10","OptiXstar EG8245X6-8N-30","OptiXstar EN8010Ts-20","OptiXstar EN8012Ts-20","OptiXstar EN8245X6s-8N","EchoLife HG8245H","EchoLife EG8021V5"],"Nokia":["G-010G-Q","G-240G-H","G-240W-E","G-2425G-A","G-2426G-B","XS-010G-Q","XS-010X-Q","XS-010X-D","U-010X-A"],"ZTE":["ZXHN F601","ZXHN F660","ZXHN F670L","ZXHN F680","ZXHN F6640","ZXHN F8648P"],"FiberHome":["AN5506-02-F","AN5506-04-F","AN5506-04-FA","HG6145F","HG6245D"],"Adtran":["SDX 621","SDX 622v","SDX 632v","SDX 631"],"Calix":["GigaPoint 803G","GigaPoint 803Gv2","GigaPoint 801G","GigaSpire BLAST u6"],"Sercomm":["FG824CD","FG824CD II","FG6122TM"],"TP-Link":["DS-P7001-01","XC220-G3v","XGZ030"]};
 const FIREWALL={"Fortinet":["FortiGate 30G","FortiGate 40F","FortiGate 50G","FortiGate 60F","FortiGate 70G","FortiGate 80F","FortiGate 90G","FortiGate 120G","FortiGate 200G","FortiGate 400G","FortiGate 700G"],"Palo Alto Networks":["PA-410","PA-415","PA-440","PA-445","PA-450","PA-460","PA-1410","PA-1420","PA-3410","PA-3420","PA-VM"],"Cisco":["Firepower 1010","Firepower 1120","Firepower 1140","Secure Firewall 3100","Secure Firewall 4200","ASA 5506-X"],"Cisco Meraki":["MX67","MX68","MX75","MX85","MX95","MX105","MX250"],"Sophos":["XGS 87","XGS 107","XGS 116","XGS 126","XGS 136","XGS 2100","XGS 2300","XGS 3100","XGS 4300"],"SonicWall":["TZ270","TZ370","TZ470","TZ570","TZ670","NSa 2700","NSa 3700","NSa 4700"],"WatchGuard":["Firebox T25","Firebox T45","Firebox T85","Firebox M290","Firebox M390","Firebox M590","Firebox M690"],"Check Point":["Quantum Spark 1530","Quantum Spark 1550","Quantum Spark 1600","Quantum Spark 1800","Quantum 6200","Quantum 6600"],"Juniper":["SRX300","SRX320","SRX340","SRX345","SRX1500","SRX1600"],"Zyxel":["USG FLEX 100","USG FLEX 200","USG FLEX 500","USG FLEX 700","ATP100","ATP200","ATP500"],"Barracuda":["CloudGen F18","CloudGen F80","CloudGen F180","CloudGen F280"],"Stormshield":["SN160","SN310","SN510","SN710","SN1100"],"Netgate":["1100","2100","4100","6100","8200"],"OPNsense":["DEC670","DEC750","DEC850","DEC2750"],"Ubiquiti":["UniFi Dream Machine Pro","UniFi Dream Machine SE","UniFi Cloud Gateway Max","UniFi Enterprise Fortress Gateway"]};
 for(const [vendor,models] of Object.entries(EXTRA_ROUTERS))
   data[vendor]=[...new Set([...(data[vendor]||[]),...models])];
 const types=Object.freeze({Router:data,ONT,Firewall:FIREWALL});
 const vendors=(type)=>[...new Set(Object.keys(type&&types[type]?types[type]:data).concat(type?[]:[...Object.keys(ONT),...Object.keys(FIREWALL)]))].sort((a,b)=>a.localeCompare(b,'es'));
 const models=(type,vendor)=>{
   const maps=type&&types[type]?[types[type]]:[data,ONT,FIREWALL];
   return [...new Set(maps.flatMap(map=>map[vendor]||[]))].sort((a,b)=>a.localeCompare(b,'es'));
 };
 globalThis.AuditNetworkDeviceCatalog=Object.freeze({TYPES:Object.freeze(['Router','ONT','Firewall']),vendors,models});
 globalThis.AuditRouterCatalog=Object.freeze(Object.fromEntries(
   Object.entries(data).map(([vendor,models])=>[vendor,Object.freeze(models)])
 ));
})();
