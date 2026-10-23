#!/usr/bin/env python3
"""Portable Windows Companion: only local listening, consent-controlled pairing."""
import pathlib
import json
import tempfile
import queue
import secrets
import shutil
import subprocess
import sys
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from urllib.parse import urlsplit
import webbrowser

import service

ROOT = pathlib.Path(getattr(sys, "_MEIPASS", pathlib.Path(__file__).resolve().parent))
DEFAULT_ORIGIN = "https://rabbitmole.danieldigitalspace.workers.dev"


def origin(value):
    return service.valid_origin(value)


class Companion:
    def __init__(self):
        self.window = tk.Tk()
        self.window.title("RabbitMole Companion · Estación auditora")
        self.window.geometry("625x470")
        self.window.minsize(545, 410)
        self.server = None
        self.events = queue.Queue()
        self.pending_id = None
        self.pending_inventory_id = None
        self.address = tk.StringVar(value=DEFAULT_ORIGIN)
        self.status = tk.StringVar(value="Detenido · Sin escaneos")
        self.session = tk.StringVar(value="Inicia el Companion y solicita la conexión desde la PWA.")
        panel = ttk.Frame(self.window, padding=20)
        panel.pack(fill="both", expand=True)
        ttk.Label(panel, text="RabbitMole Companion", font=("Segoe UI", 16, "bold")).pack(anchor="w")
        ttk.Label(panel, text="Solo este PC: 127.0.0.1:8766. Sin instalación de agentes ni puertos LAN.").pack(anchor="w", pady=(4, 14))
        ttk.Label(panel, text="Origen HTTPS de la PWA").pack(anchor="w")
        ttk.Entry(panel, textvariable=self.address).pack(fill="x", pady=(4, 12))
        ttk.Label(panel, textvariable=self.status, wraplength=545).pack(anchor="w", pady=(0, 8))
        buttons = ttk.Frame(panel)
        buttons.pack(fill="x", pady=4)
        self.start_button = ttk.Button(buttons, text="Activar Discovery", command=self.start)
        self.start_button.pack(side="left", padx=(0, 8))
        self.stop_button = ttk.Button(buttons, text="Desactivar", command=self.stop, state="disabled")
        self.stop_button.pack(side="left", padx=(0, 8))
        ttk.Button(buttons, text="Abrir PWA", command=self.open_pwa).pack(side="left")
        ttk.Label(panel, textvariable=self.session, wraplength=545).pack(anchor="w", pady=(14, 6))
        approval = ttk.Frame(panel)
        approval.pack(fill="x")
        self.approve_button = ttk.Button(approval, text="Aprobar conexión", command=lambda:self.decide(True),state="disabled")
        self.approve_button.pack(side="left", padx=(0,8))
        self.deny_button = ttk.Button(approval, text="Denegar", command=lambda:self.decide(False),state="disabled")
        self.deny_button.pack(side="left")
        self.inventory_notice=ttk.Label(panel,text="Si la PWA solicita un inventario, deberás aprobarlo en este equipo.",wraplength=545)
        self.inventory_notice.pack(anchor="w",pady=(9,0))
        consent=ttk.Frame(panel)
        consent.pack(fill="x",pady=(5,0))
        self.allow_inventory=ttk.Button(consent,text="Autorizar recopilación",state="disabled",
                                       command=lambda:self.decide_inventory(True))
        self.allow_inventory.pack(side="left",padx=(0,8))
        self.deny_inventory=ttk.Button(consent,text="Denegar",state="disabled",
                                      command=lambda:self.decide_inventory(False))
        self.deny_inventory.pack(side="left")
        ttk.Separator(panel).pack(fill="x", pady=10)
        ttk.Button(panel, text="Capturar inventario de este Windows (JSON)…", command=self.capture).pack(anchor="w")
        ttk.Label(panel, text="La captura es de solo lectura. Cada escaneo de red requiere confirmar AUTORIZO y el CIDR en la PWA.",wraplength=545).pack(anchor="w",pady=(9,0))
        self.window.protocol("WM_DELETE_WINDOW",self.close)
        self.window.after(250,self.poll)

    def start(self):
        try:
            pwa=origin(self.address.get())
            server=service.local_server(pwa)
        except (ValueError, OSError) as exc:
            messagebox.showerror("No se pudo activar Discovery",str(exc))
            return
        self.server=server
        self.start_button.config(state="disabled")
        self.stop_button.config(state="normal")
        self.status.set("Listo · Esperando aprobación en este PC")
        threading.Thread(target=server.serve_forever,kwargs={"poll_interval":.2},daemon=True).start()

    def decide(self, allow):
        if not self.server or not self.pending_id:
            return
        if self.server.pairing.decide(self.pending_id,allow,
                                      secrets.token_urlsafe(32) if allow else ""):
            self.session.set("Conexión autorizada durante esta sesión." if allow else "Conexión denegada.")
        self.pending_id=None
        self.approve_button.config(state="disabled")
        self.deny_button.config(state="disabled")

    def decide_inventory(self, allow):
        if not self.server or not self.pending_inventory_id:
            return
        request_id=self.pending_inventory_id
        if self.server.inventory.decide(request_id,allow):
            if allow:
                self.status.set("Recopilando inventario local autorizado…")
                threading.Thread(target=self.collect_for_pwa,args=(request_id,),daemon=True).start()
            else:
                self.status.set("Solicitud de inventario denegada.")
        self.pending_inventory_id=None
        self.allow_inventory.config(state="disabled")
        self.deny_inventory.config(state="disabled")

    def collect_for_pwa(self,request_id):
        collector=ROOT/"collect-local.ps1"
        if not collector.is_file():
            collector=ROOT.parent/"collect-local.ps1"
        try:
            engine=next((value for value in ("powershell.exe","pwsh") if shutil.which(value)),None)
            if not engine or not collector.is_file():
                raise RuntimeError("PowerShell o collect-local.ps1 no disponible.")
            # Random local temporary path. Never accept paths or commands from the browser.
            with tempfile.TemporaryDirectory(prefix="rabbitmole-inventory-") as directory:
                output=pathlib.Path(directory)/"inventory.json"
                process=subprocess.run([engine,"-NoProfile","-NonInteractive","-File",
                    str(collector),"-Output",str(output)],capture_output=True,text=True,
                    timeout=85,creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0))
                if process.returncode:
                    raise RuntimeError("No se pudo recopilar con los permisos/políticas de este Windows.")
                if not output.is_file() or output.stat().st_size>2*1024*1024:
                    raise RuntimeError("La captura falta o supera 2 MiB.")
                document=json.loads(output.read_text(encoding="utf-8-sig"))
            if self.server:
                self.server.inventory.finish(request_id,document=document)
            self.events.put(("inventory","Inventario capturado. Revisa el borrador en la PWA."))
        except (OSError,ValueError,RuntimeError,subprocess.TimeoutExpired) as error:
            if self.server:
                self.server.inventory.finish(request_id,error=str(error))
            self.events.put(("inventory","Captura no completada: "+str(error)[:130]))

    def poll(self):
        if self.server:
            pending=self.server.pairing.pending()
            if pending and pending!=self.pending_id:
                self.pending_id=pending
                self.session.set("Solicitud de RabbitMole recibida. Aprueba solo si acabas de pulsar Conectar en tu PWA.")
                self.approve_button.config(state="normal")
                self.deny_button.config(state="normal")
            elif self.pending_id and pending is None:
                self.pending_id=None
                self.approve_button.config(state="disabled")
                self.deny_button.config(state="disabled")
        if self.server:
            pending=self.server.inventory.pending()
            if pending and pending!=self.pending_inventory_id:
                self.pending_inventory_id=pending
                self.inventory_notice.config(text="La PWA solicita acceso a hardware, software, red y Defender de ESTE PC. ¿Autorizas la captura?")
                self.allow_inventory.config(state="normal")
                self.deny_inventory.config(state="normal")
            elif self.pending_inventory_id and not pending:
                self.pending_inventory_id=None
                self.allow_inventory.config(state="disabled")
                self.deny_inventory.config(state="disabled")
        try:
            while True:
                kind,msg=self.events.get_nowait()
                if kind=="inventory":
                    self.status.set(msg)
                if kind=="capture":
                    self.status.set(msg)
                    if msg.startswith("Guardado:"):
                        messagebox.showinfo("Captura local", "JSON generado. Impórtalo en la PWA y revisa los datos.")
                    else:
                        messagebox.showerror("Captura local",msg)
        except queue.Empty:
            pass
        if self.window.winfo_exists():
            self.window.after(250,self.poll)

    def open_pwa(self):
        try: webbrowser.open(origin(self.address.get()))
        except ValueError as exc: messagebox.showerror("Origen incorrecto",str(exc))

    def capture(self):
        collector=ROOT/"collect-local.ps1"
        if not collector.is_file():
            collector=ROOT.parent/"collect-local.ps1"
        if not collector.is_file():
            messagebox.showerror("Captura no disponible","Falta collect-local.ps1 en el paquete.")
            return
        output=filedialog.asksaveasfilename(title="Guardar inventario local",defaultextension=".json",
                       filetypes=[("JSON","*.json")],initialfile="rabbitmole-windows-local.json")
        if not output:return
        if pathlib.Path(output).exists():
            messagebox.showerror("Archivo existente","Elige un nombre nuevo. No se sobrescriben capturas.")
            return
        self.status.set("Recopilando inventario local…")
        def worker():
            engine=next((x for x in ("powershell.exe","pwsh") if shutil.which(x)),None)
            if not engine:
                self.events.put(("capture","No se ha encontrado PowerShell."));return
            try:
                p=subprocess.run([engine,"-NoProfile","-NonInteractive","-File",str(collector),"-Output",output],
                                 capture_output=True,text=True,timeout=90,
                                 creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0))
                self.events.put(("capture",("Guardado: "+output) if p.returncode==0 else
                                  ("Captura fallida: "+p.stderr[-200:])))
            except (OSError,subprocess.TimeoutExpired) as exc:
                self.events.put(("capture","Captura fallida: "+str(exc)[:200]))
        threading.Thread(target=worker,daemon=True).start()

    def stop(self):
        if self.server:
            server=self.server
            self.server=None
            server.pairing.revoke()
            server.inventory.revoke()
            server.shutdown()
            server.server_close()
        self.pending_id=None
        self.pending_inventory_id=None
        self.allow_inventory.config(state="disabled")
        self.deny_inventory.config(state="disabled")
        self.start_button.config(state="normal")
        self.stop_button.config(state="disabled")
        self.approve_button.config(state="disabled")
        self.deny_button.config(state="disabled")
        self.status.set("Detenido · Sesiones revocadas")
        self.session.set("Sin conexiones activas.")

    def close(self):
        self.stop()
        self.window.destroy()

    def run(self):
        self.window.mainloop()


if __name__=="__main__":
    if sys.platform!="win32":
        raise SystemExit("Companion gráfico para Windows. En Linux/macOS usa Discovery CLI.")
    Companion().run()
