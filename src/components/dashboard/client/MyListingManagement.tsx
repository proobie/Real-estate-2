import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../../supabaseClient";
import { API_BASE_URL, authFetch } from "../../../api";
import type { Property } from "../../../types";
import { Plus, Edit, Trash2, Eye, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MyListingForm from "./MyListingForm";

type ViewState = "list" | "create" | "edit";

const parseArrayField = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseObjectField = <T,>(val: any, fallback: T): T => {
  if (!val) return fallback;
  if (typeof val === "object") return val as T;
  try {
    return JSON.parse(val as string) as T;
  } catch {
    return fallback;
  }
};

const normalizeProperty = (raw: any): Property => {
  const createdAtSource = raw.createdAt ?? raw.created_at ?? null;
  const updatedAtSource = raw.updatedAt ?? raw.updated_at ?? null;

  return {
    ...raw,
    images: parseArrayField(raw.images),
    features: parseArrayField(raw.features),
    highlights: parseArrayField(raw.highlights),
    location: parseObjectField(raw.location, { address: "", city: "", coordinates: { lat: 0, lng: 0 } }),
    agent: parseObjectField(raw.agent, {
      id: "",
      name: "",
      email: "",
      phone: "",
      photo: "",
      specialization: "",
      experience: 0,
      languages: [],
      reraLicense: ""
    }),
    createdAt: createdAtSource ? new Date(createdAtSource).toISOString() : raw.createdAt,
    updatedAt: updatedAtSource ? new Date(updatedAtSource).toISOString() : raw.updatedAt,
  };
};

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "pending-approval":
      return "bg-yellow-100 text-yellow-800";
    case "available":
      return "bg-green-100 text-green-800";
    case "sold":
      return "bg-red-100 text-red-800";
    case "rented":
      return "bg-blue-100 text-blue-800";
    case "under-offer":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (status: string) =>
  status
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

interface MyListingManagementProps {
  user: User | null;
}

const MyListingManagement: React.FC<MyListingManagementProps> = ({ user }) => {
  const [listings, setListings] = useState<Property[]>([]);
  const [view, setView] = useState<ViewState>("list");
  const [selected, setSelected] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadListings = async () => {
    if (!user) {
      setListings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("createdBy", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const normalized = Array.isArray(data) ? data.map(normalizeProperty) : [];
      setListings(normalized);
    } catch (e: any) {
      setError(e?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleCreate = () => {
    setSelected(null);
    setView("create");
    setError(null);
  };

  const handleEdit = (property: Property) => {
    setSelected(property);
    setView("edit");
    setError(null);
  };

  const handleCancel = () => {
    setView("list");
    setSelected(null);
    setSubmitting(false);
    setError(null);
  };

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/properties/${propertyId}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to delete listing");
      }
      setFeedback("Listing removed successfully.");
      await loadListings();
    } catch (e: any) {
      setError(e?.message || "Failed to delete listing");
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const method = view === "edit" && selected ? "PUT" : "POST";
      const target =
        method === "POST"
          ? `${API_BASE_URL}/api/properties`
          : `${API_BASE_URL}/api/properties/${selected!.id}`;

      const res = await authFetch(target, { method, body: formData });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to submit listing");
      }
      setFeedback(method === "POST" ? "Listing submitted for approval." : "Listing updated successfully.");
      setView("list");
      setSelected(null);
      await loadListings();
    } catch (e: any) {
      setError(e?.message || "Failed to submit listing");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = useMemo(
    () => listings.filter((listing) => (listing.status || "").toLowerCase() === "pending-approval").length,
    [listings]
  );

  if (!user) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
          Please log in to manage your listings.
        </div>
      </div>
    );
  }

  if (view === "create" || view === "edit") {
    return (
      <div className="p-4 md:p-6 space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <MyListingForm
          user={user}
          mode={view === "edit" ? "edit" : "create"}
          property={view === "edit" ? selected : null}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
          <p className="text-gray-600">
            Submit properties for review. Approved listings will appear on the main site. Pending approvals:{" "}
            <span className="font-semibold">{pendingCount}</span>
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Listing
        </button>
      </div>

      {feedback && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {feedback}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 md:p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Submission Overview</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading your listings…</div>
        ) : listings.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <p className="font-medium">No listings yet.</p>
            <p className="text-sm mt-1">Use the “Add Listing” button to submit your first property.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm md:text-base">
                {listings.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {property.images && property.images[0] ? (
                          <img src={property.images[0]} alt={property.title} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900 line-clamp-1">{property.title}</div>
                          <div className="text-xs text-gray-500">
                            {Number(property.bedrooms) || 0} BHK • {Number(property.area) || 0} sq ft
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="line-clamp-1">
                          {property.location?.city || property.location?.address || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(property.status)}`}>
                        {formatStatus(property.status)}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {property.listingType === "rent" && property.rentAmount
                        ? `₹${Number(property.rentAmount).toLocaleString("en-IN")}/mo`
                        : property.price
                        ? `₹${Number(property.price).toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-gray-500">
                        <button
                          onClick={() => navigate(`/properties/${property.id}`)}
                          className="hover:text-blue-600"
                          title="View listing"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(property)}
                          className="hover:text-blue-600"
                          title="Edit listing"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="hover:text-red-600"
                          title="Delete listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingManagement;
