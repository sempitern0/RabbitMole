#!/usr/bin/env python3
"""Cross-platform RabbitMole inventory entrypoint: no third-party modules."""
import argparse,datetime,json,os,pathlib,platform,re,shutil,socket,subprocess,sys

def command(*args):
    try:
        result=subprocess.run(args,capture_output=True,text=True,timeout=25,check=False)
        return result.stdout if result.returncode==0 else ""
    except (OSError,subprocess.TimeoutExpired):
        return ""

def main():
    parser=argparse.ArgumentParser(description="RabbitMole: inventario local")
    parser.add_argument("--output","-o",required=True)
    args=parser.parse_args()
    path=pathlib.Path(args.output).expanduser().absolute()
    if path.exists() or not path.parent.is_dir():parser.error("El destino debe ser un archivo nuevo en una carpeta existente.")
    print("[RabbitMole] Detectando sistema...",flush=True)
    if sys.platform=="win32":
        engine=shutil.which("powershell.exe") or shutil.which("pwsh")
        if not engine:parser.error("PowerShell no disponible")
        print("[RabbitMole] Windows: delegando inventario CIM y registro a PowerShell",flush=True)
        result=subprocess.run([engine,"-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-File",str(pathlib.Path(__file__).with_suffix(".ps1")),"-Output",str(path)])
        if result.returncode:parser.error("Falló el recolector de Windows")
        return
    if not sys.platform.startswith("linux"):parser.error("Sistema no soportado por este recolector")
    print("[RabbitMole] Linux: consultando hardware, interfaces y paquetes...",flush=True)
    host=socket.gethostname()
    asset={"name":host,"type":"PC / portátil","os":platform.platform(),
           "cpu":platform.processor(),"osLicense":"Pendiente de verificar",
           "avRealtime":"No verificada","notes":"Observación local pendiente de contrastar."}
    limitations=[]
    try:
        release=pathlib.Path("/etc/os-release").read_text()
        match=re.search(r'^PRETTY_NAME="?([^"\n]+)',release,re.M)
        if match:asset["os"]=match.group(1)
        mem=pathlib.Path("/proc/meminfo").read_text()
        match=re.search(r"^MemTotal:\s+(\d+)",mem,re.M)
        if match:asset["ram"]=f"{int(match.group(1))/1048576:.1f} GiB"
    except OSError:limitations.append("Información de distribución o RAM parcialmente inaccesible")
    disks=command("lsblk","-dn","-o","NAME,SIZE,TYPE,MODEL")
    if disks:asset["storage"]="; ".join(disks.splitlines()[:12])[:600]
    nets=[]
    for line in command("ip","-o","-4","addr","show","scope","global").splitlines()[:32]:
        match=re.search(r"^\d+:\s+(\S+)\s+inet\s+(\d+\.\d+\.\d+\.\d+/\d+)",line)
        if match:nets.append({"name":match.group(1),"cidr":match.group(2),"notes":"Interfaz observada; VLAN y DHCP por verificar."})
    if nets:asset["ip"]=nets[0]["cidr"].split("/")[0]
    else:limitations.append("Interfaces IPv4 no disponibles mediante iproute2")
    soft=[];seen=set()
    sources=[("dpkg-query",["-W","-f="+chr(36)+"{Package}\\t"+chr(36)+"{Version}\\n"]),
             ("rpm",["-qa","--qf","%{NAME}\\t%{VERSION}\\n"]),
             ("pacman",["-Q"])]
    for engine,flags in sources:
        if not shutil.which(engine):continue
        result=command(engine,*flags)
        if not result:continue
        for line in result.splitlines():
            if len(soft)>=450:break
            parts=line.split("\t",1) if "\t" in line else line.split(" ",1)
            name=parts[0][:190]
            if not name or name in seen:continue
            seen.add(name)
            soft.append({"name":name,"version":parts[1][:100] if len(parts)>1 else "",
                         "asset":host,"licenseStatus":"Pendiente de verificar",
                         "support":"Pendiente de verificar","notes":"Paquete observado mediante "+engine+"; comprobar relevancia y licencia."})
        if len(result.splitlines())>450:limitations.append("Lista de paquetes limitada a 450 registros")
        break
    if not soft:limitations.append("Gestor de paquetes no accesible")
    doc={"kind":"rabbitmole-discovery-v1","schemaVersion":1,
         "capturedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),
         "source":{"platform":"Linux","collector":"collect-local.py","scope":"local",
                   "mode":"read-only","privilege":"usuario actual","limitations":limitations},
         "items":{"assets":[asset],"networks":nets,"software":soft}}
    data=json.dumps(doc,ensure_ascii=False,indent=2).encode("utf-8")
    if len(data)>2*1024*1024:parser.error("El JSON supera los 2 MiB admitidos")
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,"wb") as stream:stream.write(data)
    print(f"[RabbitMole] Guardado: {path} | redes: {len(nets)} | programas: {len(soft)}",flush=True)
    for note in limitations:print("[LIMITACIÓN] "+note,flush=True)

if __name__=="__main__":main()
