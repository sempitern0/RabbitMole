"""Ephemeral, consent-driven local inventory capture for the Companion.
Never stores results between sessions or reads arbitrary client file paths.
"""
import json
import secrets
import threading
import time

MAX_BYTES = 2 * 1024 * 1024

class InventoryCapture:
    def __init__(self, clock=time.monotonic):
        self.clock=clock
        self.lock=threading.Lock()
        self.job=None

    def begin(self):
        with self.lock:
            now=self.clock()
            if self.job and self.job["state"] in ("waiting","running") and now<self.job["expires"]:
                raise ValueError("Ya existe una captura pendiente.")
            key=secrets.token_urlsafe(24)
            self.job={"id":key,"state":"waiting","expires":now+90,"capture":None,"error":""}
            return {"requestId":key,"expiresIn":90}

    def pending(self):
        with self.lock:
            j=self.job
            if j and j["state"]=="waiting" and self.clock()<j["expires"]:
                return j["id"]
            return None

    def decide(self,request_id,allow):
        with self.lock:
            j=self.job
            if not j or j["id"]!=request_id or j["state"]!="waiting" or self.clock()>=j["expires"]:
                return False
            j["state"]="running" if allow else "denied"
            j["expires"]=self.clock()+120
            return True

    def finish(self,request_id,document=None,error=""):
        with self.lock:
            j=self.job
            if not j or j["id"]!=request_id or j["state"]!="running" or self.clock()>=j["expires"]:
                return False
            if error:
                j["state"]="error";j["error"]=str(error)[:190]
                return True
            if not isinstance(document,dict) or document.get("kind")!="rabbitmole-discovery-v1":
                j["state"]="error";j["error"]="Captura incompatible."
                return True
            encoded=json.dumps(document,ensure_ascii=False).encode("utf-8")
            if len(encoded)>MAX_BYTES:
                j["state"]="error";j["error"]="La captura supera 2 MiB."
                return True
            j["capture"]=document
            j["state"]="ready"
            return True

    def status(self,request_id):
        with self.lock:
            j=self.job
            if not j or not secrets.compare_digest(j["id"],request_id) or self.clock()>=j["expires"]:
                return {"state":"expired"}
            state=j["state"]
            if state=="ready":
                doc=j["capture"]
                self.job=None
                return {"state":"ready","capture":doc}
            if state=="error":
                error=j["error"]
                self.job=None
                return {"state":"error","error":error}
            return {"state":state}

    def revoke(self):
        with self.lock:
            self.job=None
