import { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { mocked } from 'ts-jest/utils';

import API from '../../../api';
import ValuesSchema from './';
jest.mock('../../../api');

const getMockValuesSchema = (fixtureId: string): JSONSchema => {
  return require(`./__fixtures__/index/${fixtureId}.json`) as JSONSchema;
};

const mockHistoryReplace = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as {}),
  useHistory: () => ({
    replace: mockHistoryReplace,
  }),
}));

const defaultProps = {
  packageId: 'id',
  version: '0.1.0',
  hasValuesSchema: true,
  visibleValuesSchema: false,
  normalizedName: 'pkg',
};

describe('ValuesSchema', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates snapshot', async () => {
    const mockValuesSchema = getMockValuesSchema('1');
    mocked(API).getValuesSchema.mockResolvedValue(mockValuesSchema);

    const { asFragment } = render(<ValuesSchema {...defaultProps} visibleValuesSchema />);

    await waitFor(() => {
      expect(API.getValuesSchema).toHaveBeenCalledTimes(1);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Render', () => {
    it('renders component', async () => {
      const mockValuesSchema = getMockValuesSchema('2');
      mocked(API).getValuesSchema.mockResolvedValue(mockValuesSchema);

      render(<ValuesSchema {...defaultProps} />);

      const btn = screen.getByRole('button', { name: /Open values schema modal/ });
      expect(btn).toBeInTheDocument();
      userEvent.click(btn);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(1);
        expect(API.getValuesSchema).toHaveBeenCalledWith(defaultProps.packageId, defaultProps.version);
      });
    });

    it('renders disabled button when package has not ValuesSchema and does not call getValuesSchema', async () => {
      render(<ValuesSchema {...defaultProps} hasValuesSchema={false} />);

      const btn = screen.getByRole('button', { name: /Open values schema modal/ });
      expect(btn).toHaveClass('disabled');

      expect(API.getValuesSchema).toHaveBeenCalledTimes(0);
    });

    it('opens modal', async () => {
      const mockValuesSchema = getMockValuesSchema('3');
      mocked(API).getValuesSchema.mockResolvedValue(mockValuesSchema);

      render(<ValuesSchema {...defaultProps} />);

      const btn = screen.getByRole('button', { name: /Open values schema modal/ });
      userEvent.click(btn);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(1);
        expect(mockHistoryReplace).toHaveBeenCalledTimes(1);
        expect(mockHistoryReplace).toHaveBeenCalledWith({
          search: '?modal=values-schema',
          state: {
            fromStarredPage: undefined,
            searchUrlReferer: undefined,
          },
        });
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Values schema reference')).toBeInTheDocument();
    });

    it('closes modal', async () => {
      const mockValuesSchema = getMockValuesSchema('4');
      mocked(API).getValuesSchema.mockResolvedValue(mockValuesSchema);

      render(<ValuesSchema {...defaultProps} visibleValuesSchema />);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(1);
      });

      const close = screen.getByRole('button', { name: 'Close modal' });
      userEvent.click(close);

      waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(mockHistoryReplace).toHaveBeenCalledTimes(1);
        expect(mockHistoryReplace).toHaveBeenCalledWith({
          search: '',
          state: {
            fromStarredPage: undefined,
            searchUrlReferer: undefined,
          },
        });
      });
    });

    it('calls again to getValuesSchema when version is different', async () => {
      const mockValuesSchema = getMockValuesSchema('5');
      mocked(API).getValuesSchema.mockResolvedValue(mockValuesSchema);

      const { rerender } = render(<ValuesSchema {...defaultProps} />);

      const btn = screen.getByRole('button', { name: /Open values schema modal/ });
      userEvent.click(btn);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(1);
        expect(API.getValuesSchema).toHaveBeenCalledWith(defaultProps.packageId, defaultProps.version);
      });

      expect(await screen.findByText('Values schema reference')).toBeInTheDocument();

      const close = screen.getByText('Close');
      userEvent.click(close);

      rerender(<ValuesSchema {...defaultProps} version="1.0.0" />);

      userEvent.click(btn);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(2);
        expect(API.getValuesSchema).toHaveBeenCalledWith(defaultProps.packageId, '1.0.0');
      });

      expect(await screen.findByText('Values schema reference')).toBeInTheDocument();
    });

    it('calls again to getValuesSchema when packageId is different', async () => {
      const mockValuesSchema = getMockValuesSchema('6');
      mocked(API).getValuesSchema.mockResolvedValue(mockValuesSchema);

      const { rerender } = render(<ValuesSchema {...defaultProps} />);

      const btn = screen.getByRole('button', { name: /Open values schema modal/ });
      userEvent.click(btn);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(1);
        expect(API.getValuesSchema).toHaveBeenCalledWith(defaultProps.packageId, defaultProps.version);
      });

      expect(await screen.findByText('Values schema reference')).toBeInTheDocument();

      const close = screen.getByText('Close');
      userEvent.click(close);

      rerender(<ValuesSchema {...defaultProps} packageId="id2" />);

      userEvent.click(btn);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(2);
        expect(API.getValuesSchema).toHaveBeenCalledWith('id2', defaultProps.version);
      });

      expect(await screen.findByText('Values schema reference')).toBeInTheDocument();
    });

    it('does not call again to getValuesSchema when package is the same', async () => {
      const mockValuesSchema = getMockValuesSchema('7');
      mocked(API).getValuesSchema.mockResolvedValue(mockValuesSchema);

      render(<ValuesSchema {...defaultProps} />);

      const btn = screen.getByRole('button', { name: /Open values schema modal/ });
      userEvent.click(btn);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(1);
        expect(API.getValuesSchema).toHaveBeenCalledWith(defaultProps.packageId, defaultProps.version);
      });

      expect(await screen.findByText('Values schema reference')).toBeInTheDocument();

      const close = screen.getByText('Close');
      userEvent.click(close);

      expect(screen.queryByRole('dialog')).toBeNull();

      userEvent.click(btn);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(1);
      });

      expect(await screen.findByText('Values schema reference')).toBeInTheDocument();
    });

    it('renders JSON schema with refs', async () => {
      const mockValuesSchema = getMockValuesSchema('8');
      mocked(API).getValuesSchema.mockResolvedValue(mockValuesSchema);

      render(<ValuesSchema {...defaultProps} />);

      const btn = screen.getByRole('button', { name: /Open values schema modal/ });
      userEvent.click(btn);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(1);
        expect(API.getValuesSchema).toHaveBeenCalledWith(defaultProps.packageId, defaultProps.version);
      });

      expect(await screen.findByText('env:')).toBeInTheDocument();

      expect(screen.getByText('image:')).toBeInTheDocument();
      expect(screen.getByText('array')).toBeInTheDocument();
      expect(screen.getByText('(unique)')).toBeInTheDocument();
      expect(screen.getAllByText(/\[\]/g)).toHaveLength(2);
    });

    it('renders complex full JSON', async () => {
      const mockValuesSchema = getMockValuesSchema('9');
      mocked(API).getValuesSchema.mockResolvedValue(mockValuesSchema);

      render(<ValuesSchema {...defaultProps} />);

      const btn = screen.getByRole('button', { name: /Open values schema modal/ });
      userEvent.click(btn);

      await waitFor(() => {
        expect(API.getValuesSchema).toHaveBeenCalledTimes(1);
        expect(API.getValuesSchema).toHaveBeenCalledWith(defaultProps.packageId, defaultProps.version);
      });

      expect(await screen.findByText('Values schema reference')).toBeInTheDocument();

      expect(screen.getByText('# CMAK operator Helm values')).toBeInTheDocument();
      expect(screen.getByText('# ui container k8s settings')).toBeInTheDocument();
      expect(screen.getByText('ui:')).toBeInTheDocument();
      expect(screen.getByText('# extra cmd line arguments')).toBeInTheDocument();
      expect(screen.getByText('extraArgs:')).toBeInTheDocument();
      expect(screen.getAllByText('[]')).toHaveLength(2);
      expect(screen.getAllByText('# resource requests and limits')).toHaveLength(2);
      expect(screen.getAllByText('resources:')).toHaveLength(2);
      expect(screen.getAllByText('# resource limits')).toHaveLength(2);
      expect(screen.getAllByText('limits:')).toHaveLength(2);
      expect(screen.getAllByText('{}')).toHaveLength(14);
      expect(screen.getAllByText('# resource requests')).toHaveLength(2);
      expect(screen.getAllByText('requests:')).toHaveLength(2);
      expect(
        screen.getByText('# provide key value base pairs for consumer properties according to java docs')
      ).toBeInTheDocument();
      expect(screen.getByText('consumerProperties:')).toBeInTheDocument();
      expect(screen.getByText('# Consumer SSL configuration')).toBeInTheDocument();
      expect(screen.getByText('consumerPropertiesSsl:')).toBeInTheDocument();
      expect(screen.getAllByText('null')).toHaveLength(26);
      expect(screen.getByText('# keystore configuration')).toBeInTheDocument();
      expect(screen.getByText('keystore:')).toBeInTheDocument();
      expect(screen.getAllByText('type:')).toHaveLength(2);
      expect(screen.getAllByText('value:')).toHaveLength(2);
      expect(screen.getAllByText('password:')).toHaveLength(2);
      expect(screen.getByText('# truststore configuration')).toBeInTheDocument();
      expect(screen.getByText('truststore:')).toBeInTheDocument();
      expect(screen.getByText('# zk container k8s settings')).toBeInTheDocument();
      expect(screen.getByText('zk:')).toBeInTheDocument();
      expect(screen.getByText('# zk version')).toBeInTheDocument();
      expect(screen.getByText('version:')).toBeInTheDocument();
      expect(screen.getAllByText('3.6.1')).toHaveLength(2);
      expect(screen.getAllByText('# resource requests and limits')).toHaveLength(2);
      expect(screen.getAllByText('resources:')).toHaveLength(2);
      expect(screen.getByText('# cmak instance settings')).toBeInTheDocument();
      expect(screen.getByText('cmak:')).toBeInTheDocument();
      expect(screen.getAllByText('jmxSsl:')).toHaveLength(2);
      expect(screen.getAllByText('false')).toHaveLength(20);
      expect(screen.getAllByText('# either cluster enabled')).toHaveLength(2);
      expect(screen.getAllByText('enabled:')).toHaveLength(2);
      expect(screen.getAllByText('true')).toHaveLength(14);
      expect(screen.getAllByText('jmxPass:')).toHaveLength(2);
      expect(screen.getAllByText('jmxUser:')).toHaveLength(2);
      expect(screen.getAllByText('jmxEnabled:')).toHaveLength(2);
      expect(screen.getAllByText('kafkaVersion:')).toHaveLength(2);
      expect(screen.getAllByText('2.2.0')).toHaveLength(4);
      expect(screen.getAllByText('pollConsumers:')).toHaveLength(2);
      expect(screen.getAllByText('filterConsumers:')).toHaveLength(2);
      expect(screen.getAllByText('logkafkaEnabled:')).toHaveLength(2);
      expect(screen.getAllByText('displaySizeEnabled:')).toHaveLength(2);
      expect(screen.getAllByText('activeOffsetCacheEnabled:')).toHaveLength(2);
      expect(screen.getByText('# display name for the cluster')).toBeInTheDocument();
      expect(screen.getByText('name:')).toBeInTheDocument();
      expect(screen.getAllByText('# curator framework settings for zookeeper')).toHaveLength(2);
      expect(screen.getAllByText('curatorConfig:')).toHaveLength(2);
      expect(screen.getAllByText('zkMaxRetry:')).toHaveLength(2);
      expect(screen.getAllByText('100')).toHaveLength(8);
      expect(screen.getAllByText('maxSleepTimeMs:')).toHaveLength(2);
      expect(screen.getAllByText('1000')).toHaveLength(4);
      expect(screen.getAllByText('baseSleepTimeMs:')).toHaveLength(2);
      expect(screen.getByText('# zookeeper connection string')).toBeInTheDocument();
      expect(screen.getByText('zkConnect:')).toBeInTheDocument();
      expect(screen.getByText('# common config for all declared clusters')).toBeInTheDocument();
      expect(screen.getAllByText('curatorConfig:')).toHaveLength(2);
      expect(screen.getByText('# ingress configuration')).toBeInTheDocument();
      expect(screen.getByText('ingress:')).toBeInTheDocument();
      expect(screen.getByText('# use TLS secret')).toBeInTheDocument();
      expect(screen.getByText('tls:')).toBeInTheDocument();
      expect(screen.getByText('# Secret name to attach to the ingress object')).toBeInTheDocument();
      expect(screen.getByText('secret:')).toBeInTheDocument();
      expect(screen.getByText('# ingress host')).toBeInTheDocument();
      expect(screen.getByText('host:')).toBeInTheDocument();
      expect(screen.getByText('# ingress path')).toBeInTheDocument();
      expect(screen.getByText('path:')).toBeInTheDocument();
      expect(screen.getByText('# optional ingress labels')).toBeInTheDocument();
      expect(screen.getByText('labels:')).toBeInTheDocument();
      expect(screen.getByText('# optional ingress annotations')).toBeInTheDocument();
      expect(screen.getByText('annotations:')).toBeInTheDocument();
      expect(screen.getByText('# reconciliation job config')).toBeInTheDocument();
      expect(screen.getByText('reconcile:')).toBeInTheDocument();
      expect(screen.getByText('# cron expression for periodic reconciliation')).toBeInTheDocument();
      expect(screen.getByText('schedule:')).toBeInTheDocument();
      expect(screen.getAllByText('"*/3 * * * *"')).toHaveLength(2);
      expect(screen.getByText('# allow overwrite Zookeeper settings of CMAK')).toBeInTheDocument();
      expect(screen.getByText('overwriteZk:')).toBeInTheDocument();
      expect(screen.getByText('# number of failed jobs to keep')).toBeInTheDocument();
      expect(screen.getByText('failedJobsHistoryLimit:')).toBeInTheDocument();
      expect(screen.getByText('# number of completed jobs to keep')).toBeInTheDocument();
      expect(screen.getByText('successfulJobsHistoryLimit:')).toBeInTheDocument();
      expect(screen.getByText('# docker registry for all images of the chart')).toBeInTheDocument();
      expect(screen.getByText('imageRegistry:')).toBeInTheDocument();
      expect(screen.getAllByText('docker.io')).toHaveLength(2);
      expect(screen.getAllByText('Required')).toHaveLength(18);
      expect(screen.getAllByText('object')).toHaveLength(21);
      expect(screen.getAllByText('array')).toHaveLength(2);
      expect(screen.getByText('[string]')).toBeInTheDocument();
      expect(screen.getAllByText('boolean')).toHaveLength(17);
      expect(screen.getAllByText('integer')).toHaveLength(8);
      expect(screen.getAllByRole('combobox', { name: 'Type selection' })).toHaveLength(8);
    });

    it('closes modal when a new pkg is open', async () => {
      const mockValuesSchema = getMockValuesSchema('10');
      mocked(API).getValuesSchema.mockResolvedValue(mockValuesSchema);

      const { rerender } = render(<ValuesSchema {...defaultProps} />);

      const btn = screen.getByRole('button', { name: /Open values schema modal/ });
      userEvent.click(btn);

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(API.getValuesSchema).toHaveBeenCalledTimes(1);

      rerender(<ValuesSchema {...defaultProps} packageId="id2" />);

      waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
    });
  });
});
