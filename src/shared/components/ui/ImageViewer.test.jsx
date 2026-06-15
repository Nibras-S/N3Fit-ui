/**
 * ImageViewer smoke test.
 *
 * Covers the DOM-level contract of the full-screen photo preview: it renders
 * the image only when open, and closes via the X button and the Escape key.
 * The gesture maths (pinch / pan / double-tap) lean on real layout + Pointer
 * Events that jsdom doesn't model, so they're left to manual/device testing —
 * this is the "does it mount and close" smoke test the conventions require.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageViewer from './ImageViewer';

describe('ImageViewer', () => {
    test('renders no image while closed', () => {
        render(<ImageViewer isOpen={false} onClose={() => {}} src="/avatar.jpg" alt="Jane Doe" />);
        expect(screen.queryByRole('img')).toBeNull();
    });

    test('shows the full image when open', () => {
        render(<ImageViewer isOpen onClose={() => {}} src="/avatar.jpg" alt="Jane Doe" />);
        const img = screen.getByRole('img', { name: 'Jane Doe' });
        expect(img).toHaveAttribute('src', '/avatar.jpg');
    });

    test('calls onClose from the close button', () => {
        const onClose = jest.fn();
        render(<ImageViewer isOpen onClose={onClose} src="/avatar.jpg" alt="Jane Doe" />);
        fireEvent.click(screen.getByRole('button', { name: /close image preview/i }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose on Escape', () => {
        const onClose = jest.fn();
        render(<ImageViewer isOpen onClose={onClose} src="/avatar.jpg" alt="Jane Doe" />);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
