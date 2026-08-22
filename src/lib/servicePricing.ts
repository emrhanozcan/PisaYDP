import type { ServiceLog, ServiceType } from "@/types";

/** The saved log price is authoritative; the service type price is a legacy fallback. */
export function resolveServiceLogPrice(
    log: Pick<ServiceLog, "unitPrice">,
    serviceType?: Pick<ServiceType, "unitPrice"> | null
): number {
    return log.unitPrice ?? serviceType?.unitPrice ?? 0;
}
