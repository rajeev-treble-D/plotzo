import React from "react";
import {
  Banknote,
  Building2,
  CalendarClock,
  Home,
  Layers,
  MapPin,
  Ruler,
  Tag,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const detailLabels = {
  area_sq_yard: "Area",
  dimensions: "Dimensions",
  facing: "Facing",
  price_per_sq_yard: "Price / Sq Yard",
  total_price: "Total Price",
  bhk_type: "BHK Type",
  area_sqft: "Area",
  floor: "Floor",
  tower_block: "Tower / Block",
  amenities: "Amenities",
  monthly_rent: "Monthly Rent",
  security_deposit: "Security Deposit",
  lease_period: "Lease Period",
  tenant_name: "Tenant Name",
  partner_name: "Partner Name",
  profit_sharing_ratio: "Profit Sharing",
  land_area: "Land Area",
  project_status: "Project Status",
  total_project_value: "Project Value",
};

const currencyFields = new Set([
  "price_per_sq_yard",
  "total_price",
  "monthly_rent",
  "security_deposit",
  "total_project_value",
]);

const iconMap = {
  area_sq_yard: Ruler,
  area_sqft: Ruler,
  dimensions: Ruler,
  facing: Home,
  price_per_sq_yard: Banknote,
  total_price: Banknote,
  bhk_type: Home,
  floor: Layers,
  tower_block: Building2,
  amenities: Tag,
  monthly_rent: Banknote,
  security_deposit: Banknote,
  lease_period: CalendarClock,
  tenant_name: UserRound,
  partner_name: UserRound,
  profit_sharing_ratio: Tag,
  land_area: Ruler,
  project_status: CalendarClock,
  total_project_value: Banknote,
};

const PropertyDetails = ({
  property,
  formatStatus,
  getPropertyTypeLabel,
  getStatusStyles,
  getTypeStyles,
}) => {
  const { t } = useTranslation();
  if (!property) return null;

  const details = property.details || {};
  const detailEntries = Object.entries(details).filter(([key, value]) => {
    return !["id", "property_id", "created_at", "updated_at"].includes(key) &&
      value !== null &&
      value !== undefined &&
      value !== "";
  });

  const modelLabel = (key, defaultValue) =>
    t(`properties.model.${key}`, {
      defaultValue: t(`properties.modal.${key}`, {
        defaultValue,
      }),
    });

  const formatValue = (key, value) => {
    if (currencyFields.has(key)) {
      const amount = Number(value);
      if (!Number.isNaN(amount)) {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(amount);
      }
    }

    if (key === "area_sq_yard") return `${value} sq yd`;
    if (key === "area_sqft") return `${value} sq ft`;
    if (key === "land_area") return `${value} sq ft`;

    return String(value);
  };

  const location = [property.city_name, property.state_name]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-h-[72vh] overflow-y-auto">
      <div className="bg-slate-950 text-white p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              <Building2 size={28} className="text-primary-200" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-primary-200">
                #PROP-{1000 + Number(property.id || 0)}
              </p>
              <h3 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
                {property.property_name ||
                  modelLabel("untitled_property", "Untitled Property")}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getTypeStyles(property.property_type)}`}
                >
                  {getPropertyTypeLabel(property.property_type)}
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyles(property.status)}`}
                >
                  {formatStatus(property.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="md:text-right mr-10">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              {modelLabel("project", "Project")}
            </p>
            <p className="text-lg font-bold mt-1">
              {property.project_name ||
                modelLabel("no_project_linked", "No project linked")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-6 bg-white dark:bg-slate-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {modelLabel("location", "Location")}
                </p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {location || modelLabel("not_available", "N/A")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <Tag size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {modelLabel("category", "Category")}
                </p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {getPropertyTypeLabel(property.property_type)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              {modelLabel("details_title", "Property Details")}
            </h4>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
          </div>

          {detailEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
              <Building2
                size={36}
                className="mx-auto text-slate-300 dark:text-slate-700 mb-3"
              />
              <p className="font-bold text-slate-500 dark:text-slate-400">
                {modelLabel("no_extra_details", "No extra details added yet")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailEntries.map(([key, value]) => {
                const Icon = iconMap[key] || Tag;
                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          {modelLabel(
                            key,
                            detailLabels[key] || key.replaceAll("_", " "),
                          )}
                        </p>
                        <p className="font-black text-slate-900 dark:text-white mt-1 break-words">
                          {formatValue(key, value)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
