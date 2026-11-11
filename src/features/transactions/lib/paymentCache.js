// Payment writes affect more than the transaction row (including deferred
// renewals). Use the same refresh for local mutations and remote socket events.
export function refreshPaymentQueries(queryClient) {
    return Promise.all([
        ['transactions'], ['members'], ['memberships'], ['dashboard'],
        ['reports'], ['expenses', 'summary'], ['reminders'],
    ].map(queryKey => queryClient.invalidateQueries({ queryKey })));
}

export function updatePaymentCache(queryClient, transaction) {
    // Merge into existing rows to retain enriched fields such as member photos.
    const updateRows = rows => Array.isArray(rows)
        ? rows.map(row => row._id === transaction._id ? { ...row, ...transaction } : row)
        : rows;
    queryClient.setQueriesData({ queryKey: ['transactions', 'list'] }, updateRows);
    const memberId = transaction.memberId?._id || transaction.memberId;
    if (memberId) {
        queryClient.setQueriesData({ queryKey: ['members', 'detail', memberId, 'transactions'] }, updateRows);
    }
    queryClient.setQueriesData({ queryKey: ['transactions', 'detail', transaction._id] }, old => (
        old ? { ...old, ...transaction } : old
    ));
}
