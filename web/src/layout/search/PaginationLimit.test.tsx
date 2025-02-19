import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import PaginationLimit from './PaginationLimit';

const updateLimitMock = jest.fn();

const defaultProps = {
  limit: 20,
  updateLimit: updateLimitMock,
  disabled: false,
};

describe('Filters', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates snapshot', () => {
    const { asFragment } = render(<PaginationLimit {...defaultProps} />);

    expect(asFragment()).toMatchSnapshot();
  });

  describe('Render', () => {
    it('renders component', () => {
      render(<PaginationLimit {...defaultProps} />);

      expect(screen.getByLabelText('pagination-limit')).toBeInTheDocument();
      expect(screen.getByText('20'));
      expect(screen.getByText('40'));
      expect(screen.getByText('60'));
    });

    it('calls updateLimit on select change', () => {
      render(<PaginationLimit {...defaultProps} />);

      const select = screen.getByLabelText('pagination-limit');
      userEvent.selectOptions(select, '60');

      expect(updateLimitMock).toBeCalledTimes(1);
      expect(updateLimitMock).toHaveBeenCalledWith(60);
    });

    it('renders disabled select component', () => {
      const props = { ...defaultProps, disabled: true };
      render(<PaginationLimit {...props} />);

      const select = screen.getByLabelText('pagination-limit');
      expect(select).toBeDisabled();
    });

    it('calls updateLimit with default value when limit is not valid', () => {
      render(<PaginationLimit {...defaultProps} limit={15} />);

      expect(updateLimitMock).toBeCalledTimes(1);
      expect(updateLimitMock).toHaveBeenCalledWith(20);
    });
  });
});
