import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { legendItems } from "@/module/employee-dashboard/constants/legend-items";

export function LegendContent() {
    return (
        <div className="space-y-3">
            {legendItems.map(item => (
                <div key={item.status} className="flex items-baseline gap-2">
                    <span>{statusIcons[item.status]}</span>
                    <span>
                        <span className="text-brand-dark text-xs font-medium">{item.label}</span>
                        {item.description && (
                            <span className="text-brand-dark60 text-xs font-medium"> - {item.description}</span>
                        )}
                    </span>
                </div>
            ))}
        </div>
    );
}