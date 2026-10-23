"""Ephemeral inventory capture consent and lifecycle tests, no subprocesses."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'discovery'))
import inventory

class InventoryCaptureTests(unittest.TestCase):
    def setUp(self):
        self.clock=[10.0]
        self.capture=inventory.InventoryCapture(clock=lambda:self.clock[0])

    def test_accept_then_consume_once(self):
        req=self.capture.begin()['requestId']
        self.assertEqual(self.capture.pending(),req)
        with self.assertRaises(ValueError):
            self.capture.begin()
        self.assertFalse(self.capture.decide('invalid',True))
        self.assertTrue(self.capture.decide(req,True))
        self.assertEqual(self.capture.status(req)['state'],'running')
        document={'kind':'rabbitmole-discovery-v1','schemaVersion':1,
                  'items':{'assets':[{'name':'PC'}],'networks':[],'software':[]}}
        self.assertTrue(self.capture.finish(req,document=document))
        self.assertEqual(self.capture.status(req)['capture'],document)
        self.assertEqual(self.capture.status(req)['state'],'expired')

    def test_denial_and_expiry(self):
        req=self.capture.begin()['requestId']
        self.assertTrue(self.capture.decide(req,False))
        self.assertEqual(self.capture.status(req)['state'],'denied')
        self.clock[0]=200
        self.assertEqual(self.capture.status(req)['state'],'expired')

    def test_large_or_invalid_results_rejected(self):
        req=self.capture.begin()['requestId']
        self.capture.decide(req,True)
        self.capture.finish(req,document={'kind':'not-valid'})
        self.assertEqual(self.capture.status(req)['state'],'error')
        req=self.capture.begin()['requestId']
        self.capture.decide(req,True)
        self.capture.finish(req,document={'kind':'rabbitmole-discovery-v1','data':'a'*(2*1024*1024)})
        self.assertEqual(self.capture.status(req)['state'],'error')

    def test_revocation(self):
        req=self.capture.begin()['requestId']
        self.capture.revoke()
        self.assertIsNone(self.capture.pending())
        self.assertEqual(self.capture.status(req)['state'],'expired')

if __name__=='__main__':unittest.main()
