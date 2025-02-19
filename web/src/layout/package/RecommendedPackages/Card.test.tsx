import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import RecommendedPackageCard from './Card';

const defaultProps = {
  recommendation: {
    kind: 0,
    normalizedName: 'artifact-hub',
    repoName: 'artifact-hub',
    url: '/packages/helm/artifact-hub/artifact-hub',
  },
};

describe('RecommendedPackageCard', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates snapshot', () => {
    const { asFragment } = render(
      <Router>
        <RecommendedPackageCard {...defaultProps} />
      </Router>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  describe('Render', () => {
    it('renders component', () => {
      render(
        <Router>
          <RecommendedPackageCard {...defaultProps} />
        </Router>
      );

      const pkg = screen.getByTestId('recommended-pkg');
      expect(pkg).toBeInTheDocument();
      expect(pkg).toHaveTextContent('Helm chartartifact-hubREPO: artifact-hub');
    });

    it('opens package', () => {
      render(
        <Router>
          <RecommendedPackageCard {...defaultProps} />
        </Router>
      );

      const pkg = screen.getByTestId('recommended-pkg');
      userEvent.click(pkg);

      expect(window.location.pathname).toBe('/packages/helm/artifact-hub/artifact-hub');
    });
  });
});
