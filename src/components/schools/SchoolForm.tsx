
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { School, Sector } from '@/lib/api/types';

interface SchoolFormProps {
  onSubmit: (school: Omit<School, 'id'>) => Promise<void>;
  initialData?: School;
  sectors: Sector[];
}

const SchoolForm = ({ onSubmit, initialData, sectors }: SchoolFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [sectorId, setSectorId] = useState(initialData?.sectorId || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSectorId(initialData.sectorId);
      setAddress(initialData.address || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const schoolData = {
        name,
        sectorId,
        address,
        email,
        phone,
        createdAt: initialData?.createdAt || new Date().toISOString()
      };

      await onSubmit(schoolData);
      toast.success(`School ${initialData ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error submitting school:', error);
      toast.error(`Failed to ${initialData ? 'update' : 'create'} school.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">School Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter school name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select value={sectorId} onValueChange={setSectorId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter school address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter school email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter school phone number"
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update School' : 'Create School'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SchoolForm;
