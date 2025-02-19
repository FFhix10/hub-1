import { render, screen } from '@testing-library/react';
import React from 'react';

import Content from './Content';
jest.mock('../../../api');

jest.mock('moment', () => ({
  ...(jest.requireActual('moment') as {}),
  unix: () => ({
    isAfter: () => false,
    fromNow: () => '3 hours ago',
    format: () => '7 Oct, 2020',
  }),
}));

const mockHistoryReplace = jest.fn();
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as {}),
  useHistory: () => ({
    replace: mockHistoryReplace,
  }),
}));

const changelog = [
  {
    version: '0.8.0',
    ts: 1604048487,
    prerelease: true,
    containsSecurityUpdates: false,
    changes: [
      { description: 'Add JSON schema for Artifact Hub Helm chart' },
      { description: 'Some improvements in Artifact Hub Helm chart' },
      { description: 'Track Helm charts values schema' },
      { description: 'Add endpoint to get Helm charts values schema' },
      { description: 'Bump Trivy to 0.12.0' },
      { description: 'Display containers images in Helm packages' },
      { description: 'Remove internal requests limiter' },
      { description: 'Upgrade frontend dependencies to fix some security vulnerabilities' },
      { description: 'Add packages security report documentation' },
      { description: 'Some bugs fixes and improvements' },
    ],
  },
  {
    version: '0.5.0',
    ts: 1604048487,
    prerelease: false,
    containsSecurityUpdates: true,
    changes: [
      { description: 'Introduce verified publisher concept' },
      { description: 'Add dark mode support' },
      { description: 'Improve search facets filtering' },
      { description: 'Notify repository owners of tracking errors' },
      { description: 'Track and list Helm charts dependencies' },
      { description: 'Display links to source in Helm packages' },
      { description: 'Add repositories kind filter to tracker' },
      { description: 'Add Monocular compatible search API' },
      { description: 'Some bugs fixes and improvements' },
    ],
  },
];

const defaultProps = {
  changelog: changelog,
  normalizedName: 'test',
  activeVersionIndex: 0,
  repository: {
    repositoryId: '0acb228c-17ab-4e50-85e9-ffc7102ea423',
    kind: 0,
    name: 'stable',
    url: 'repoUrl',
    userAlias: 'user',
  },
  setActiveVersionIndex: jest.fn(),
  setOpenStatus: jest.fn(),
};

describe('Changelog content ', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValueOnce(new Date('2019/11/24').getTime());
  });

  it('creates snapshot', () => {
    const { asFragment } = render(<Content {...defaultProps} />);

    expect(asFragment()).toMatchSnapshot();
  });

  describe('Render', () => {
    it('renders component', async () => {
      render(<Content {...defaultProps} />);

      const titles = screen.getAllByTestId('changelogBlockTitle');
      expect(titles[0]).toHaveTextContent('0.8.0');
      expect(titles[1]).toHaveTextContent('0.5.0');

      expect(screen.getByLabelText('Open version 0.8.0')).toBeInTheDocument();
      expect(screen.getByLabelText('Open version 0.5.0')).toBeInTheDocument();

      expect(screen.getByText('Contains security updates')).toBeInTheDocument();
      expect(screen.getByText('Pre-release')).toBeInTheDocument();
    });
  });
});
