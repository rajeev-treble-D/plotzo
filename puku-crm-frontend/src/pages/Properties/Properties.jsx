import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Edit2,
  Eye,
  Home,
  Loader2,
  MapPin,
  Search,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import ConfirmationModal from "../../components/ConfirmationModal";
import Pagination from "../../components/Pagination";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import PropertyDetails from "./PropertyDetails";

const Properties = () => {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const tx = useCallback((key, defaultValue) => t(key, { defaultValue }), [t]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [modelType, setModelType] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const [formData, setFormData] = useState({
    property_name: "",
    property_type: "plot",
    project_name: "",
    status: "available",
    state_id: "",
    city_id: "",
    details: {},
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const params = filterType === "all" ? {} : { property_type: filterType };
      const res = await api.get("/properties", { params });
      setProperties(res.data.properties || []);
    } catch (err) {
      console.error("Failed to fetch properties", err);
      showToast(
        tx("properties.loading_error", "Failed to fetch properties"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [filterType, showToast, tx]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [statesRes, citiesRes] = await Promise.all([
          api.get("/states"),
          api.get("/cities"),
        ]);
        setStates(statesRes.data.states || []);
        setCities(citiesRes.data.cities || []);
      } catch (err) {
        console.error("Failed to fetch property locations", err);
      }
    };

    fetchLocations();
  }, []);

  const filteredProperties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return properties;

    return properties.filter((property) => {
      return [
        property.property_name,
        property.project_name,
        property.property_type,
        property.status,
        property.state_name,
        property.city_name,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term),
      );
    });
  }, [properties, searchTerm]);

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredProperties.slice(start, start + limit);
  }, [currentPage, filteredProperties]);

  const filteredCities = useMemo(() => {
    if (!formData.state_id) return cities;
    return cities.filter(
      (city) => String(city.state_id) === String(formData.state_id),
    );
  }, [cities, formData.state_id]);

  const fetchPropertyDetails = async (property) => {
    if (!property) return null;

    try {
      const res = await api.get(`/properties/${property.id}`);
      return res.data.property || property;
    } catch (err) {
      console.error("Failed to fetch property details", err);
      showToast(
        tx("properties.detail_error", "Failed to fetch property details"),
        "error",
      );
      return property;
    }
  };

  const closeModel = () => {
    setModelType(null);
    setSelectedProperty(null);
  };

  const handleOpenModifyModel = async (property = null) => {
    if (property) {
      const propertyForForm = await fetchPropertyDetails(property);

      setSelectedProperty(propertyForForm);
      setFormData({
        property_name: propertyForForm.property_name || "",
        property_type: propertyForForm.property_type || "plot",
        project_name: propertyForForm.project_name || "",
        status: propertyForForm.status || "available",
        state_id: propertyForForm.state_id || "",
        city_id: propertyForForm.city_id || "",
        details: propertyForForm.details || {},
      });
    } else {
      setSelectedProperty(null);
      setFormData({
        property_name: "",
        property_type: "plot",
        project_name: "",
        status: "available",
        state_id: states[0]?.id || "",
        city_id: "",
        details: {},
      });
    }
    setModelType("modify");
  };

  const handleOpenViewModel = async (property) => {
    const propertyForView = await fetchPropertyDetails(property);
    setSelectedProperty(propertyForView);
    setModelType("view");
  };

  const handleDetailChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const details = Object.fromEntries(
        Object.entries(formData.details || {}).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ]),
      );
      const payload = {
        ...formData,
        state_id: formData.state_id || null,
        city_id: formData.city_id || null,
        details,
      };

      if (selectedProperty) {
        await api.put(`/properties/${selectedProperty.id}`, payload);
        showToast(
          tx("properties.update_success", "Property updated successfully"),
          "success",
        );
      } else {
        await api.post("/properties", payload);
        showToast(
          tx("properties.add_success", "Property created successfully"),
          "success",
        );
      }

      closeModel();
      fetchProperties();
    } catch (err) {
      console.error("Failed to save property", err);
      showToast(
        tx("properties.save_error", "Failed to save property"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    setSubmitting(true);
    try {
      await api.delete(`/properties/${propertyToDelete.id}`);
      showToast(
        tx("properties.delete_success", "Property deleted successfully"),
        "success",
      );
      setPropertyToDelete(null);
      fetchProperties();
    } catch (err) {
      console.error("Failed to delete property", err);
      showToast(
        tx("properties.delete_error", "Failed to delete property"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getPropertyTypeLabel = (type) => {
    const labels = {
      all: tx("properties.filter.all", "All"),
      plot: tx("properties.filter.plot", "Plot"),
      apartment: tx("properties.filter.apartment", "Apartment"),
      joint_venture: tx("properties.filter.joint_venture", "Joint Venture"),
      rental: tx("properties.filter.rental", "Rental"),
    };

    return labels[type] || type || "N/A";
  };

  const stats = [
    {
      label: t("properties.stats.rented"),
      count: properties.filter((p) => p.status === "rented").length,
      color: "bg-blue-500",
    },
    {
      label: t("properties.stats.under_construction"),
      count: properties.filter((p) => p.status === "under_construction").length,
      color: "bg-orange-500",
    },
    {
      label: t("properties.stats.available"),
      count: properties.filter((p) => p.status === "available").length,
      color: "bg-green-500",
    },
    {
      label: t("properties.stats.sold"),
      count: properties.filter((p) => p.status === "sold").length,
      color: "bg-slate-500",
    },
    {
      label: t("properties.stats.total"),
      count: properties.length,
      color: "bg-primary-500",
    },
  ];
  const getTypeStyles = (type) => {
    switch (type) {
      case "plot":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "apartment":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "rental":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "joint_venture":
        return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "sold":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "rented":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "under_construction":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "N/A";
    if (status == 'rented') {
        return t('properties.stats.rented')
    } else if (status == 'sold') {
        return t('properties.stats.sold')
    } else if (status == 'under_construction') {
        return t('properties.stats.under_construction')
    } else if (status == 'available') {
        return t('properties.stats.available')
    }
  };

  const propertyTypeOptions = [
    "all",
    "plot",
    "apartment",
    "joint_venture",
    "rental",
  ];

  const modalPropertyTypeOptions = propertyTypeOptions.filter(
    (type) => type !== "all",
  );

  const statusOptions = ["available", "sold", "rented", "under_construction"];

  const renderDetailFields = () => {
    const inputClass =
      "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold";
    const labelClass =
      "block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1";

    const field = (name, type = "text", placeholder = "") => (
      <div>
        <label className={labelClass}>{t(`properties.modal.${name}`)}</label>
        <input
          type={type}
          step={type === "number" ? "0.01" : undefined}
          placeholder={placeholder}
          className={inputClass}
          value={formData.details[name] || ""}
          onChange={(e) => handleDetailChange(name, e.target.value)}
        />
      </div>
    );

    switch (formData.property_type) {
      case "apartment":
        return (
          <>
            {field("bhk_type", "text", "2 BHK")}
            {field("area_sqft", "number", "1200")}
            {field("floor", "text", "5th")}
            {field("tower_block", "text", "A Block")}
            {field("amenities", "text", "Parking, Gym")}
            {field("total_price", "number", "0.00")}
          </>
        );
      case "rental":
        return (
          <>
            {field("area_sqft", "number", "1200")}
            {field("monthly_rent", "number", "0.00")}
            {field("security_deposit", "number", "0.00")}
            {field("lease_period", "text", "11 months")}
            {field("tenant_name")}
          </>
        );
      case "joint_venture":
        return (
          <>
            {field("partner_name",)}
            {field("profit_sharing_ratio", "text", "60:40")}
            {field("land_area", "number", "0.00")}
            {field("project_status", "text", "Planning")}
            {field("total_project_value", "number", "0.00")}
          </>
        );
      case "plot":
      default:
        return (
          <>
            {field("area_sq_yard", "number", "200")}
            {field("dimensions", "text", "40 x 45")}
            {field("facing", "text", "East")}
            {field("price_per_sq_yard", "number", "0.00")}
            {field("total_price", "number", "0.00")}
          </>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">
            {tx("properties.title", "Properties")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {tx(
              "properties.subtitle",
              "Manage plots, apartments, rentals, and joint ventures",
            )}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleOpenModifyModel()}
            className="btn btn-primary flex-1 sm:flex-none flex items-center gap-2"
          >
            <Plus size={20} />
            {tx("properties.record_new", "Add New Property")}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card !p-4 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-all"
          >
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {stat.count}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">
              {stat.label}
            </p>
            <div
              className={`w-12 h-1 ${stat.color} rounded-full mt-3 opacity-40 group-hover:opacity-100 transition-opacity`}
            ></div>
          </div>
        ))}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder={tx(
                "properties.search_placeholder",
                "Search properties...",
              )}
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {propertyTypeOptions.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                  filterType === type
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {getPropertyTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">
                  {tx("properties.table.property", "Property")}
                </th>
                <th className="px-6 py-4">
                  {tx("properties.table.project", "Project")}
                </th>
                <th className="px-6 py-4">
                  {tx("properties.table.type", "Type")}
                </th>
                <th className="px-6 py-4">
                  {tx("properties.table.location", "Location")}
                </th>
                <th className="px-6 py-4">
                  {tx("properties.table.status", "Status")}
                </th>
                <th className="px-6 py-4 text-right">
                  {tx("common.actions", "Actions")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Loader2
                        size={32}
                        className="animate-spin text-primary-500"
                      />
                      <span>{tx("common.loading", "Loading...")}</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProperties.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <Building2
                      size={44}
                      className="mx-auto mb-3 text-slate-200 dark:text-slate-700"
                    />
                    <p className="font-semibold">
                      {tx("common.no_results", "No results found")}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProperties.map((property) => (
                  <tr
                    key={property.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
                          <Home size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">
                            {property.property_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            #PROP-{1000 + Number(property.id || 0)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {property.project_name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getTypeStyles(property.property_type)}`}
                      >
                        {getPropertyTypeLabel(property.property_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin size={14} className="text-slate-400" />
                        {[property.city_name, property.state_name]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyles(property.status)}`}
                      >
                        {formatStatus(property.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenViewModel(property)}
                          className="p-2 transition-all rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          title={tx("common.view", "View")}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModifyModel(property)}
                          className="p-2 transition-all rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title={tx("common.edit", "Edit")}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(property)}
                          className="p-2 transition-all rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title={tx("common.delete", "Delete")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          total={filteredProperties.length}
          limit={limit}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* Modal for View/Create/Edit Property */}
        {modelType && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={closeModel}
            ></div>
            <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 ${modelType === "view" ? "max-w-4xl" : "max-w-3xl"}`}>
              {modelType === "view" ? (
                <>
                  <button
                    onClick={closeModel}
                    className="absolute right-4 top-4 z-20 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                    title={tx("common.close", "Close")}
                  >
                    <X size={20} />
                  </button>
                  <PropertyDetails
                    property={selectedProperty}
                    formatStatus={formatStatus}
                    getPropertyTypeLabel={getPropertyTypeLabel}
                    getStatusStyles={getStatusStyles}
                    getTypeStyles={getTypeStyles}
                  />
                </>
              ) : (
                <>
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      {selectedProperty
                        ? tx("properties.modal.edit_title", "Edit Property")
                        : tx("properties.modal.add_title", "Add Property")}
                    </h3>
                    <button
                      onClick={closeModel}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">
                        {tx("properties.modal.name_label", "Property Name")}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder={tx(
                          "properties.modal.name_placeholder",
                          "Enter property name",
                        )}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
                        value={formData.property_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            property_name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">
                        {tx("properties.modal.project_label", "Project Name")}
                      </label>
                      <input
                        type="text"
                        placeholder={tx(
                          "properties.modal.project_placeholder",
                          "Optional project name",
                        )}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
                        value={formData.project_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            project_name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">
                        {tx("properties.modal.type_label", "Property Type")}
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100 font-bold transition-all"
                        value={formData.property_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            property_type: e.target.value,
                            details: {},
                          })
                        }
                      >
                        {modalPropertyTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {getPropertyTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">
                        {tx("properties.modal.status_label", "Status")}
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100 font-bold transition-all"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {formatStatus(status)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">
                        {tx("properties.modal.state_label", "State")}
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100 font-bold transition-all"
                        value={formData.state_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            state_id: e.target.value,
                            city_id: "",
                          })
                        }
                      >
                        <option value="">
                          {tx("properties.modal.state_select", "Select state")}
                        </option>
                        {states.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.state_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">
                        {tx("properties.modal.city_label", "City")}
                      </label>
                      <select
                        required
                        disabled={!formData.state_id}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100 font-bold transition-all"
                        value={formData.city_id}
                        onChange={(e) =>
                          setFormData({ ...formData, city_id: e.target.value })
                        }
                      >
                        <option value="">
                          {formData.state_id ? tx("properties.modal.city_select", "Select city"): tx("properties.modal.fisrt_state_select", "Select State First")}
                        </option>
                        {filteredCities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.city_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">
                      {tx("properties.modal.details_title", "Property Details")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderDetailFields()}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeModel}
                    className="px-6 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase text-[10px] tracking-widest"
                  >
                    {tx("common.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white rounded-xl font-black transition-all flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : selectedProperty ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                    {selectedProperty
                      ? tx("properties.modal.save_changes", "Save Changes")
                      : tx("properties.modal.create_btn", "Create Property")}
                  </button>
                </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={Boolean(propertyToDelete)}
        onConfirm={confirmDelete}
        onCancel={() => setPropertyToDelete(null)}
        title={tx("properties.delete.title", "Delete property?")}
        message={
          propertyToDelete
            ? `${tx("properties.delete.confirm_text", "Are you sure you want to delete")} "${propertyToDelete.property_name}"?`
            : ""
        }
        confirmText={tx("properties.delete.delete_btn", "Delete")}
        loading={submitting}
      />
    </div>
  );
};

export default Properties;
