"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Building2, PlusIcon, Hotel } from "lucide-react";
import { getProperty, deletePropertyById } from "@/lib/Admin/PropertyAPI";
import ScrollPagination from "@/components/Common/ScrollPagination";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/Common/ConfirmDialogBox";
import SearchInput from "@/components/Common/SearchInput";
import { useSearchParams } from "next/navigation";
import { showErrorToast, showSuccessToast } from "@/utils/toastHandler";
import Link from "next/link";
import { capitalizeFirstLetter } from "@/helper/capitalizeFirstLetter";

export default function Properties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [totalRecords, setTotalRecords] = useState(0);
  const limit = "10";
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const agencyId = searchParams.get("agencyId");
  const [totalUnfiltered, setTotalUnfiltered] = useState(0);
  const [totalAgencies, setTotalAgencies] = useState(0);

  const propertyStats = [
    {
      name: "Total Properties",
      value: totalUnfiltered,
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      name: "Total Agencies",
      value: totalAgencies,
      icon: Hotel,
      color: "bg-indigo-500",
    },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleDeleteClick = (property: Property) => {
    setSelectedProperty(property);
    setShowConfirmDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deletePropertyById(id);
      if (response.data.success) {
        //  setTotalRecords((prev) => prev - 1);
        setTotalUnfiltered((prev) => prev - 1);
        setProperties((prev) => prev.filter((c) => c._id !== id));
        showSuccessToast("Property deleted successfully");
      }
    } catch (error) {
      showErrorToast("Error:", error);
    }
  };

  const getAllProperty = useCallback(
    async (
      page = 1,
      search = "",
      status = "",
      agencyIdParam = "",
      append = false
    ) => {
      try {
        setIsFetching(true);
        const res = await getProperty(
          page,
          limit,
          search,
          status,
          agencyIdParam
        );
        if (res.success) {
          setProperties((prev) => (append ? [...prev, ...res.data] : res.data));
          setCurrentPage(res.pagination?.page ?? 1);
          setTotalPages(res.pagination?.totalPages ?? 1);
          // setTotalRecords(res.pagination?.total ?? 0); // ✅ CHANGED: Now uses 'total'
          setTotalUnfiltered(res.pagination?.totalUnfiltered ?? 0); // ✅ NEW: Set totalUnfiltered
          setTotalAgencies(res?.pagination?.totalAgencies ?? 0);
        }
      } catch (error) {
        showErrorToast("Error:", error);
      } finally {
        setIsFetching(false);
      }
    },
    [user?._id]
  );

  useEffect(() => {
    let finalAgencyId = "";
    if (agencyId) {
      finalAgencyId = agencyId;
    }
    setProperties([]);
    getAllProperty(1, debouncedSearchTerm, "", finalAgencyId || "", false);
  }, [getAllProperty, debouncedSearchTerm, agencyId]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isFetching) return;
    const finalAgencyId = agencyId || "";
    getAllProperty(page, debouncedSearchTerm, "", finalAgencyId, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-2 sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="sm:flex-auto">
            <h1 className="text-4xl font-extrabold text-blue-700 dark:text-indigo-300 tracking-tight drop-shadow ">
              Properties
            </h1>
            <p className="mt-1 text-base text-gray-700 dark:text-gray-300">
              Manage all properties in the system. Use search to find properties
              quickly.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-2">
          <dl className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {propertyStats.map((item) => (
              <Link
                key={item.name}
                className="flex justify-between items-center rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 border-t-4 border-blue-500 group"
                href={item.name === "Total Agencies" ? "/admin/agencies" : "#"}
              >
                <div className="">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {item.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
                <div
                  className={`${item.color} rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <item.icon
                    className="h-7 w-7 text-white"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </dl>
        </div>

        {/* Search and Filter */}
        <div className="mt-3 sm:flex sm:items-center sm:gap-x-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              aria-label="Search properties"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-x-auto overflow-y-visible shadow-lg rounded-xl bg-white dark:bg-gray-900 w-full">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  {isFetching && properties.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={7} className="text-center py-12">
                          <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full mx-auto animate-spin mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-300">
                            Loading Properties...
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  ) : properties.length > 0 ? (
                    <>
                      <thead className="bg-blue-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300 sm:pl-6"
                          >
                            Property
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"
                          >
                            Category
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"
                          >
                            Agency
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-blue-700 dark:text-indigo-300"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        {properties.map((property) => (
                          <tr
                            key={property._id}
                            className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {property._id ? (
                                      <Link
                                        className="text-blue-600 font-semibold hover:underline"
                                        href={`/admin/properties/${property._id}`}
                                      >
                                        {property.title || property._id}
                                      </Link>
                                    ) : (
                                      "N/A"
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {capitalizeFirstLetter(property.type)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {capitalizeFirstLetter(property.category)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-700 dark:text-indigo-300 font-semibold">
                              ${property.price?.toLocaleString()}
                            </td>
                            <td className="text-center whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {property?.agencyId?._id ? (
                                <Link
                                  href={`/admin/agencies/${property.agencyId?._id}`}
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 font-medium rounded hover:bg-blue-100 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  aria-label="View Agency"
                                  title="View Agency"
                                >
                                  {property.agencyId?.name}
                                </Link>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm flex gap-2">
                              <button
                                onClick={() => handleDeleteClick(property)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 font-medium rounded hover:bg-red-100 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                                aria-label="Delete Property"
                                title="Delete Property"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  ) : (
                    <tbody>
                      <tr>
                        <td colSpan={7} className="text-center py-16">
                          <div className="flex flex-col items-center justify-center">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              No properties yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                              Start building your property base by adding a new
                              property.
                            </p>
                            {!debouncedSearchTerm && (
                              <div className="flex justify-center mt-4">
                                <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                  <PlusIcon className="h-5 w-5 mr-2" />
                                  Add Property
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
          {properties.length > 0 && (
            <div className="w-full flex justify-center items-center my-4 md:my-6">
              <ScrollPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isFetching}
                hasMore={currentPage < totalPages}
                loader={
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                }
              />
            </div>
          )}
        </div>

        <ConfirmDialog
          open={showConfirmDialog}
          onCancel={() => setShowConfirmDialog(false)}
          onConfirm={() => {
            if (selectedProperty?._id) {
              handleDelete(selectedProperty._id);
            }
            setShowConfirmDialog(false);
            setSelectedProperty(null);
          }}
          heading="Are you sure?"
          description="This property will be deleted, and this action cannot be undone."
          confirmText="Delete"
          cancelText="Back"
          confirmColor="bg-red-600 hover:bg-red-700"
        />
      </div>
    </div>
  );
}
