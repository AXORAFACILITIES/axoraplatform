import type {
  ServiceType,
  PropertyType,
  JobStatus,
  AssignmentStatus,
  PayoutStatus,
  InvoiceStatus,
  ApplicationStatus,
  QuoteStatus,
  ClientType,
} from "@/lib/types/database.types";

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  standard: "Standard",
  deep: "Deep Clean",
  str_turnover: "STR Turnover",
  move_in_out: "Move-In/Out",
  commercial: "Commercial",
  post_construction: "Post-Construction",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: "House",
  apartment: "Apartment",
  condo: "Condo",
  commercial: "Commercial",
  airbnb: "Airbnb / STR",
  multi_unit: "Multi-unit",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  offered: "Offered",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
  removed: "Removed",
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  not_sent: "Not Sent",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  disputed: "Disputed",
};

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

export const PAYOUT_STATUS_VARIANT: Record<PayoutStatus, BadgeVariant> = {
  pending: "warning",
  processing: "info",
  paid: "success",
};

export const JOB_STATUS_VARIANT: Record<JobStatus, BadgeVariant> = {
  pending: "warning",
  assigned: "info",
  in_progress: "info",
  completed: "success",
  cancelled: "default",
  disputed: "danger",
};

export const INVOICE_STATUS_VARIANT: Record<InvoiceStatus, BadgeVariant> = {
  not_sent: "default",
  sent: "info",
  paid: "success",
  overdue: "danger",
  disputed: "danger",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  on_hold: "On Hold",
};

export const APPLICATION_STATUS_VARIANT: Record<ApplicationStatus, BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  on_hold: "info",
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
  lost: "Lost",
};

export const QUOTE_STATUS_VARIANT: Record<QuoteStatus, BadgeVariant> = {
  new: "info",
  contacted: "warning",
  quoted: "warning",
  booked: "success",
  lost: "default",
};

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  residential: "Residential",
  str_host: "STR Host",
  commercial: "Commercial",
  property_manager: "Property Manager",
};
