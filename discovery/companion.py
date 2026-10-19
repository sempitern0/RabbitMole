#!/usr/bin/env python3
"""RabbitMole Companion for Windows: local-only bridge and explicit local capture."""
import pathlib
import queue
import re
import subprocess
import sys
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from urllib.parse import urlsplit
import webbrowser

ROOT = pathlib.Path(__file__).resolve().parent
DEFAULT_ORIGIN = "https://rabbitmole.danieldigitalspace.workers.dev"


def origin(value):
    parsed = urlsplit(value.strip())
    if (parsed.scheme != "https" or not parsed.netloc or parsed.username or
            parsed.password or parsed.path not in ("", "/") or parsed.query or parsed.fragment):
        raise ValueError("Indica el origen HTTPS exacto de RabbitMole, sin ruta.")
    return parsed.scheme + "://" + parsed.netloc


class Companion:
    def __init__(self):
        self.window = tk.Tk()
        self.window.title("RabbitMole Companion · Estación auditora")
        self.window.geometry("570x400")
        self.window.minsize(510, 370)
        self.proc = None
        self.events = queue.Queue()
        self.token = ""
        self.address = tk.StringVar(value=DEFAULT_ORIGIN)
        self.status = tk.StringVar(value="Detenido · Sin escaneos")
        self.session = tk.StringVar(value="La sesión temporal aparecerá al iniciar.")
        panel = ttk.Frame(self.window, padding=20)
        panel.pack(fill="both", expand=True)
        ttk.Label(panel, text="RabbitMole Companion", font=("Segoe UI", 16, "bold")).pack(anchor="w")
        ttk.Label(panel, text="Solo este PC: 127.0.0.1:8766. Sin HTTPS propio ni servicios LAN.").pack(anchor="w", pady=(4, 14))
        ttk.Label(panel, text="Origen HTTPS de la PWA").pack(anchor="w")
        ttk.Entry(panel, textvariable=self.address).pack(fill="x", pady=(4, 12))
        ttk.Label(panel, textvariable=self.status, wraplength=510).pack(anchor="w", pady=(0, 8))
        buttons = ttk.Frame(panel)
        buttons.pack(fill="x", pady=4)
        self.start_button = ttk.Button(buttons, text="Iniciar puente", command=self.start)
        self.start_button.pack(side="left", padx=(0, 8))
        self.stop_button = ttk.Button(buttons, text="Detener", command=self.stop, state="disabled")
        self.stop_button.pack(side="left", padx=(0, 8))
        ttk.Button(buttons, text="Abrir PWA", command=self.open_pwa).pack(side="left")
        ttk.Label(panel, textvariable=self.session, wraplength=510).pack(anchor="w", pady=(14, 6))
        self.copy_button = ttk.Button(panel, text="Copiar token temporal", command=self.copy, state="disabled")
        self.copy_button.pack(anchor="w")
        ttk.Separator(panel).pack(fill="x", pady=16)
        ttk.Button(panel, text="Capturar inventario de este Windows (JSON)…", command=self.capture).pack(anchor="w")
        ttk.Label(panel, text="La captura es local y de solo lectura. El escaneo de red solo comienza tras confirmar AUTORIZO en la PWA.", wraplength=510).pack(anchor="w", pady=(9, 0))
        self.window.protocol("WM_DELETE_WINDOW", self.close)
        self.window.after(100, self.poll)

    def start(self):
        try:
            pwa = origin(self.address.get())
        except ValueError as exc:
            messagebox.showerror("Origen incorrecto", str(exc))
            return
        command = [sys.executable, "-u", str(ROOT / "service.py"),
                   "--loopback-http", "--origin", pwa]
        self.token = ""
        self.proc = subprocess.Popen(command, cwd=str(ROOT), stdout=subprocess.PIPE,
                                     stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                                     text=True, encoding="utf-8", errors="replace",
                                     creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        self.status.set("Iniciando servicio local…")
        self.start_button.config(state="disabled")
        self.stop_button.config(state="normal")
        threading.Thread(target=self.reader, args=(self.proc,), daemon=True).start()

    def reader(self, process):
        try:
            for line in process.stdout:
                self.events.put(("line", line.strip()))
        finally:
            code = process.wait()
            self.events.put(("exit", code))

    def poll(self):
        try:
            while True:
                kind, value = self.events.get_nowait()
                if kind == "line":
                    found = re.search(r"Token temporal .*?: (\S+)", value)
                    if found:
                        self.token = found.group(1)
                        self.status.set("Listo · Servicio solo en 127.0.0.1:8766")
                        self.session.set("Token temporal listo. Cópialo y pégalo en Discovery de la PWA.")
                        self.copy_button.config(state="normal")
                    elif "No se pudo iniciar" in value or "error:" in value.lower():
                        self.status.set("Error de arranque: " + value[:180])
                elif kind == "capture":
                    self.status.set(value)
                    if value.startswith("Captura fallida") or value.startswith("No se ha encontrado"):
                        messagebox.showerror("Captura local", value)
                    else:
                        messagebox.showinfo("Captura local", "JSON generado. Impórtalo en la PWA y revisa los datos.")
                elif kind == "exit":
                    self.proc = None
                    self.token = ""
                    self.copy_button.config(state="disabled")
                    self.start_button.config(state="normal")
                    self.stop_button.config(state="disabled")
                    if not self.status.get().startswith("Error"):
                        self.status.set("Servicio detenido (salida " + str(value) + ")")
                    self.session.set("No hay ninguna sesión activa.")
        except queue.Empty:
            pass
        if self.window.winfo_exists():
            self.window.after(100, self.poll)

    def copy(self):
        if self.token:
            self.window.clipboard_clear()
            self.window.clipboard_append(self.token)
            self.window.update()
            self.session.set("Token copiado al portapapeles. No lo compartas fuera del equipo.")

    def open_pwa(self):
        try:
            webbrowser.open(origin(self.address.get()))
        except ValueError as exc:
            messagebox.showerror("Origen incorrecto", str(exc))

    def capture(self):
        collector = ROOT.parent / "collect-local.ps1"
        if not collector.is_file():
            messagebox.showerror("Captura no disponible", "Falta collect-local.ps1 en el kit.")
            return
        output = filedialog.asksaveasfilename(title="Guardar inventario local", defaultextension=".json",
                                               filetypes=[("JSON", "*.json")],
                                               initialfile="rabbitmole-windows-local.json")
        if not output:
            return
        if pathlib.Path(output).exists():
            messagebox.showerror("Archivo existente", "Elige un nombre nuevo: no se sobrescriben capturas.")
            return
        self.status.set("Recopilando inventario local…")
        def worker():
            commands = [["pwsh", "-NoProfile", "-File", str(collector), "-Output", output],
                        ["powershell.exe", "-NoProfile", "-File", str(collector), "-Output", output]]
            import shutil
            command = next((c for c in commands if shutil.which(c[0])), None)
            if not command:
                self.events.put(("capture", "No se ha encontrado PowerShell."))
                return
            try:
                result = subprocess.run(command, capture_output=True, text=True, timeout=90,
                                        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                self.events.put(("capture", ("Guardado: " + output) if result.returncode == 0 else
                                 ("Captura fallida: " + result.stderr[:200])))
            except (OSError, subprocess.TimeoutExpired) as exc:
                self.events.put(("capture", "Captura fallida: " + str(exc)[:200])
        threading.Thread(target=worker, daemon=True).start()

    def stop(self):
        if self.proc is not None and self.proc.poll() is None:
            self.proc.terminate()
        self.token = ""
        self.copy_button.config(state="disabled")
        self.status.set("Deteniendo servicio…")

    def close(self):
        self.stop()
        self.window.destroy()

    def run(self):
        self.window.mainloop()


if __name__ == "__main__":
    if sys.platform != "win32":
        raise SystemExit("Companion gráfico diseñado para Windows; utiliza run.sh en otras plataformas.")
    Companion().run()
