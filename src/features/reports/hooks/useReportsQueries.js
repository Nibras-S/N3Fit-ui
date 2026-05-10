import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/services/api';

const reportsKeys = {
    all: ['reports'],
    expense: (filter) => ['reports', 'expense', filter],
    income:  (filter) => ['reports', 'income',  filter],
};

function buildParams(filter) {
    const params = new URLSearchParams();
    if (filter?.startDate) params.set('startDate', filter.startDate);
    if (filter?.endDate)   params.set('endDate',   filter.endDate);
    return params.toString();
}

export function useExpenseReport(filter) {
    return useQuery({
        queryKey: reportsKeys.expense({ startDate: filter?.startDate || '', endDate: filter?.endDate || '' }),
        queryFn: async () => {
            const res = await api.get(`/reports/expense?${buildParams(filter)}`);
            return res.data;
        },
        // Keep the previous data while refetching so the UI doesn't flash empty
        // when the user changes the date range or a socket invalidation fires.
        keepPreviousData: true,
    });
}

export { reportsKeys };
