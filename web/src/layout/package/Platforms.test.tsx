import { render, screen } from '@testing-library/react';
import React from 'react';

import Platforms from './Platforms';

const defaultProps = {
  platforms: ['darwin', 'linux', 'windows'],
};

describe('Platforms', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates snapshot', () => {
    const { asFragment } = render(<Platforms {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  describe('Render', () => {
    it('renders component', () => {
      render(<Platforms {...defaultProps} />);

      expect(screen.getByText('Supported platforms')).toBeInTheDocument();
      const platforms = screen.getAllByTestId('platformBadge');
      expect(platforms).toHaveLength(3);
    });

    it('renders only uniq platfoms', () => {
      render(<Platforms platforms={[...defaultProps.platforms, 'darwin']} />);

      const platforms = screen.getAllByTestId('platformBadge');
      expect(platforms).toHaveLength(3);
    });

    it('does not render component if platforms is undefined', () => {
      const { container } = render(<Platforms />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
