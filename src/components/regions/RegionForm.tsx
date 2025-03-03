
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

interface RegionFormProps {
  onSubmit: (data: { name: string }) => void;
  initialData?: { name: string };
}

export const RegionForm: React.FC<RegionFormProps> = ({ 
  onSubmit, 
  initialData
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || { name: '' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Region Name</Label>
        <Input 
          id="name" 
          placeholder="Enter region name"
          {...register("name", { required: "Region name is required" })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message as string}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full">
        {initialData ? 'Update Region' : 'Add Region'}
      </Button>
    </form>
  );
};

export default RegionForm;
