import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
    it('shows initials when no image is available', () => {
        render(<Avatar name="Yadhu Kogat" variant="neutral" />);

        expect(screen.getByLabelText('Yadhu Kogat')).toHaveTextContent('Y');
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('replaces a failed image with initials instead of a broken-image icon', () => {
        render(
            <Avatar
                src="https://old-storage.example/missing.jpg"
                name="Yadhu Kogat"
                variant="neutral"
            />,
        );

        fireEvent.error(screen.getByRole('img', { name: 'Yadhu Kogat' }));

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Yadhu Kogat')).toHaveTextContent('Y');
    });
});
