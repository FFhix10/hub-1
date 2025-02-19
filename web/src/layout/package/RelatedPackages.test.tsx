import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { Package } from '../../types';
import RelatedPackages from './RelatedPackages';

const mockPackages: Package[] = [
  {
    packageId: 'e375216d-d876-45c2-a114-8e01651769f1',
    name: 'centrifugo',
    normalizedName: 'test',
    deprecated: false,
    signed: false,
    ts: 1,
    description: 'Centrifugo is a real-time messaging server.',
    logoImageId: 'cc7ac35f-abd3-4594-a375-aebfccbfe11e',
    appVersion: '2.1.0',
    repository: {
      repositoryId: '0acb228c-17ab-4e50-85e9-ffc7102ea423',
      kind: 0,
      userAlias: 'user',
      name: 'stable',
      url: 'url',
    },
  },
  {
    packageId: 'e252a4f2-dc8a-429b-8e26-6d093d0a59ca',
    name: 'kafka',
    description: 'Apache Kafka is publish-subscribe messaging rethought as a distributed commit log.',
    appVersion: '5.0.1',
    normalizedName: 'test',
    deprecated: false,
    signed: false,
    ts: 1,
    repository: {
      repositoryId: '0acb228c-17ab-4e50-85e9-ffc7102ea423',
      kind: 0,
      userAlias: 'user',
      name: 'incubator',
      url: 'url',
    },
  },
  {
    packageId: '7304da81-3516-4b81-8ca3-77f1fd1a68e0',
    name: 'kafka-topics-ui',
    normalizedName: 'test',
    deprecated: false,
    signed: false,
    ts: 1,
    description:
      "This is a web tool for the confluentinc/kafka-rest proxy in order to browse Kafka topics and understand what's happening on your cluster. Find topics / view topic metadata / browse topic data (kafka messages) / view topic configuration / download data.",
    logoImageId: 'c4b74ab7-dfcd-440c-9ffb-7b9187ea13e2',
    appVersion: 'v0.9.4',
    repository: {
      repositoryId: '0acb228c-17ab-4e50-85e9-ffc7102ea423',
      kind: 0,
      userAlias: 'user',
      name: 'dhiatn',
      url: 'url',
    },
  },
  {
    packageId: '51fecd35-520c-413f-949f-f0b22081944f',
    name: 'nats',
    normalizedName: 'test',
    deprecated: false,
    signed: false,
    ts: 1,
    description: 'An open-source, cloud-native messaging system',
    logoImageId: '9d48cd3f-d6f0-499e-b070-4dd30def1306',
    appVersion: '2.1.4',
    repository: {
      repositoryId: '0acb228c-17ab-4e50-85e9-ffc7102ea423',
      kind: 0,
      userAlias: 'user',
      name: 'stable',
      url: 'url',
    },
  },
  {
    packageId: '2b09d831-626f-4968-bb95-32cb398c729c',
    name: 'rabbitmq',
    normalizedName: 'test',
    deprecated: false,
    signed: false,
    ts: 1,
    description: 'Open source message broker software that implements the Advanced Message Queuing Protocol (AMQP)',
    logoImageId: '2af77252-fa22-4b56-97c2-2e0da1307601',
    appVersion: '3.8.2',
    repository: {
      repositoryId: '0acb228c-17ab-4e50-85e9-ffc7102ea423',
      kind: 0,
      userAlias: 'user',
      name: 'stable',
      url: 'url',
    },
  },
  {
    packageId: 'efd6bafa-9313-499a-a4ea-aa16b819be91',
    name: 'rabbitmq-ha',
    normalizedName: 'test',
    deprecated: false,
    signed: false,
    ts: 1,
    description:
      'Highly available RabbitMQ cluster, the open source message broker software that implements the Advanced Message Queuing Protocol (AMQP).',
    logoImageId: '2af77252-fa22-4b56-97c2-2e0da1307601',
    appVersion: '3.8.0',
    repository: {
      repositoryId: '0acb228c-17ab-4e50-85e9-ffc7102ea423',
      kind: 0,
      userAlias: 'user',
      name: 'stable',
      url: 'url',
    },
  },
  {
    packageId: 'a9b92a71-7436-48fe-b82e-b31b48c33842',
    name: 'schema-registry',
    normalizedName: 'test',
    deprecated: false,
    signed: false,
    ts: 1,
    description:
      'Schema Registry provides a serving layer for your metadata. It provides a RESTful interface for storing and retrieving Avro schemas. It stores a versioned history of all schemas, provides multiple compatibility settings and allows evolution of schemas according to the configured compatibility setting. It provides serializers that plug into Kafka clients that handle schema storage and retrieval for Kafka messages that are sent in the Avro format.',
    appVersion: '5.0.1',
    repository: {
      repositoryId: '0acb228c-17ab-4e50-85e9-ffc7102ea423',
      kind: 0,
      userAlias: 'user',
      name: 'incubator',
      url: 'url',
    },
  },
];

describe('RelatedPackages', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = render(
      <Router>
        <RelatedPackages packages={mockPackages} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  describe('Render', () => {
    it('renders component with 7 related packages', () => {
      render(
        <Router>
          <RelatedPackages packages={mockPackages} />
        </Router>
      );

      expect(screen.getByText('Related packages')).toBeInTheDocument();
      expect(screen.getAllByTestId('relatedPackageLink')).toHaveLength(7);
    });
  });

  describe('does not render component', () => {
    it('when packages list is empty', () => {
      const { container } = render(
        <Router>
          <RelatedPackages packages={[]} />
        </Router>
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
