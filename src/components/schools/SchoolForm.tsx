
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";

interface Sector {
  id: string;
  name: string;
  regionId?: string;
}

interface SchoolFormProps {
  onSubmit: (data: any) => void;
  sectors: Sector[];
  initialData?: any;
}

export const SchoolForm: React.FC<SchoolFormProps> = ({ 
  onSubmit, 
  sectors, 
  initialData 
}) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: initialData || { 
      name: '', 
      sector_id: '', 
      address: '', 
      email: '', 
      phone: '' 
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">School Name</Label>
        <Input 
          id="name" 
          placeholder="Enter school name"
          {...register("name", { required: "School name is required" })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sector">Sector</Label>
        <Controller
          control={control}
          name="sector_id"
          rules={{ required: "Sector is required" }}
          render={({ field }) => (
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.sector_id && (
          <p className="text-sm text-red-500">{errors.sector_id.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input 
          id="address" 
          placeholder="Enter address"
          {...register("address")}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email"
          placeholder="Enter email"
          {...register("email", { 
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Invalid email address"
            }
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input 
          id="phone" 
          placeholder="Enter phone number"
          {...register("phone")}
        />
      </div>
      
      <Button type="submit" className="w-full">
        {initialData ? 'Update School' : 'Add School'}
      </Button>
    </form>
  );
};

export default SchoolForm;
