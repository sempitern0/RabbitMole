"""Ephemeral GUI-approved loopback pairing. No secrets are stored on disk."""
import secrets
import threading
import time


class Pairing:
    def __init__(self, clock=time.monotonic):
        self.clock = clock
        self.lock = threading.Lock()
        self.request = None
        self.cooldown = 0
        self.consumed = False
        self.approved_token = None
        self.session_expires = 0

    def begin(self):
        with self.lock:
            now = self.clock()
            if now < self.cooldown or (self.request and now < self.request["expires"]):
                raise ValueError("Ya existe una solicitud pendiente. Revísala en el Companion.")
            self.request = {"id": secrets.token_urlsafe(24), "expires": now + 90,
                            "decision": "waiting"}
            self.cooldown = now + 5
            self.consumed = False
            return {"requestId": self.request["id"], "expiresIn": 90}

    def pending(self):
        with self.lock:
            r = self.request
            if not r or r["decision"] != "waiting" or self.clock() >= r["expires"]:
                return None
            return r["id"]

    def decide(self, request_id, allow, access_token):
        with self.lock:
            r = self.request
            if not r or r["id"] != request_id or r["decision"] != "waiting" or self.clock() >= r["expires"]:
                return False
            r["decision"] = "approved" if allow else "denied"
            if allow:
                self.approved_token = access_token
                self.session_expires = self.clock() + 3600
            return True

    def status(self, request_id):
        with self.lock:
            r = self.request
            if not r or not secrets.compare_digest(r["id"], request_id):
                return {"state": "expired"}
            if self.clock() >= r["expires"] or self.consumed:
                return {"state": "expired"}
            state = r["decision"]
            if state == "approved":
                self.consumed = True
                return {"state": "approved", "token": self.approved_token}
            if state == "denied":
                self.consumed = True
            return {"state": state}

    def authorized(self, value):
        with self.lock:
            return (bool(self.approved_token) and bool(value) and
                    self.clock() < self.session_expires and
                    secrets.compare_digest(value, self.approved_token))

    def revoke(self):
        with self.lock:
            self.request = None
            self.consumed = False
            self.approved_token = None
            self.session_expires = 0
