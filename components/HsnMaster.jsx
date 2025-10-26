'use client';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const HsnMaster = ({ open, onClose, selected }) => {
  const [hsnForm, setHsnForm] = useState({
    hsncode: '',
    hsnname: '',
    gst: '',
    gstunit: '',
  });
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    if (selected) {
      setHsnForm(selected);
      setIsEditing(true);
    }
  }, [selected]);

  useEffect(() => {
    if (!open) {
      setHsnForm({ hsncode: '', hsnname: '', gst: '', gstunit: '' });
      setIsEditing(false);
    }
  }, [open]);

  const handleSaveHsn = async () => {
    if (!hsnForm.hsncode || !hsnForm.hsnname) {
      alert('Please fill required fields');
      return;
    }

    const endpoint = isEditing ? '/api/hsn-update' : '/api/hsn-add';
    console.log("looser",hsnForm)
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hsnForm),
    });
    const result = await res.json();
    if (result.success) {
      setHsnForm({ hsncode: '', hsnname: '', gst: '', gstunit: '' });
      setIsEditing(false);
      onClose();
    }
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-6 bg-white border border-gray-200 shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 mb-4">
            {isEditing ? 'Edit HSN Code' : 'Add New HSN'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">HSN Code</label>
            <Input
              type="number"
              placeholder="Enter HSN Code"
              value={hsnForm.hsncode}
              onChange={(e) =>
                setHsnForm({ ...hsnForm, hsncode: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">HSN Name</label>
            <Input
              placeholder="Enter Group"
              value={hsnForm.hsnname}
              onChange={(e) =>
                setHsnForm({ ...hsnForm, hsnname: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">GST (%)</label>
            <Input
              placeholder="Enter GST %"
              type="number"
              value={hsnForm.gst}
              onChange={(e) =>
                setHsnForm({ ...hsnForm, gst: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">GST Unit</label>
            <Input
              placeholder="Enter Gst Unit"
              value={hsnForm.gstunit}
              onChange={(e) =>
                setHsnForm({ ...hsnForm, gstunit: e.target.value })
              }
            />
          </div>
        </div>

        <Button
          onClick={handleSaveHsn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isEditing ? 'Update HSN' : 'Save HSN'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default HsnMaster;
