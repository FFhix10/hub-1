import { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import compoundJSONSchemaYAML from '../../../utils/compoundJSONSchemaYAML';
import Schema from './Schema';

const defaultSchema = require('./__fixtures__/index/1.json') as JSONSchema;

const defaultProps = {
  pkgName: 'pkg',
  schema: defaultSchema,
  normalizedName: 'pkg-norm',
  onPathChange: jest.fn(),
};

describe('Schema', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates snapshot', () => {
    const { asFragment } = render(<Schema {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  describe('Render', () => {
    it('renders component', () => {
      render(<Schema {...defaultProps} />);

      expect(screen.getByText(`# ${defaultSchema.title}`)).toBeInTheDocument();
      const lines = screen.getAllByTestId('schemaLine');
      expect(lines).toHaveLength(97);

      waitFor(() => {
        expect(compoundJSONSchemaYAML).toHaveBeenCalledTimes(1);
      });
      expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
    });
  });
});
