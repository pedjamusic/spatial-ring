import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { H1 } from "../components/typography/H1";
import LoadingSpinner from "../components/LoadingSpinner";
import { authFetch, resource } from "../lib/api";
import { toast } from "../lib/toast";

function formatDateTime(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDurationLabel(startsAt, endsAt) {
  if (!startsAt || !endsAt) return "Not set";
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
    return "Not set";

  const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Invalid date range";
  if (days === 0) return "Same day";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function toDateTimeLocalValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function EventViewPage() {
  const { id } = useParams();
  const location = useLocation();
  const eventsApi = useMemo(() => resource("events"), []);

  const [event, setEvent] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [eventLocations, setEventLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState({
    name: "",
    locationId: "",
    startsAt: "",
    endsAt: "",
    notes: "",
  });

  const [assetId, setAssetId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const returnTo =
    typeof location.state?.returnTo === "string" &&
    location.state.returnTo.startsWith("/admin")
      ? location.state.returnTo
      : "/admin/events";

  const selectedAsset = availableAssets.find((asset) => asset.id === assetId);
  const parsedQuantity = Number(quantity);

  const loadData = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const [eventData, assignmentData, assignableData, locationsData] =
          await Promise.all([
            eventsApi.get(id, { signal }),
            authFetch(`events/${id}/assignments`, { signal }),
            authFetch(`events/${id}/assignable-assets`, { signal }),
            authFetch("eventLocations?limit=200", { signal }),
          ]);

        setEvent(eventData);
        setAssignments(assignmentData.data || []);
        setAvailableAssets(assignableData.data || []);
        setEventLocations(locationsData.data || []);
        setDetailsForm({
          name: eventData.name || "",
          locationId: eventData.locationId || "",
          startsAt: toDateTimeLocalValue(eventData.startsAt),
          endsAt: toDateTimeLocalValue(eventData.endsAt),
          notes: eventData.notes || "",
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load event");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [eventsApi, id],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  useEffect(() => {
    setQuantity(1);
  }, [assetId]);

  const handleAssignAsset = async (e) => {
    e.preventDefault();
    if (!assetId) {
      toast.warning("Select an asset to assign.");
      return;
    }

    setSubmitting(true);
    try {
      await authFetch(`events/${id}/assignments`, {
        method: "POST",
        body: JSON.stringify({
          assetId,
          quantity: Number(quantity),
          notes: notes || null,
        }),
      });

      toast.success("Asset assigned to event.");
      setAssetId("");
      setQuantity(1);
      setNotes("");
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to assign asset");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetailsChange = (field, value) => {
    setDetailsForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelDetails = () => {
    if (!event) return;
    setDetailsForm({
      name: event.name || "",
      locationId: event.locationId || "",
      startsAt: toDateTimeLocalValue(event.startsAt),
      endsAt: toDateTimeLocalValue(event.endsAt),
      notes: event.notes || "",
    });
    setIsEditingDetails(false);
  };

  const handleSaveDetails = async () => {
    const trimmedName = detailsForm.name.trim();
    if (!trimmedName) {
      toast.warning("Event name is required.");
      return;
    }

    if (detailsForm.startsAt && detailsForm.endsAt) {
      const startsAtDate = new Date(detailsForm.startsAt);
      const endsAtDate = new Date(detailsForm.endsAt);
      if (endsAtDate < startsAtDate) {
        toast.warning("End date must be after start date.");
        return;
      }
    }

    setSavingDetails(true);
    try {
      await eventsApi.update(id, {
        name: trimmedName,
        locationId: detailsForm.locationId || null,
        startsAt: detailsForm.startsAt || null,
        endsAt: detailsForm.endsAt || null,
        notes: detailsForm.notes?.trim() ? detailsForm.notes.trim() : null,
      });
      toast.success("Event details updated.");
      setIsEditingDetails(false);
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to update event details.");
    } finally {
      setSavingDetails(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="grid gap-y-4">
        <PageHeader />
        <div className="rounded-xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }
  if (!event) return <div>Event not found</div>;

  return (
    <div className="grid gap-y-4">
      <PageHeader />

      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-hidden">
          <H1 className="overflow-hidden text-ellipsis whitespace-nowrap">{event.name}</H1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={returnTo}
            className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Back
          </Link>
          <Link
            to={`/admin/events/${event.id}/edit`}
            state={{ returnTo, returnLabel: "Event Details" }}
            className="shadow-glow focus:outline-hidden inline-flex items-center rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-blue-600/50 hover:bg-blue-500 focus:bg-blue-800"
          >
            Edit
          </Link>
        </div>
      </div>

      <section className="not-dark:shadow rounded-xl border border-gray-300 bg-white p-6 dark:border-neutral-700/50 dark:bg-neutral-800/50">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
            View Event Details
          </h2>
          {isEditingDetails ? (
            <div className="shadow-2xs inline-flex rounded-xl">
              <button
                type="button"
                onClick={handleCancelDetails}
                className="focus:outline-hidden -ms-px inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 first:ms-0 first:rounded-s-xl last:rounded-e-xl hover:bg-gray-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={savingDetails}
                className="shadow-glow focus:outline-hidden -ms-px inline-flex items-center border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-blue-600/50 first:ms-0 first:rounded-s-xl last:rounded-e-xl hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingDetails ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingDetails(true)}
              className="shadow-glow inline-flex items-center rounded-xl border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-blue-600/50 hover:bg-blue-500"
            >
              Live Edit
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-500">
              Name
            </p>
            {isEditingDetails ? (
              <input
                type="text"
                value={detailsForm.name}
                onChange={(e) => handleDetailsChange("name", e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-0 focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {event.name}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-500">
              Location
            </p>
            {isEditingDetails ? (
              <select
                value={detailsForm.locationId}
                onChange={(e) =>
                  handleDetailsChange("locationId", e.target.value)
                }
                className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-0 focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="">No location</option>
                {eventLocations.map((eventLocation) => (
                  <option key={eventLocation.id} value={eventLocation.id}>
                    {eventLocation.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {event.location?.name || "Not set"}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-500">
              Starts
            </p>
            {isEditingDetails ? (
              <input
                type="datetime-local"
                value={detailsForm.startsAt}
                onChange={(e) =>
                  handleDetailsChange("startsAt", e.target.value)
                }
                className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-0 focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDateTime(event.startsAt)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-500">
              Ends
            </p>
            {isEditingDetails ? (
              <input
                type="datetime-local"
                value={detailsForm.endsAt}
                onChange={(e) => handleDetailsChange("endsAt", e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-0 focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDateTime(event.endsAt)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-500">
              Duration
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {getDurationLabel(event.startsAt, event.endsAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-500">
              Created
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {formatDateTime(event.createdAt)}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-500">
              Notes
            </p>
            {isEditingDetails ? (
              <textarea
                rows={3}
                value={detailsForm.notes}
                onChange={(e) => handleDetailsChange("notes", e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-0 focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {event.notes || "No notes."}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="not-dark:shadow rounded-xl border border-gray-300 bg-white p-6 dark:border-neutral-700/50 dark:bg-neutral-800/50">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
          Assets Used
        </h2>

        <form
          onSubmit={handleAssignAsset}
          className="mb-6 grid gap-3 lg:grid-cols-4"
        >
          <label className="block text-sm text-gray-700 lg:col-span-2 dark:text-neutral-200">
            Asset
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-0 focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              <option value="">Select an asset</option>
              {availableAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                  {asset.category?.name ? ` (${asset.category.name})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-gray-700 dark:text-neutral-200">
            Quantity
            <input
              type="number"
              min={1}
              max={selectedAsset?.availableQuantity || undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-0 focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </label>

          <button
            type="submit"
            disabled={
              submitting ||
              !availableAssets.length ||
              !selectedAsset ||
              !Number.isInteger(parsedQuantity) ||
              parsedQuantity <= 0 ||
              parsedQuantity > selectedAsset.availableQuantity
            }
            className="shadow-glow inline-flex items-center justify-center self-end rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-blue-600/50 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Assigning..." : "Assign Asset"}
          </button>

          <label className="block text-sm text-gray-700 lg:col-span-4 dark:text-neutral-200">
            Notes
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional assignment notes"
              className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-0 focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </label>
        </form>

        {!assignments.length ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
            No assets are currently assigned to this event.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 text-left text-sm dark:divide-neutral-700">
              <thead>
                <tr className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-400">
                  <th className="py-2 pr-3">Asset</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Assigned Qty</th>
                  <th className="py-2 pr-3">Last Assigned</th>
                  <th className="py-2 pr-3">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {assignments.map((assignment) => (
                  <tr key={assignment.assetId}>
                    <td className="py-2 pr-3 text-gray-900 dark:text-gray-100">
                      {assignment.asset?.name || "Unknown"}
                    </td>
                    <td className="py-2 pr-3 text-gray-700 dark:text-neutral-300">
                      {assignment.asset?.category?.name || "Uncategorized"}
                    </td>
                    <td className="py-2 pr-3 text-gray-700 dark:text-neutral-300">
                      {assignment.assignedQuantity}
                    </td>
                    <td className="py-2 pr-3 text-gray-700 dark:text-neutral-300">
                      {formatDateTime(assignment.lastAssignedAt)}
                    </td>
                    <td className="py-2 pr-3 text-gray-700 dark:text-neutral-300">
                      {assignment.lastAssignedBy?.name || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
