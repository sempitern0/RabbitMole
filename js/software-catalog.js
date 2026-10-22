/* Offline list of software publishers/vendors. Editable values are never restricted to this list. */
'use strict';
(() => {
  const BASE_PUBLISHERS = Object.freeze([
  "1Password",
  "ABBYY",
  "Acronis",
  "Adobe",
  "Alfresco",
  "Amazon Web Services (AWS)",
  "Ansible (Red Hat)",
  "AnyDesk Software GmbH",
  "Apache Software Foundation",
  "Apple",
  "Arcserve",
  "Aruba Networks",
  "Atlassian",
  "Autodesk",
  "Backblaze",
  "Barracuda Networks",
  "Bitdefender",
  "Blackmagic Design",
  "Blender Foundation",
  "Box",
  "Brave Software",
  "Broadcom",
  "Brother",
  "Canonical",
  "Centreon",
  "Check Point Software",
  "Cisco",
  "Cisco Meraki",
  "Citrix",
  "Cloudflare",
  "Commvault",
  "Corel",
  "CrowdStrike",
  "CyberArk",
  "Datadog",
  "DBeaver",
  "Debian Project",
  "DeepL",
  "Dell Technologies",
  "DigitalOcean",
  "Docker",
  "Dropbox",
  "Eclipse Foundation",
  "Elastic",
  "ESET",
  "ESRI",
  "F5",
  "Fastly",
  "FileZilla Project",
  "Fortinet",
  "Foxit Software",
  "FreeBSD Foundation",
  "GitHub",
  "GitLab",
  "GNU Project",
  "Google",
  "Google Cloud",
  "Google LLC",
  "Grafana Labs",
  "HashiCorp",
  "HCLSoftware",
  "Hewlett Packard Enterprise",
  "HP",
  "IBM",
  "Intel",
  "Ivanti",
  "Jamf",
  "JetBrains",
  "Kaspersky",
  "KeePass",
  "LibreOffice / The Document Foundation",
  "Malwarebytes",
  "ManageEngine",
  "MariaDB Foundation",
  "Microsoft",
  "MikroTik",
  "MinIO",
  "MongoDB",
  "Mozilla",
  "N-able",
  "NetApp",
  "Nextcloud",
  "Nginx (F5)",
  "Notepad++",
  "Nutanix",
  "NVIDIA",
  "Okta",
  "ONLYOFFICE",
  "OpenText",
  "OPNsense",
  "Oracle",
  "Oracle Corporation",
  "Paessler",
  "Palo Alto Networks",
  "Parallels",
  "Portainer",
  "PostgreSQL Global Development Group",
  "Progress Software",
  "Proxmox Server Solutions",
  "PuTTY",
  "QNAP",
  "Qualys",
  "RealVNC",
  "Red Hat",
  "Redis",
  "Rocky Enterprise Software Foundation",
  "RustDesk",
  "Sage",
  "Samba Team",
  "SAP",
  "SentinelOne",
  "Software DELSOL",
  "SolarWinds",
  "SonicWall",
  "Sophos",
  "Splunk",
  "SumatraPDF",
  "SUSE",
  "Synology",
  "TeamViewer",
  "Tenable",
  "Thunderbird",
  "TightVNC",
  "Trellix",
  "Trend Micro",
  "Ubuntu (Canonical)",
  "Veeam",
  "VideoLAN",
  "VirtualBox (Oracle)",
  "VMware (Broadcom)",
  "Wazuh",
  "WinRAR / win.rar GmbH",
  "WinSCP",
  "Xerox",
  "Yubico",
  "Zabbix",
  "Zoho",
  "Zoom"
].sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'})));

  // Curated suggestions are NOT an inventory or evidence of installation.
  const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es").trim();
  const ORIGINAL_APPLICATIONS=Object.freeze([{"name":"Google Chrome","vendor":"Google LLC","category":"Navegadores","mark":"G","aliases":"google chrome"},{"name":"Mozilla Firefox","vendor":"Mozilla","category":"Navegadores","mark":"F","aliases":"firefox"},{"name":"Microsoft Edge","vendor":"Microsoft","category":"Navegadores","mark":"E","aliases":"edge"},{"name":"Brave Browser","vendor":"Brave Software","category":"Navegadores","mark":"B","aliases":"brave"},{"name":"Opera Browser","vendor":"Opera Software","category":"Navegadores","mark":"O","aliases":"opera"},{"name":"Safari","vendor":"Apple","category":"Navegadores","mark":"S","aliases":"safari"},{"name":"Adobe Acrobat Reader","vendor":"Adobe","category":"PDF y documentos","mark":"Ac","aliases":"acrobat reader pdf"},{"name":"Adobe Acrobat Pro","vendor":"Adobe","category":"PDF y documentos","mark":"Ac","aliases":"acrobat pro pdf"},{"name":"Adobe Photoshop","vendor":"Adobe","category":"Diseño y multimedia","mark":"Ps","aliases":"photoshop"},{"name":"Adobe Illustrator","vendor":"Adobe","category":"Diseño y multimedia","mark":"Ai","aliases":"illustrator"},{"name":"Adobe InDesign","vendor":"Adobe","category":"Diseño y multimedia","mark":"Id","aliases":"indesign"},{"name":"Adobe Premiere Pro","vendor":"Adobe","category":"Diseño y multimedia","mark":"Pr","aliases":"premiere"},{"name":"Adobe Creative Cloud","vendor":"Adobe","category":"Diseño y multimedia","mark":"Cc","aliases":"creative cloud"},{"name":"WinRAR","vendor":"WinRAR / win.rar GmbH","category":"Compresión y archivos","mark":"R","aliases":"rar"},{"name":"7-Zip","vendor":"Igor Pavlov","category":"Compresión y archivos","mark":"7z","aliases":"7zip"},{"name":"PeaZip","vendor":"Giorgio Tani","category":"Compresión y archivos","mark":"P","aliases":"peazip"},{"name":"WinZip","vendor":"Corel","category":"Compresión y archivos","mark":"W","aliases":"winzip"},{"name":"Microsoft 365 Apps","vendor":"Microsoft","category":"Ofimática y colaboración","mark":"M","aliases":"office microsoft 365"},{"name":"Microsoft Teams","vendor":"Microsoft","category":"Ofimática y colaboración","mark":"T","aliases":"teams"},{"name":"OneDrive","vendor":"Microsoft","category":"Ofimática y colaboración","mark":"1","aliases":"onedrive"},{"name":"LibreOffice","vendor":"LibreOffice / The Document Foundation","category":"Ofimática y colaboración","mark":"L","aliases":"libreoffice"},{"name":"ONLYOFFICE Desktop Editors","vendor":"ONLYOFFICE","category":"Ofimática y colaboración","mark":"O","aliases":"onlyoffice"},{"name":"Google Drive para escritorio","vendor":"Google LLC","category":"Ofimática y colaboración","mark":"D","aliases":"drive"},{"name":"Zoom Workplace","vendor":"Zoom","category":"Ofimática y colaboración","mark":"Z","aliases":"zoom"},{"name":"VLC media player","vendor":"VideoLAN","category":"Multimedia","mark":"▶","aliases":"vlc"},{"name":"OBS Studio","vendor":"OBS Project","category":"Multimedia","mark":"O","aliases":"obs"},{"name":"Notepad++","vendor":"Notepad++","category":"Utilidades y desarrollo","mark":"N","aliases":"notepad"},{"name":"Visual Studio Code","vendor":"Microsoft","category":"Utilidades y desarrollo","mark":"V","aliases":"vscode code"},{"name":"Git","vendor":"Git Project","category":"Utilidades y desarrollo","mark":"G","aliases":"git scm"},{"name":"Git for Windows","vendor":"Git for Windows","category":"Utilidades y desarrollo","mark":"G","aliases":"git bash"},{"name":"PuTTY","vendor":"PuTTY","category":"Administración y remoto","mark":"P","aliases":"putty ssh"},{"name":"WinSCP","vendor":"WinSCP","category":"Administración y remoto","mark":"W","aliases":"scp sftp"},{"name":"FileZilla Client","vendor":"FileZilla Project","category":"Administración y remoto","mark":"F","aliases":"filezilla ftp"},{"name":"AnyDesk","vendor":"AnyDesk Software GmbH","category":"Administración y remoto","mark":"A","aliases":"anydesk"},{"name":"TeamViewer","vendor":"TeamViewer","category":"Administración y remoto","mark":"T","aliases":"teamviewer"},{"name":"RustDesk","vendor":"RustDesk","category":"Administración y remoto","mark":"R","aliases":"rustdesk"},{"name":"OpenVPN Connect","vendor":"OpenVPN Inc.","category":"Redes y VPN","mark":"O","aliases":"openvpn"},{"name":"WireGuard","vendor":"WireGuard","category":"Redes y VPN","mark":"W","aliases":"wireguard"},{"name":"Wireshark","vendor":"Wireshark Foundation","category":"Redes y VPN","mark":"W","aliases":"wireshark"},{"name":"Nmap","vendor":"Nmap Project","category":"Redes y VPN","mark":"N","aliases":"nmap"},{"name":"Microsoft Defender for Endpoint","vendor":"Microsoft","category":"Seguridad","mark":"D","aliases":"defender edr"},{"name":"ESET Endpoint Security","vendor":"ESET","category":"Seguridad","mark":"E","aliases":"eset"},{"name":"Sophos Intercept X","vendor":"Sophos","category":"Seguridad","mark":"S","aliases":"sophos"},{"name":"Bitdefender GravityZone","vendor":"Bitdefender","category":"Seguridad","mark":"B","aliases":"bitdefender"},{"name":"CrowdStrike Falcon","vendor":"CrowdStrike","category":"Seguridad","mark":"C","aliases":"crowdstrike"},{"name":"KeePass 2","vendor":"KeePass","category":"Seguridad","mark":"K","aliases":"keepass"},{"name":"1Password","vendor":"1Password","category":"Seguridad","mark":"1","aliases":"onepassword"},{"name":"Docker Desktop","vendor":"Docker","category":"Virtualización y servidores","mark":"D","aliases":"docker"},{"name":"Docker Engine","vendor":"Docker","category":"Virtualización y servidores","mark":"D","aliases":"docker engine"},{"name":"VirtualBox","vendor":"VirtualBox (Oracle)","category":"Virtualización y servidores","mark":"V","aliases":"virtualbox"},{"name":"VMware Workstation Pro","vendor":"VMware (Broadcom)","category":"Virtualización y servidores","mark":"V","aliases":"vmware workstation"},{"name":"Proxmox VE","vendor":"Proxmox Server Solutions","category":"Virtualización y servidores","mark":"P","aliases":"proxmox"},{"name":"VMware vCenter Server","vendor":"VMware (Broadcom)","category":"Virtualización y servidores","mark":"V","aliases":"vcenter"},{"name":"Veeam Backup & Replication","vendor":"Veeam","category":"Virtualización y servidores","mark":"V","aliases":"veeam"},{"name":"Acronis Cyber Protect","vendor":"Acronis","category":"Virtualización y servidores","mark":"A","aliases":"acronis"},{"name":"Microsoft SQL Server","vendor":"Microsoft","category":"Bases de datos","mark":"SQL","aliases":"sql server"},{"name":"PostgreSQL","vendor":"PostgreSQL Global Development Group","category":"Bases de datos","mark":"Pg","aliases":"postgres"},{"name":"MySQL Server","vendor":"Oracle Corporation","category":"Bases de datos","mark":"My","aliases":"mysql"},{"name":"MariaDB Server","vendor":"MariaDB Foundation","category":"Bases de datos","mark":"M","aliases":"mariadb"},{"name":"Oracle Database","vendor":"Oracle Corporation","category":"Bases de datos","mark":"O","aliases":"oracle"},{"name":"Apache HTTP Server","vendor":"Apache Software Foundation","category":"Servidores y monitorización","mark":"A","aliases":"apache httpd"},{"name":"Nginx","vendor":"Nginx (F5)","category":"Servidores y monitorización","mark":"N","aliases":"nginx"},{"name":"IIS","vendor":"Microsoft","category":"Servidores y monitorización","mark":"I","aliases":"internet information services"},{"name":"Zabbix","vendor":"Zabbix","category":"Servidores y monitorización","mark":"Z","aliases":"zabbix"},{"name":"Grafana","vendor":"Grafana Labs","category":"Servidores y monitorización","mark":"G","aliases":"grafana"},{"name":"Wazuh","vendor":"Wazuh","category":"Seguridad","mark":"W","aliases":"wazuh"},{"name":"Nextcloud","vendor":"Nextcloud","category":"Servidores y monitorización","mark":"N","aliases":"nextcloud"}]);

  // Extensible offline catalogue. Each line is "app | publisher | search aliases".
  // Categories describe a product family; they do not assert installation,
  // support status, licence compliance or vulnerability state.
  const EXTRA_GROUPS = Object.freeze({
  "Navegadores": "Vivaldi|Vivaldi Technologies|vivaldi\nOpera GX|Opera Software|opera gaming\nTor Browser|Tor Project|tor privacidad\nChromium|The Chromium Authors|chromium\nWaterfox|Waterfox|waterfox\nFirefox ESR|Mozilla|firefox extended support\nMicrosoft Edge WebView2 Runtime|Microsoft|webview2 runtime\nGoogle Chrome Enterprise|Google LLC|chrome enterprise",
  "Diseño y multimedia": "Adobe After Effects|Adobe|after effects\nAdobe Lightroom Classic|Adobe|lightroom\nAdobe Lightroom|Adobe|lightroom cloud\nAdobe Audition|Adobe|audition audio\nAdobe Animate|Adobe|animate\nAdobe Bridge|Adobe|bridge\nAdobe XD|Adobe|xd diseño\nAdobe Dreamweaver|Adobe|dreamweaver\nAdobe Media Encoder|Adobe|media encoder\nAdobe Substance 3D Painter|Adobe|substance painter\nAdobe Fresco|Adobe|fresco\nAdobe InCopy|Adobe|incopy\nAutodesk AutoCAD|Autodesk|autocad cad\nAutodesk Revit|Autodesk|revit bim\nAutodesk Fusion|Autodesk|fusion 360\nAutodesk Inventor|Autodesk|inventor\nAutodesk 3ds Max|Autodesk|3ds max\nAutodesk Maya|Autodesk|maya\nBlender|Blender Foundation|blender 3d\nGIMP|GIMP Development Team|gimp\nInkscape|Inkscape Project|inkscape vector\nKrita|KDE|krita ilustracion\nFigma Desktop|Figma|figma\nCanva Desktop|Canva|canva\nCorelDRAW Graphics Suite|Corel|coreldraw\nAffinity Photo|Serif|affinity\nAffinity Designer|Serif|affinity vector\nDaVinci Resolve|Blackmagic Design|davinci video\nSketchUp|Trimble|sketchup",
  "PDF y documentos": "Foxit PDF Reader|Foxit Software|foxit\nFoxit PDF Editor|Foxit Software|foxit\nNitro PDF Pro|Nitro Software|nitro\nSumatraPDF|SumatraPDF|sumatra\nPDF-XChange Editor|Tracker Software|pdf xchange\nPDF24 Creator|geek software GmbH|pdf24\nPDFsam Basic|PDFsam|pdf split merge\nPDFsam Enhanced|PDFsam|pdfsam\nABBYY FineReader PDF|ABBYY|abbyy ocr\nMaster PDF Editor|Code Industry|master pdf\nOkular|KDE|okular",
  "Compresión y archivos": "Bandizip|Bandisoft|bandizip\nIZArc|IZArc|izarc\nNanaZip|M2Team|nanazip\nKeka|Keka|keka\nThe Unarchiver|MacPaw|unarchiver\nTotal Commander|Ghisler Software|total commander\nDouble Commander|Double Commander Team|double commander\nFreeCommander|FreeCommander|file manager",
  "Ofimática y colaboración": "Microsoft Office 2016|Microsoft|office 2016\nMicrosoft Office 2019|Microsoft|office 2019\nMicrosoft Office 2021|Microsoft|office 2021\nMicrosoft Office LTSC 2024|Microsoft|office ltsc 2024\nMicrosoft Word|Microsoft|word\nMicrosoft Excel|Microsoft|excel\nMicrosoft PowerPoint|Microsoft|powerpoint\nMicrosoft Outlook (clásico)|Microsoft|outlook classic\nNuevo Outlook para Windows|Microsoft|outlook new\nMicrosoft Access|Microsoft|access\nMicrosoft Publisher|Microsoft|publisher\nMicrosoft Visio|Microsoft|visio\nMicrosoft Project|Microsoft|project\nMicrosoft OneNote|Microsoft|onenote\nMicrosoft SharePoint|Microsoft|sharepoint\nGoogle Workspace|Google LLC|workspace\nGoogle Docs Offline|Google LLC|docs offline\nWPS Office|Kingsoft Office Software|wps\nApache OpenOffice|Apache Software Foundation|openoffice\nSoftMaker Office|SoftMaker|softmaker\nFreeOffice|SoftMaker|freeoffice\nApple iWork Pages|Apple|pages\nApple iWork Numbers|Apple|numbers\nApple iWork Keynote|Apple|keynote\nThunderbird|Mozilla|thunderbird correo\neM Client|eM Client|emclient\nMailbird|Mailbird|mailbird\nMicrosoft Power BI Desktop|Microsoft|power bi",
  "Comunicación y almacenamiento": "Slack|Salesforce|slack\nDiscord|Discord|discord\nCisco Webex|Cisco|webex meetings\nGoogle Meet|Google LLC|meet\nSkype|Microsoft|skype\nJitsi Meet|8x8|jitsi\nRocket.Chat|Rocket.Chat|rocketchat\nMattermost Desktop|Mattermost|mattermost\nElement Desktop|Element|matrix element\nSignal Desktop|Signal|signal\nWhatsApp Desktop|Meta|whatsapp\nTelegram Desktop|Telegram|telegram\nDropbox Desktop|Dropbox|dropbox sync\nBox Drive|Box|box drive\nNextcloud Desktop|Nextcloud|nextcloud sync\nownCloud Desktop|ownCloud|owncloud\nSynology Drive Client|Synology|synology drive\nQsync Client|QNAP|qsync\niCloud para Windows|Apple|icloud\nWeTransfer Desktop|WeTransfer|wetransfer\nDeepL para escritorio|DeepL|deepl",
  "Multimedia": "Audacity|Muse Group|audacity\nHandBrake|HandBrake Team|handbrake\nFFmpeg|FFmpeg Project|ffmpeg\nSpotify|Spotify|spotify\niTunes|Apple|itunes\nApple Music|Apple|apple music\nKodi|Kodi Foundation|kodi\nPlex Media Server|Plex|plex\nWindows Media Player|Microsoft|media player\nAIMP|AIMP|aimp\nfoobar2000|Peter Pawlowski|foobar\nK-Lite Codec Pack|Codec Guide|klite",
  "Utilidades y desarrollo": "Visual Studio 2022|Microsoft|visual studio ide\nVisual Studio Build Tools|Microsoft|msvc compiler\nVisual Studio Code Insiders|Microsoft|vscode insiders\nJetBrains IntelliJ IDEA|JetBrains|intellij\nJetBrains PyCharm|JetBrains|pycharm\nJetBrains WebStorm|JetBrains|webstorm\nJetBrains Rider|JetBrains|rider\nJetBrains PhpStorm|JetBrains|phpstorm\nAndroid Studio|Google LLC|android studio\nEclipse IDE|Eclipse Foundation|eclipse\nNetBeans|Apache Software Foundation|netbeans\nSublime Text|Sublime HQ|sublime\nNotepad3|Rizonesoft|notepad3\nVim|Vim Project|vim editor\nNeovim|Neovim|neovim\nGitHub Desktop|GitHub|github desktop\nGitKraken Desktop|GitKraken|gitkraken\nSourceTree|Atlassian|sourcetree\nTortoiseGit|TortoiseGit|tortoisegit\nTortoiseSVN|TortoiseSVN|svn\nNode.js|OpenJS Foundation|node npm\nPython|Python Software Foundation|python\nJava Development Kit (OpenJDK)|OpenJDK|jdk java\nEclipse Temurin JDK|Eclipse Adoptium|temurin java\n.NET SDK|Microsoft|dotnet sdk\n.NET Desktop Runtime|Microsoft|dotnet runtime\nPowerShell 7|Microsoft|powershell pwsh\nWindows Terminal|Microsoft|terminal windows\nPostman|Postman|postman api\nInsomnia|Kong|insomnia api\ncurl|curl project|curl\njq|jqlang|jq json\nRufus|Akeo Consulting|rufus usb\nbalenaEtcher|Balena|etcher\nVentoy|Ventoy|ventoy\nEverything Search|voidtools|everything\nPowerToys|Microsoft|powertoys",
  "Administración y remoto": "Microsoft Remote Desktop|Microsoft|remote desktop\nWindows App (Remote Desktop)|Microsoft|windows app rdp\nRemote Desktop Connection Manager|Microsoft|rdcman\nmRemoteNG|mRemoteNG|mremoteng\nMobaXterm|Mobatek|mobaxterm ssh\nRoyal TS|Royal Apps|royal ts\nDevolutions Remote Desktop Manager|Devolutions|remote desktop manager\nRealVNC Viewer|RealVNC|vnc\nTightVNC|TightVNC|vnc\nUltraVNC|UltraVNC|vnc\nNoMachine|NoMachine|nomachine\nSplashtop Business|Splashtop|splashtop\nChrome Remote Desktop|Google LLC|chrome remote\nMeshCentral|MeshCentral|mesh central\nRemmina|Remmina|remmina rdp\nTermius|Termius|termius ssh\nBitvise SSH Client|Bitvise|bitvise\nSolar-PuTTY|SolarWinds|solar putty\nOpenSSH Client|OpenBSD Project|openssh\nOpenSSH Server|OpenBSD Project|openssh sshd\nWindows Admin Center|Microsoft|windows admin center\nSysinternals Suite|Microsoft|sysinternals\nProcess Explorer|Microsoft|procexp sysinternals\nAutoruns|Microsoft|autoruns\nProcmon (Process Monitor)|Microsoft|process monitor\nAdvanced IP Scanner|Famatech|ip scanner\nAngry IP Scanner|Angry IP Scanner|ipscan\nRemote Utilities|Remote Utilities|remote utilities",
  "Redes y VPN": "FortiClient VPN|Fortinet|forticlient\nFortiClient EMS|Fortinet|forticlient ems\nCisco Secure Client|Cisco|anyconnect\nCisco AnyConnect|Cisco|anyconnect vpn\nGlobalProtect|Palo Alto Networks|globalprotect vpn\nCheck Point Endpoint Security VPN|Check Point Software|checkpoint vpn\nSophos Connect|Sophos|sophos vpn\nSonicWall NetExtender|SonicWall|netextender\nPulse Secure|Ivanti|pulse secure\nIvanti Secure Access Client|Ivanti|ivanti vpn\nTailscale|Tailscale|tailscale vpn\nZeroTier One|ZeroTier|zerotier\nCloudflare WARP|Cloudflare|warp vpn\nSoftEther VPN Client|SoftEther Project|softether\nOpenVPN GUI|OpenVPN|openvpn gui\nOpenVPN Access Server|OpenVPN|openvpn server\nOpenConnect|OpenConnect|openconnect\nNpcap|Nmap Project|npcap winpcap\nWinPcap|Riverbed Technology|winpcap\nTShark|Wireshark Foundation|tshark\nMikroTik WinBox|MikroTik|winbox\nUbiquiti UniFi Network Application|Ubiquiti|unifi controller\nPuTTYgen|PuTTY|puttygen\niperf3|ESnet|iperf\nMTR|MTR Project|mtr\nOpenSpeedTest|OpenSpeedTest|speed test\nFing Desktop|Fing|fing\nZeroconf Bonjour|Apple|bonjour",
  "Seguridad": "Microsoft Defender Antivirus|Microsoft|defender antivirus\nMicrosoft Defender for Business|Microsoft|defender business\nMicrosoft Security Essentials|Microsoft|security essentials\nMicrosoft Intune Management Extension|Microsoft|intune\nWindows LAPS|Microsoft|laps\nMicrosoft Entra Connect|Microsoft|azure ad connect\nSentinelOne Singularity Agent|SentinelOne|sentinel one edr\nSophos Endpoint Agent|Sophos|sophos endpoint\nESET PROTECT Agent|ESET|eset protect\nESET Endpoint Antivirus|ESET|eset antivirus\nBitdefender Endpoint Security Tools|Bitdefender|bitdefender best\nMalwarebytes Endpoint Agent|Malwarebytes|malwarebytes\nMalwarebytes Premium|Malwarebytes|malwarebytes premium\nTrellix Endpoint Security|Trellix|trellix mcafee\nTrellix Agent|Trellix|trellix agent\nMcAfee Endpoint Security|Trellix|mcafee\nKaspersky Endpoint Security|Kaspersky|kaspersky\nTrend Micro Apex One|Trend Micro|apex one\nTrend Micro Vision One|Trend Micro|vision one\nPanda Adaptive Defense|WatchGuard|panda\nWatchGuard Endpoint Security|WatchGuard|watchguard endpoint\nWazuh Agent|Wazuh|wazuh agent\nOSSEC Agent|OSSEC|ossec\nElastic Agent|Elastic|elastic agent\nSplunk Universal Forwarder|Splunk|splunk forwarder\nNessus Agent|Tenable|nessus agent\nQualys Cloud Agent|Qualys|qualys\nTenable Nessus|Tenable|nessus scanner\nBurp Suite Community|PortSwigger|burp\nOWASP ZAP|OWASP|zap\nNuclei|ProjectDiscovery|nuclei\nKeePassXC|KeePassXC|keepass xc\nBitwarden Desktop|Bitwarden|bitwarden\nYubico Authenticator|Yubico|yubico\nGoogle Authenticator|Google LLC|authenticator\nVeraCrypt|IDRIX|veracrypt\nGpg4win|Gpg4win|gpg encryption\nGnuPG|GNU Project|gnupg",
  "Virtualización y servidores": "VMware ESXi|VMware (Broadcom)|esxi\nVMware vSphere Client|VMware (Broadcom)|vsphere\nVMware Tools|VMware (Broadcom)|vmware tools\nVMware Fusion|VMware (Broadcom)|fusion mac\nVMware Horizon Client|Omnissa|horizon\nHyper-V Manager|Microsoft|hyper-v manager\nHyper-V Integration Services|Microsoft|hyperv integrations\nProxmox Backup Server|Proxmox Server Solutions|pbs proxmox backup\nXCP-ng|Vates|xcp ng\nXen Orchestra|Vates|xen orchestra\nCitrix Workspace|Citrix|citrix receiver\nCitrix Virtual Apps and Desktops|Citrix|citrix vda\nParallels Desktop|Parallels|parallels\nDocker Compose|Docker|compose\nDocker CLI|Docker|docker cli\nPodman|Red Hat|podman\nPortainer|Portainer|portainer\nKubernetes|Cloud Native Computing Foundation|k8s\nKubernetes kubectl|Cloud Native Computing Foundation|kubectl\nHelm|Cloud Native Computing Foundation|helm\nHashiCorp Terraform|HashiCorp|terraform\nHashiCorp Vault|HashiCorp|vault\nAnsible|Red Hat|ansible\nVagrant|HashiCorp|vagrant",
  "Bases de datos": "SQL Server Management Studio|Microsoft|ssms\nAzure Data Studio|Microsoft|azure data studio\nDBeaver Community|DBeaver|dbeaver\nDBeaver Ultimate|DBeaver|dbeaver\nHeidiSQL|HeidiSQL|heidisql\npgAdmin 4|pgAdmin Development Team|pgadmin\nMySQL Workbench|Oracle Corporation|mysql workbench\nOracle SQL Developer|Oracle Corporation|sql developer\nOracle Instant Client|Oracle Corporation|oracle client\nOracle Java DB|Oracle Corporation|derby java db\nSQLite|SQLite Consortium|sqlite\nDB Browser for SQLite|DB Browser for SQLite|sqlite browser\nMongoDB Community Server|MongoDB|mongodb server\nMongoDB Compass|MongoDB|mongodb compass\nRedis Server|Redis|redis\nRedis Insight|Redis|redisinsight\nElasticsearch|Elastic|elasticsearch\nOpenSearch|OpenSearch Project|opensearch\nInfluxDB|InfluxData|influxdb\nMicrosoft Access Database Engine|Microsoft|access database engine",
  "Copias de seguridad": "Veeam Agent for Microsoft Windows|Veeam|veeam agent\nVeeam Agent for Linux|Veeam|veeam linux\nVeeam ONE|Veeam|veeam one\nVeeam Backup for Microsoft 365|Veeam|veeam office 365\nAcronis True Image|Acronis|true image\nAcronis Cyber Backup|Acronis|acronis backup\nMacrium Reflect|Macrium Software|macrium\nAOMEI Backupper|AOMEI|aomei\nEaseUS Todo Backup|EaseUS|easeus\nCobian Reflector|Cobian|cobian backup\nUrBackup Client|UrBackup|urbackup\nUrBackup Server|UrBackup|urbackup\nDuplicati|Duplicati|duplicati\nRestic|Restic|restic\nBorgBackup|BorgBackup|borg\nRclone|Rclone|rclone\nSyncthing|Syncthing Foundation|syncthing\nNakivo Backup & Replication|NAKIVO|nakivo\nCommvault Complete Backup & Recovery|Commvault|commvault\nArcserve UDP|Arcserve|arcserve\nWindows Server Backup|Microsoft|server backup\nWindows File History|Microsoft|historial de archivos",
  "Servidores y monitorización": "Microsoft IIS URL Rewrite|Microsoft|iis rewrite\nMicrosoft Exchange Server|Microsoft|exchange\nMicrosoft SharePoint Server|Microsoft|sharepoint server\nMicrosoft Remote Desktop Services|Microsoft|rds\nMicrosoft Active Directory Domain Services|Microsoft|ad ds\nWindows Server Update Services|Microsoft|wsus\nMicrosoft System Center Configuration Manager|Microsoft|sccm mecm\nMicrosoft Configuration Manager Client|Microsoft|mecm client\nMicrosoft SQL Server Reporting Services|Microsoft|ssrs\nApache Tomcat|Apache Software Foundation|tomcat\nApache Kafka|Apache Software Foundation|kafka\nApache ZooKeeper|Apache Software Foundation|zookeeper\nRabbitMQ Server|Broadcom|rabbitmq\nHAProxy|HAProxy Technologies|haproxy\nTraefik Proxy|Traefik Labs|traefik\nCaddy Server|Caddy|caddy\nNginx Proxy Manager|Nginx Proxy Manager|nginx proxy manager\nPrometheus|Prometheus Authors|prometheus\nPrometheus Node Exporter|Prometheus Authors|node exporter\nGrafana Alloy|Grafana Labs|alloy\nGrafana Loki|Grafana Labs|loki\nGrafana Promtail|Grafana Labs|promtail\nZabbix Agent|Zabbix|zabbix agent\nZabbix Server|Zabbix|zabbix server\nPRTG Network Monitor|Paessler|prtg\nPRTG Desktop|Paessler|prtg desktop\nCentreon|Centreon|centreon\nNagios Core|Nagios|nagios\nIcinga 2|Icinga|icinga\nGraylog|Graylog|graylog\nSplunk Enterprise|Splunk|splunk enterprise\nDatadog Agent|Datadog|datadog\nSolarWinds Orion Platform|SolarWinds|orion\nManageEngine OpManager|ManageEngine|opmanager\nManageEngine Endpoint Central|ManageEngine|desktop central\nGLPI|Teclib|glpi\nOCS Inventory NG Agent|OCS Inventory NG|ocs agent\nLansweeper Agent|Lansweeper|lansweeper",
  "España · empresa y educación": "AutoFirma|Gobierno de España|autofirma\nCliente @firma|Gobierno de España|firma electronica\nDNIe Remote|Policía Nacional|dnie\nSILTRA|Tesorería General de la Seguridad Social|siltra\nSistema RED|Tesorería General de la Seguridad Social|sistema red\nFacturae|Gobierno de España|factura electronica\nSage 50|Sage|sage contabilidad\nSage 200|Sage|sage erp\nSage Despachos Connected|Sage|sage despachos\nCONTASOL|Software DELSOL|contasol\nFACTUSOL|Software DELSOL|factusol\nNOMINASOL|Software DELSOL|nominasol\nHolded|Holded|holded\na3ERP|Wolters Kluwer|a3erp\na3ASESOR|Wolters Kluwer|a3asesor\nOdoo|Odoo|odoo erp\nSAP GUI|SAP|sap gui\nSAP Business One|SAP|sap b1\nMoodle Desktop|Moodle|moodle\nGeoGebra Classic|GeoGebra|geogebra\nScratch Desktop|Scratch Foundation|scratch\nJClic|Generalitat de Catalunya|jclic\nAnki|Anki|anki\nCalibre|Kovid Goyal|calibre ebooks"
});
  const extraApplications=Object.entries(EXTRA_GROUPS).flatMap(([category,lines])=>
    lines.split("\n").filter(Boolean).map(line=>{
      const [name,vendor,aliases=""]=line.split("|").map(part=>part.trim());
      const letters=name.replace(/[^\p{L}\p{N}]/gu,"");
      return Object.freeze({name,vendor,category,mark:letters.slice(0,2)||"App",aliases});
    })
  );
  const seen=new Set();
  const APPLICATIONS=Object.freeze([...ORIGINAL_APPLICATIONS,...extraApplications]
    .filter(app=>{
      const key=normalize(app.name);
      if(!key||seen.has(key))return false;
      seen.add(key);
      return true;
    }));
  const PUBLISHERS=Object.freeze([...new Set([...BASE_PUBLISHERS,...APPLICATIONS.map(app=>app.vendor)])]
    .sort((a,b)=>a.localeCompare(b,"es",{sensitivity:"base"})));
  function searchApplications(value,limit=24){
    const term=normalize(value);
    if(!term)return APPLICATIONS.slice(0,limit);
    return APPLICATIONS.map((app,index)=>{
      const name=normalize(app.name), vendor=normalize(app.vendor),aliases=normalize(app.aliases);
      const category=normalize(app.category);
      const priority=name===term?0:name.startsWith(term)?1:name.includes(term)?2:aliases.includes(term)?3:vendor.includes(term)?4:category.includes(term)?5:99;
      return {app,index,priority};
    }).filter(row=>row.priority<99).sort((a,b)=>a.priority-b.priority||a.index-b.index).slice(0,limit).map(row=>row.app);
  }
  function byName(value){return APPLICATIONS.find(app=>normalize(app.name)===normalize(value))||null;}
  globalThis.AuditSoftwareCatalog = Object.freeze({PUBLISHERS, APPLICATIONS, searchApplications, byName});
})();
