// Older Paid rows may have paidAmount=0. Their status still means fully paid.
export function getCollectedAmount(transaction) {
    const amount = Math.max(0, Number(transaction?.amount) || 0);
    if (transaction?.paymentStatus === 'Paid') return amount;
    if (transaction?.paymentStatus === 'Partial') {
        return Math.min(amount, Math.max(0, Number(transaction.paidAmount) || 0));
    }
    return 0;
}

export function getOutstandingAmount(transaction) {
    if (!['Pending', 'Partial'].includes(transaction?.paymentStatus)) return 0;
    return Math.max(0, (Number(transaction.amount) || 0) - getCollectedAmount(transaction));
}
