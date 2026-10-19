"""No-network unit tests for approved, expiring local pairing."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"discovery"))
import pairing

class PairingTests(unittest.TestCase):
    def test_approved_once_and_revoked(self):
        clock=[0]
        p=pairing.Pairing(clock=lambda:clock[0])
        rid=p.begin()["requestId"]
        self.assertEqual(p.pending(),rid)
        self.assertFalse(p.authorized("secret"))
        self.assertEqual(p.status(rid)["state"],"waiting")
        self.assertFalse(p.decide("bad",True,"secret"))
        self.assertTrue(p.decide(rid,True,"secret"))
        self.assertEqual(p.status(rid),{"state":"approved","token":"secret"})
        self.assertEqual(p.status(rid)["state"],"expired")
        self.assertTrue(p.authorized("secret"))
        clock[0]=3601
        self.assertFalse(p.authorized("secret"))
        p.revoke()
        self.assertIsNone(p.pending())
    def test_denial_parallel_and_timeout(self):
        clock=[0]
        p=pairing.Pairing(clock=lambda:clock[0])
        rid=p.begin()["requestId"]
        with self.assertRaises(ValueError):p.begin()
        self.assertTrue(p.decide(rid,False,""))
        self.assertEqual(p.status(rid)["state"],"denied")
        clock[0]=91
        self.assertEqual(p.status(rid)["state"],"expired")
        new=p.begin()["requestId"]
        self.assertNotEqual(rid,new)
        clock[0]=182
        self.assertFalse(p.decide(new,True,"secret"))
if __name__=="__main__":
    unittest.main()
