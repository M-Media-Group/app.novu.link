import { computed } from "vue";

interface Page {
    pageNumber: number;
    text: string;
    clickable: boolean;
    selected?: boolean;
}

interface RequiredProps {
    readonly totalItems: number;
    readonly currentPage: number;
    readonly resultsPerPage: number;
    readonly maxPages: number;
    readonly showPrevNext: boolean;
    readonly separatorText: string;
    readonly goToPage: boolean;
    readonly lastPage?: number | undefined;
}

const formatNumer = (number: number) => {
    // @todo think of how the NumberFormat could take the locale of the app
    return new Intl.NumberFormat().format(number);
};

export const usePages = (props: RequiredProps) => {
    /** An array of pages to show. We show x-1, then a separator, then the last page,. The first part length is the maxPages - 1 */
    const pages = computed(() => {
        const pages: Page[] = [];
        const maxPages = props.maxPages - 1;
        const currentPage = props.currentPage;
        const newTotalPages = totalPages.value;
        const halfMaxPages = Math.floor(maxPages / 2);

        // If the maxPages + 2 (the first and last page) is greater than the total pages, then we just show all the pages
        if (newTotalPages <= maxPages + 2) {
            for (let i = 1; i <= newTotalPages; i++) {
                pages.push({ pageNumber: i, text: formatNumer(i), clickable: true });
            }
            return pages;
        }

        const showFirstSeparator =
            currentPage > halfMaxPages &&
            // Or if we already will show the page in the second part, (e.g. to prevent 1 ... 1 2 3 4 5 ... 10)
            currentPage > halfMaxPages + 1 &&
            newTotalPages > maxPages;
        const showLastSeparator =
            currentPage < newTotalPages - halfMaxPages &&
            // Or if we already will show the page in the second part, (e.g. to prevent 1 ... 1 2 3 4 5 ... 10)
            currentPage < newTotalPages - halfMaxPages - 1 &&
            newTotalPages > maxPages;

        const firstPageToShow = showFirstSeparator ? currentPage - halfMaxPages : 1;
        const lastPageToShow = showLastSeparator
            ? currentPage + halfMaxPages
            : newTotalPages;
        if (showFirstSeparator) {
            pages.push({ pageNumber: 1, text: formatNumer(1), clickable: true });
            pages.push({ pageNumber: 0, text: props.separatorText, clickable: false });
        }
        for (let i = firstPageToShow; i <= lastPageToShow; i++) {
            pages.push({ pageNumber: i, text: formatNumer(i), clickable: true });
        }
        if (showLastSeparator) {
            pages.push({ pageNumber: 0, text: props.separatorText, clickable: false });
            pages.push({
                pageNumber: newTotalPages,
                text: formatNumer(newTotalPages),
                clickable: true,
            });
        }
        return pages;
    });


    const totalPages = computed(() => {
        const computedTotal = Math.ceil(props.totalItems / props.resultsPerPage);
        return props.lastPage
            ? Math.min(computedTotal, props.lastPage)
            : computedTotal;
    });


    return {
        pages,
        totalPages,
    }
}