import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
    currentPage: number;
    onPageChange: (page: number) => void;
    hasNextPage: boolean;
};

export default function Pagination({ currentPage, onPageChange, hasNextPage }: PaginationProps) {
    const canGoPrevious = currentPage > 1;

    // Build visible page numbers - only show pages that exist
    const pages: number[] = [];
    const startPage = Math.max(1, currentPage - 2);

    // Show up to current page
    for (let i = startPage; i <= currentPage; i++) {
        pages.push(i);
    }

    // Only show next pages if hasNextPage is true
    if (hasNextPage) {
        pages.push(currentPage + 1);
    }

    return (
        <div className="mt-6 flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrevious}
                className="rounded-lg border border-slate-800 px-3 py-2 text-slate-400 transition hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Page Numbers */}
            {pages.map((page) => {
                const isActive = page === currentPage;
                return (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        disabled={isActive}
                        className={`rounded-lg border px-3 py-2 font-medium transition ${isActive
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white"
                            }`}
                    >
                        {page}
                    </button>
                );
            })}

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="rounded-lg border border-slate-800 px-3 py-2 text-slate-400 transition hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
}
