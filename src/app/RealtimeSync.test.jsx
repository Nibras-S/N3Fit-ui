/* eslint-disable import/first */
const mockHandlers = new Map();
const mockSocket = {
    on: jest.fn((event, handler) => {
        if (!mockHandlers.has(event)) mockHandlers.set(event, new Set());
        mockHandlers.get(event).add(handler);
    }),
    off: jest.fn((event, handler) => mockHandlers.get(event)?.delete(handler)),
    connect: jest.fn(() => mockHandlers.get('connect')?.forEach(handler => handler())),
    disconnect: jest.fn(),
    emit: jest.fn(),
};
const mockApi = { get: jest.fn(async () => ({ data: [] })) };
let mockUser;
jest.mock('../shared/hooks/useSocket', () => ({
    __esModule: true,
    default: {
        on: (...args) => mockSocket.on(...args), off: (...args) => mockSocket.off(...args),
        connect: (...args) => mockSocket.connect(...args), disconnect: (...args) => mockSocket.disconnect(...args),
        emit: (...args) => mockSocket.emit(...args),
    },
}));
jest.mock('../features/auth/context/AuthContext', () => ({ useAuth: () => ({ user: mockUser, api: mockApi }) }));
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn() } }));

import React from 'react';
import { render, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from '../features/notifications/context/NotificationContext';
import RealtimeSync from './RealtimeSync';

const keys = [
    ['transactions', 'list'], ['members', 'list'], ['members', 'detail', 'm1'],
    ['dashboard', 'stats'], ['reports', 'income'], ['expenses', 'summary'],
    ['memberships', 'list'], ['reminders', 'list'],
];

beforeEach(() => {
    jest.useFakeTimers();
    mockHandlers.clear();
    jest.clearAllMocks();
    mockSocket.on.mockImplementation((event, handler) => {
        if (!mockHandlers.has(event)) mockHandlers.set(event, new Set());
        mockHandlers.get(event).add(handler);
    });
    mockSocket.off.mockImplementation((event, handler) => mockHandlers.get(event)?.delete(handler));
    mockSocket.connect.mockImplementation(() => mockHandlers.get('connect')?.forEach(handler => handler()));
    mockApi.get.mockResolvedValue({ data: [] });
    mockUser = { id: 'u1', role: 'staff', gymId: 'g1' };
});
afterEach(() => { jest.useRealTimers(); });

function setup() {
    const client = new QueryClient();
    keys.forEach(key => client.setQueryData(key, { old: true }));
    const view = render(<QueryClientProvider client={client}><NotificationProvider><RealtimeSync /></NotificationProvider></QueryClientProvider>);
    return { ...view, client };
}

it('subscribes before the delayed connection and refreshes payment-dependent data on remote events', async () => {
    const { client, unmount } = setup();
    expect(mockSocket.connect).not.toHaveBeenCalled();
    expect(mockHandlers.get('transaction:updated').size).toBe(1);
    await act(async () => { mockHandlers.get('transaction:updated').forEach(handler => handler({ _id: 't1' })); });
    keys.forEach(key => expect(client.getQueryState(key).isInvalidated).toBe(true));
    unmount();
    expect(mockHandlers.get('transaction:updated').size).toBe(0);
});

it('joins on initial connection and reconnect, then reloads missed changes after the room is joined', async () => {
    const { client } = setup();
    await act(async () => { jest.runOnlyPendingTimers(); });
    expect(mockSocket.emit).toHaveBeenCalledWith('join_gym');
    // Simulate a later reconnect after local caches were considered fresh.
    keys.forEach(key => client.setQueryData(key, { current: true }));
    await act(async () => { mockHandlers.get('connect').forEach(handler => handler()); });
    expect(mockSocket.emit.mock.calls.filter(([event]) => event === 'join_gym')).toHaveLength(2);
    await act(async () => { mockHandlers.get('gym:joined').forEach(handler => handler()); });
    keys.forEach(key => expect(client.getQueryState(key).isInvalidated).toBe(true));
});

it('cleans up payment listeners when the session ends', () => {
    const { rerender } = setup();
    mockUser = null;
    const client = new QueryClient();
    rerender(<QueryClientProvider client={client}><NotificationProvider><RealtimeSync /></NotificationProvider></QueryClientProvider>);
    expect(mockHandlers.get('transaction:updated').size).toBe(0);
});
