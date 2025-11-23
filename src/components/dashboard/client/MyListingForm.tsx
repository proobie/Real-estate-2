import { useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import PropertyForm from "../admin/PropertyForm";
import type { Property } from "../../../types";

interface MyListingFormProps {
  user: User;
  mode: "create" | "edit";
  property?: Property | null;
  submitting: boolean;
  error: string | null;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const MyListingForm: React.FC<MyListingFormProps> = ({
  user,
  mode,
  property = null,
  submitting,
  error,
  onSubmit,
  onCancel,
}) => {
  const [, setDummyProperties] = useState<Property[]>([]);

  const handleSave = async (formData: FormData) => {
    formData.set("createdBy", user.id);
    formData.set("status", "pending-approval");
    formData.set("verified", "false");
    formData.set("featured", "false");
    await onSubmit(formData);
    return null;
  };

  const heading = useMemo(() => (mode === "edit" ? "Edit Listing" : "Add New Listing"), [mode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{heading}</h2>
          <p className="text-sm text-gray-500">
            Provide accurate details so the admin team can review and approve your listing.
          </p>
        </div>
      </div>
      <PropertyForm
        property={property}
        onSave={handleSave}
        onCancel={onCancel}
        isEdit={mode === "edit"}
        loading={submitting}
        submitError={error}
        setProperties={setDummyProperties}
      />
    </div>
  );
};

export default MyListingForm;


